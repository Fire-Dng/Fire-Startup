'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BraceletConfig, CustomMaterial, Placement3D } from '@/types';
import { AppIcon } from '@/components/ui/AppIcon';
import { THREE_COLORS } from '@/config/theme';
import { useI18n } from '@/i18n/I18nContext';

export interface ThreeCanvasViewerProps {
  mode: 'preview' | 'studio' | 'inspector';
  productPreset: string;
  productGlbUrl?: string;
  baseColor: string;
  strapColor: string;
  placements: Placement3D[];
  braceletConfig?: BraceletConfig;
  selectedPlacementId?: string | null;
  activeMaterialToPlace?: CustomMaterial | null;
  onSurfacePlace?: (
    position: [number, number, number],
    normal: [number, number, number],
    slotIndex?: number
  ) => void;
  onSelectPlacement?: (placementId: string | null) => void;
  onUpdatePlacement?: (placementId: string, patch: Partial<Placement3D>) => void;
  onRemovePlacement?: (placementId: string) => void;
  autoRotate?: boolean;
  className?: string;
}

// ============================================================================
// PROCEDURAL CANVAS WOVEN TEXTURE GENERATOR (NO WIREFRAME Z-FIGHTING)
// ============================================================================

let cachedNetBumpMap: THREE.CanvasTexture | null = null;

import { buildProceduralAccessoryMesh } from './builders/accessoryMesh';
import { alignGroupToSurface, buildProceduralProductGroup } from './builders/productGroup';

export function ThreeCanvasViewer({
  mode,
  productPreset,
  productGlbUrl,
  baseColor,
  strapColor,
  placements,
  braceletConfig,
  selectedPlacementId,
  activeMaterialToPlace,
  onSurfacePlace,
  onSelectPlacement,
  autoRotate = false,
  className = '',
}: ThreeCanvasViewerProps) {
  const { t } = useI18n();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const productGroupRef = useRef<THREE.Group | null>(null);
  const placementsGroupRef = useRef<THREE.Group | null>(null);
  const ghostMeshRef = useRef<THREE.Group | null>(null);

  const [webglReady, setWebglReady] = useState(true);
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{ id: string; index: number; x: number; y: number; name: string }>
  >([]);

  const isBraceletMode = (productPreset || '').toLowerCase().includes('bracelet');

  const latestPropsRef = useRef({
    mode,
    activeMaterialToPlace,
    onSurfacePlace,
    onSelectPlacement,
    placements,
    isBraceletMode,
  });

  useEffect(() => {
    latestPropsRef.current = {
      mode,
      activeMaterialToPlace,
      onSurfacePlace,
      onSelectPlacement,
      placements,
      isBraceletMode,
    };
  }, [mode, activeMaterialToPlace, onSurfacePlace, onSelectPlacement, placements, isBraceletMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglReady(false);
      return;
    }

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.15, 4.1);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.9;
    controls.maxDistance = 7.2;
    controls.autoRotate = mode === 'preview' || autoRotate;
    controls.autoRotateSpeed = 1.1;
    controlsRef.current = controls;

    // Warm Natural Coastal Daylight Setup
    const ambientLight = new THREE.AmbientLight(THREE_COLORS.ambientLight, 0.92);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(
      THREE_COLORS.hemisphereSky,
      THREE_COLORS.hemisphereGround,
      0.65
    );
    hemisphereLight.position.set(0, 6, 0);
    scene.add(hemisphereLight);

    const mainDirLight = new THREE.DirectionalLight(THREE_COLORS.directionalMain, 1.35);
    mainDirLight.position.set(4, 6, 5);
    mainDirLight.castShadow = true;
    scene.add(mainDirLight);

    const rimLight = new THREE.DirectionalLight(THREE_COLORS.directionalRim, 0.55);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Raw Limestone Studio Plinth Disc
    const pedestalGeo = new THREE.CylinderGeometry(1.68, 1.76, 0.05, 56);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: THREE_COLORS.plinthStone,
      roughness: 0.88,
      metalness: 0.02,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.16;
    pedestal.receiveShadow = true;
    pedestal.userData.isPlaceableSurface = false;
    scene.add(pedestal);

    const productHolder = new THREE.Group();
    scene.add(productHolder);
    productGroupRef.current = productHolder;

    const placementsHolder = new THREE.Group();
    scene.add(placementsHolder);
    placementsGroupRef.current = placementsHolder;

    // Raycaster & Pointer Interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const getPlaceableMeshes = (): THREE.Object3D[] => {
      const list: THREE.Object3D[] = [];
      if (!productGroupRef.current) return list;
      productGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && child.userData?.isPlaceableSurface === true) {
          list.push(child);
        }
      });
      return list;
    };

    const computeAccurateHitTransform = (hit: THREE.Intersection) => {
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
      const worldNormal = (hit.face ? hit.face.normal.clone() : new THREE.Vector3(0, 1, 0))
        .applyMatrix3(normalMatrix)
        .normalize();

      if (worldNormal.dot(raycaster.ray.direction) > 0) {
        worldNormal.negate();
      }

      const localPoint = productGroupRef.current
        ? productGroupRef.current.worldToLocal(hit.point.clone())
        : hit.point.clone();

      return { localPoint, worldNormal };
    };

    const updatePointerCoords = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerMove = (event: PointerEvent) => {
      const { mode: curMode, activeMaterialToPlace: curActiveMat } = latestPropsRef.current;
      if (curMode !== 'studio' || !curActiveMat || !productGroupRef.current) {
        if (ghostMeshRef.current) {
          ghostMeshRef.current.visible = false;
        }
        return;
      }

      updatePointerCoords(event);
      raycaster.setFromCamera(pointer, camera);

      const placeableMeshes = getPlaceableMeshes();
      const intersects = raycaster.intersectObjects(placeableMeshes, false);
      const hit = intersects[0];

      if (hit) {
        if (!ghostMeshRef.current) {
          ghostMeshRef.current = buildProceduralAccessoryMesh(
            curActiveMat.model3D?.meshPreset || 'scallop_shell',
            curActiveMat.colorHex,
            false,
            true
          );
          scene.add(ghostMeshRef.current);
        }
        ghostMeshRef.current.visible = true;

        if (
          hit.object.userData?.slotIndex !== undefined &&
          hit.object.userData?.slotPosition &&
          hit.object.userData?.slotNormal
        ) {
          alignGroupToSurface(
            ghostMeshRef.current,
            hit.object.userData.slotPosition,
            hit.object.userData.slotNormal,
            0,
            curActiveMat.model3D?.defaultScale || 1
          );
        } else {
          const { localPoint, worldNormal } = computeAccurateHitTransform(hit);
          alignGroupToSurface(
            ghostMeshRef.current,
            [localPoint.x, localPoint.y, localPoint.z],
            [worldNormal.x, worldNormal.y, worldNormal.z],
            0,
            curActiveMat.model3D?.defaultScale || 1
          );
        }
      } else if (ghostMeshRef.current) {
        ghostMeshRef.current.visible = false;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerDownPos = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      const moveDist = Math.hypot(
        event.clientX - pointerDownPos.x,
        event.clientY - pointerDownPos.y
      );
      if (moveDist > 6) return;

      const {
        mode: curMode,
        activeMaterialToPlace: curActiveMat,
        onSurfacePlace: placeCb,
        onSelectPlacement: selectCb,
      } = latestPropsRef.current;

      if (curMode === 'preview') return;

      updatePointerCoords(event);
      raycaster.setFromCamera(pointer, camera);

      if (placementsGroupRef.current) {
        const hitPlacements = raycaster.intersectObjects(
          placementsGroupRef.current.children,
          true
        );
        if (hitPlacements.length > 0) {
          let obj: THREE.Object3D | null = hitPlacements[0].object;
          while (obj && !obj.userData?.placementId) {
            obj = obj.parent;
          }
          if (obj?.userData?.placementId) {
            if (
              curMode === 'studio' &&
              curActiveMat &&
              obj.userData?.slotIndex !== undefined &&
              placeCb
            ) {
              placeCb(
                obj.userData.slotPosition || [0, 0, 0],
                obj.userData.slotNormal || [0, 1, 0],
                obj.userData.slotIndex
              );
              return;
            }
            if (selectCb) {
              selectCb(obj.userData.placementId);
              return;
            }
          }
        }
      }

      if (curMode === 'studio' && curActiveMat && placeCb) {
        const placeableMeshes = getPlaceableMeshes();
        const intersects = raycaster.intersectObjects(placeableMeshes, false);
        const hit = intersects[0];
        if (hit) {
          if (
            hit.object.userData?.slotIndex !== undefined &&
            hit.object.userData?.slotPosition &&
            hit.object.userData?.slotNormal
          ) {
            placeCb(
              hit.object.userData.slotPosition,
              hit.object.userData.slotNormal,
              hit.object.userData.slotIndex
            );
            return;
          }

          const { localPoint, worldNormal } = computeAccurateHitTransform(hit);
          const position: [number, number, number] = [
            Number(localPoint.x.toFixed(4)),
            Number(localPoint.y.toFixed(4)),
            Number(localPoint.z.toFixed(4)),
          ];
          const normal: [number, number, number] = [
            Number(worldNormal.x.toFixed(4)),
            Number(worldNormal.y.toFixed(4)),
            Number(worldNormal.z.toFixed(4)),
          ];
          placeCb(position, normal, hit.object.userData?.slotIndex);
        }
      } else if (selectCb) {
        selectCb(null);
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointermove', handlePointerMove);
    domElem.addEventListener('pointerdown', handlePointerDown);
    domElem.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 640;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    let frameId: number;
    let tickCount = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      tickCount++;
      if (latestPropsRef.current.mode === 'inspector' && tickCount % 6 === 0 && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const currentPlacements = latestPropsRef.current.placements || [];
        const nextLabels = currentPlacements.map((p, idx) => {
          const vec = new THREE.Vector3(p.position[0], p.position[1], p.position[2]);
          vec.project(camera);
          return {
            id: p.placementId,
            index: p.slotIndex !== undefined ? p.slotIndex + 1 : idx + 1,
            x: (vec.x * 0.5 + 0.5) * w,
            y: (-(vec.y * 0.5) + 0.5) * h,
            name: p.materialName,
          };
        });
        setProjectedLabels(nextLabels);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointermove', handlePointerMove);
      domElem.removeEventListener('pointerdown', handlePointerDown);
      domElem.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
    };
  }, [mode, autoRotate]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (ghostMeshRef.current) {
      scene.remove(ghostMeshRef.current);
      ghostMeshRef.current = null;
    }
    if (mode === 'studio' && activeMaterialToPlace) {
      const ghost = buildProceduralAccessoryMesh(
        activeMaterialToPlace.model3D?.meshPreset || 'scallop_shell',
        activeMaterialToPlace.colorHex,
        false,
        true
      );
      ghost.visible = false;
      scene.add(ghost);
      ghostMeshRef.current = ghost;
    }
  }, [mode, activeMaterialToPlace]);

  useEffect(() => {
    const holder = productGroupRef.current;
    if (!holder) return;

    holder.clear();

    if (productGlbUrl && productGlbUrl.trim().endsWith('.glb')) {
      const loader = new GLTFLoader();
      loader.load(
        productGlbUrl,
        (gltf) => {
          holder.clear();
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.isPlaceableSurface = true;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          holder.add(gltf.scene);
        },
        undefined,
        () => {
          const fallbackGroup = buildProceduralProductGroup(
            productPreset,
            baseColor,
            strapColor,
            braceletConfig
          );
          holder.add(fallbackGroup);
        }
      );
    } else {
      const proceduralGroup = buildProceduralProductGroup(
        productPreset,
        baseColor,
        strapColor,
        braceletConfig
      );
      holder.add(proceduralGroup);
    }
  }, [productPreset, productGlbUrl, baseColor, strapColor, braceletConfig]);

  useEffect(() => {
    const holder = placementsGroupRef.current;
    if (!holder) return;

    holder.clear();

    const wristCm = braceletConfig?.wristSizeCm || 16;
    const slotCount = braceletConfig?.slotCount || 12;
    const radius = 0.95 * (wristCm / 16);
    const knotMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(strapColor || THREE_COLORS.defaultStrapRust),
      roughness: 0.55,
      metalness: 0.1,
    });
    const jumpRingMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(THREE_COLORS.antiqueBrass),
      roughness: 0.3,
      metalness: 0.8,
    });

    placements.forEach((p, idx) => {
      const isSelected = p.placementId === selectedPlacementId;
      const itemGroup = buildProceduralAccessoryMesh(
        p.meshPreset || p.materialType || 'scallop_shell',
        p.color || THREE_COLORS.shellDefault,
        isSelected,
        false
      );

      let targetPosition: [number, number, number] = p.position;
      let targetNormal: [number, number, number] = p.normal;
      let targetRotation = p.rotation || 0;

      if (isBraceletMode) {
        const slotIdx = p.slotIndex !== undefined ? p.slotIndex : idx % slotCount;
        const arcSpan = Math.PI * 1.76;
        const startAngle = Math.PI / 2 + arcSpan / 2;
        const theta =
          slotCount > 1
            ? startAngle - (slotIdx / (slotCount - 1)) * arcSpan
            : Math.PI / 2;

        const isCharm =
          p.isDanglingCharm ||
          p.materialType === 'charm' ||
          (p.meshPreset || '').includes('charm') ||
          (p.meshPreset || '').includes('starfish') ||
          (p.meshPreset || '').includes('turtle');

        const radialDist = isCharm ? radius + 0.14 : radius;
        const sx = Number((Math.cos(theta) * radialDist).toFixed(4));
        const sy = Number((Math.sin(theta) * radialDist).toFixed(4));
        const nx = Number(Math.cos(theta).toFixed(4));
        const ny = Number(Math.sin(theta).toFixed(4));

        targetPosition = [sx, sy, 0];
        targetNormal = [nx, ny, 0.25];
        if (!p.rotation) {
          targetRotation = THREE.MathUtils.radToDeg(theta - Math.PI / 2);
        }

        [-0.1, 0.1].forEach((angleOff) => {
          const kTheta = theta + angleOff;
          const knotGeo = new THREE.TorusGeometry(0.048, 0.018, 10, 20);
          const knot = new THREE.Mesh(knotGeo, knotMat);
          knot.position.set(Math.cos(kTheta) * radius, Math.sin(kTheta) * radius, 0);
          knot.rotation.x = Math.PI / 2;
          knot.rotation.y = -kTheta;
          holder.add(knot);
        });

        if (isCharm) {
          const ringGeo = new THREE.TorusGeometry(0.055, 0.012, 12, 24);
          const jumpRing = new THREE.Mesh(ringGeo, jumpRingMat);
          jumpRing.position.set(
            Math.cos(theta) * (radius + 0.065),
            Math.sin(theta) * (radius + 0.065),
            0
          );
          jumpRing.rotation.z = theta;
          holder.add(jumpRing);
        }

        itemGroup.userData.slotIndex = slotIdx;
        itemGroup.userData.slotPosition = targetPosition;
        itemGroup.userData.slotNormal = targetNormal;
      }

      itemGroup.userData.placementId = p.placementId;
      itemGroup.traverse((child) => {
        child.userData.placementId = p.placementId;
        if (isBraceletMode) {
          child.userData.slotIndex = itemGroup.userData.slotIndex;
          child.userData.slotPosition = targetPosition;
          child.userData.slotNormal = targetNormal;
        }
      });

      alignGroupToSurface(
        itemGroup,
        targetPosition,
        targetNormal,
        targetRotation,
        p.scale,
        isBraceletMode ? 0.01 : 0.018
      );
      holder.add(itemGroup);
    });
  }, [placements, selectedPlacementId, isBraceletMode, braceletConfig, strapColor]);

  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.15, 4.1);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  if (!webglReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[380px] rounded-sm bg-coastal-mist p-6 text-center border border-coastal-line">
        <p className="text-base font-semibold text-coastal-ink">
          {t('three.webglDisabledTitle')}
        </p>
        <p className="text-sm text-coastal-slate mt-1 max-w-md">
          {t('three.webglDisabledDesc')}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-b from-coastal-mist via-coastal-bg to-coastal-card border border-coastal-line shadow-coastal select-none ${className}`}
    >
      {/* WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className={`w-full h-full min-h-[380px] ${
          mode === 'studio' && activeMaterialToPlace
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />

      {/* Top Left Mode Badge */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-coastal-card/90 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-coastal-kelp border border-coastal-line shadow-coastal backdrop-blur-md">
          {mode === 'studio' ? (
            <>
              <AppIcon name="compass" className="w-3.5 h-3.5 text-coastal-rust" />
              {isBraceletMode
                ? t('three.badgeBraceletStudio')
                : t('three.badgeSurfaceStudio')}
            </>
          ) : mode === 'inspector' ? (
            <>
              <AppIcon name="eye" className="w-3.5 h-3.5 text-coastal-kelp" />
              {t('three.badgeInspector')} ({placements.length} {t('common.positions')})
            </>
          ) : (
            <>
              <AppIcon name="compass" className="w-3.5 h-3.5 text-coastal-kelp" />
              {t('three.badgePreview')}
            </>
          )}
        </span>

        {mode === 'studio' && activeMaterialToPlace && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-coastal-rust px-3.5 py-1 text-xs font-semibold text-coastal-card shadow-coastal">
            <AppIcon name="mousePointerClick" className="w-3.5 h-3.5" />
            {isBraceletMode
              ? `${t('three.promptBraceletSlot')} ${activeMaterialToPlace.name}`
              : `${t('three.promptSurfacePlace')} ${activeMaterialToPlace.name}`}
          </span>
        )}
      </div>

      {/* Top Right Reset Camera Control */}
      <div className="absolute top-3.5 right-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={handleResetCamera}
          title={t('three.resetCamera')}
          className="inline-flex items-center gap-1.5 rounded-full bg-coastal-card/90 hover:bg-coastal-card px-3.5 py-1.5 text-xs font-semibold text-coastal-ink border border-coastal-line shadow-coastal backdrop-blur-md transition-all"
        >
          <AppIcon name="rotateCcw" className="w-3.5 h-3.5 text-coastal-kelp" />
          {t('three.resetCamera')}
        </button>
      </div>

      {/* Inspector Mode: Numbered Callout Pins (#1, #2...) for Artisans */}
      {mode === 'inspector' &&
        projectedLabels.map((lbl) => {
          const isSelected = lbl.id === selectedPlacementId;
          return (
            <button
              key={lbl.id}
              type="button"
              onClick={() => onSelectPlacement?.(lbl.id)}
              style={{
                left: `${Math.min(Math.max(lbl.x, 24), 950)}px`,
                top: `${Math.min(Math.max(lbl.y, 24), 520)}px`,
              }}
              className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold shadow-coastal transition-transform ${
                isSelected
                  ? 'bg-coastal-rust text-coastal-card scale-125 ring-2 ring-coastal-card'
                  : 'bg-coastal-kelp text-coastal-card hover:scale-110'
              }`}
              title={`#${lbl.index}: ${lbl.name}`}
            >
              {lbl.index}
            </button>
          );
        })}

      {/* Bottom Helper Hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-coastal-line/60 bg-coastal-card/90 px-4 py-1 text-[11px] font-medium text-coastal-ink shadow-coastal backdrop-blur-md whitespace-nowrap">
        {mode === 'studio'
          ? isBraceletMode
            ? t('three.hintBraceletStudio')
            : t('three.hintSurfaceStudio')
          : t('three.hintPreview')}
      </div>
    </div>
  );
}
