import * as THREE from 'three';
import type { BraceletConfig } from '@/types';
import { THREE_COLORS } from '@/config/theme';
import { getWovenNetTexture } from '../textures/wovenNetTexture';

export function buildProceduralProductGroup(
  preset: string,
  baseColorHex: string,
  strapColorHex: string,
  braceletConfig?: BraceletConfig
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'productRootGroup';

  const baseColor = new THREE.Color(baseColorHex || THREE_COLORS.defaultBaseKelp);
  const strapColor = new THREE.Color(strapColorHex || THREE_COLORS.defaultStrapRust);
  const netTexture = getWovenNetTexture();

  const netPrimaryMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.68,
    metalness: 0.06,
    bumpMap: netTexture || undefined,
    bumpScale: 0.035,
    side: THREE.DoubleSide,
  });

  const strapMat = new THREE.MeshStandardMaterial({
    color: strapColor,
    roughness: 0.58,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });

  const hempLinerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(THREE_COLORS.hempLiner),
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });

  const antiqueBrassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(THREE_COLORS.antiqueBrass),
    roughness: 0.32,
    metalness: 0.78,
  });

  const key = (preset || 'tote_bag').toLowerCase();

  // 1. GIỎ ĐỰNG ĐỒ ĐAN LƯỚI (market_basket)
  if (key.includes('basket')) {
    const outerPts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -0.82),
      new THREE.Vector2(0.84, -0.82),
      new THREE.Vector2(0.96, -0.62),
      new THREE.Vector2(1.12, -0.15),
      new THREE.Vector2(1.22, 0.42),
      new THREE.Vector2(1.18, 0.78),
    ];
    const outerLatheGeo = new THREE.LatheGeometry(outerPts, 48);
    outerLatheGeo.computeVertexNormals();
    const outerShell = new THREE.Mesh(outerLatheGeo, netPrimaryMat);
    outerShell.userData.isPlaceableSurface = true;
    outerShell.castShadow = true;
    outerShell.receiveShadow = true;
    group.add(outerShell);

    const innerPts: THREE.Vector2[] = [
      new THREE.Vector2(1.11, 0.77),
      new THREE.Vector2(1.14, 0.4),
      new THREE.Vector2(1.04, -0.15),
      new THREE.Vector2(0.88, -0.6),
      new THREE.Vector2(0.78, -0.74),
      new THREE.Vector2(0.0, -0.74),
    ];
    const innerLatheGeo = new THREE.LatheGeometry(innerPts, 40);
    innerLatheGeo.computeVertexNormals();
    const innerWall = new THREE.Mesh(innerLatheGeo, hempLinerMat);
    innerWall.userData.isPlaceableSurface = false;
    group.add(innerWall);

    const topRimGeo = new THREE.TorusGeometry(1.15, 0.068, 18, 56);
    topRimGeo.rotateX(Math.PI / 2);
    const topRim = new THREE.Mesh(topRimGeo, strapMat);
    topRim.position.y = 0.78;
    topRim.userData.isPlaceableSurface = false;
    group.add(topRim);

    const ringHeights = [-0.55, -0.25, 0.08, 0.42];
    const ringRadii = [0.98, 1.09, 1.17, 1.22];
    ringHeights.forEach((yPos, idx) => {
      const hoopGeo = new THREE.TorusGeometry(ringRadii[idx], 0.022, 12, 52);
      hoopGeo.rotateX(Math.PI / 2);
      const hoop = new THREE.Mesh(
        hoopGeo,
        idx % 2 === 0 ? strapMat : netPrimaryMat
      );
      hoop.position.y = yPos;
      hoop.userData.isPlaceableSurface = false;
      group.add(hoop);
    });

    [-1, 1].forEach((dir) => {
      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(dir * 1.12, 0.74, -0.32),
        new THREE.Vector3(dir * 1.32, 1.06, -0.16),
        new THREE.Vector3(dir * 1.36, 1.14, 0),
        new THREE.Vector3(dir * 1.32, 1.06, 0.16),
        new THREE.Vector3(dir * 1.12, 0.74, 0.32),
      ]);
      const handleGeo = new THREE.TubeGeometry(handleCurve, 28, 0.048, 14, false);
      const handle = new THREE.Mesh(handleGeo, strapMat);
      handle.userData.isPlaceableSurface = false;
      group.add(handle);
    });
  }
  // 2. VÍ TIỀN LƯỚI TÁI CHẾ (zip_wallet)
  else if (key.includes('wallet') || key.includes('clutch')) {
    const w = 1.02;
    const h = 0.58;
    const r = 0.14;
    const walletShape = new THREE.Shape();
    walletShape.moveTo(-w + r, -h);
    walletShape.lineTo(w - r, -h);
    walletShape.quadraticCurveTo(w, -h, w, -h + r);
    walletShape.lineTo(w, h - r);
    walletShape.quadraticCurveTo(w, h, w - r, h);
    walletShape.lineTo(-w + r, h);
    walletShape.quadraticCurveTo(-w, h, -w, h - r);
    walletShape.lineTo(-w, -h + r);
    walletShape.quadraticCurveTo(-w, -h, -w + r, -h);

    const extrudeGeo = new THREE.ExtrudeGeometry(walletShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.07,
    });
    extrudeGeo.center();
    extrudeGeo.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(extrudeGeo, netPrimaryMat);
    bodyMesh.userData.isPlaceableSurface = true;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    const trimGeo = new THREE.BoxGeometry(2.12, 0.36, 0.35);
    const trimMesh = new THREE.Mesh(trimGeo, strapMat);
    trimMesh.position.set(0, -0.44, 0);
    trimMesh.userData.isPlaceableSurface = true;
    group.add(trimMesh);

    const zipTrackGeo = new THREE.BoxGeometry(1.92, 0.04, 0.08);
    const zipTrack = new THREE.Mesh(zipTrackGeo, antiqueBrassMat);
    zipTrack.position.set(0, 0.64, 0);
    zipTrack.userData.isPlaceableSurface = false;
    group.add(zipTrack);

    const pullerGeo = new THREE.BoxGeometry(0.14, 0.06, 0.12);
    const puller = new THREE.Mesh(pullerGeo, antiqueBrassMat);
    puller.position.set(0.68, 0.66, 0);
    puller.userData.isPlaceableSurface = false;
    group.add(puller);

    const wristCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.05, 0.48, 0),
      new THREE.Vector3(-1.42, 0.32, 0.08),
      new THREE.Vector3(-1.55, 0.05, 0),
      new THREE.Vector3(-1.38, 0.18, -0.08),
      new THREE.Vector3(-1.05, 0.44, 0),
    ]);
    const wristGeo = new THREE.TubeGeometry(wristCurve, 28, 0.032, 12, false);
    const wristMesh = new THREE.Mesh(wristGeo, strapMat);
    wristMesh.userData.isPlaceableSurface = false;
    group.add(wristMesh);
  }
  // 3. ÁO KHOÁC GILE TÁI CHẾ (ocean_vest / apparel)
  else if (key.includes('vest') || key.includes('apparel') || key.includes('jacket')) {
    const vestShape = new THREE.Shape();
    vestShape.moveTo(-0.88, -1.02);
    vestShape.lineTo(0.88, -1.02);
    vestShape.quadraticCurveTo(0.84, -0.35, 0.92, 0.18);
    vestShape.quadraticCurveTo(0.66, 0.45, 0.74, 0.96);
    vestShape.lineTo(0.38, 1.04);
    vestShape.lineTo(0.0, 0.38);
    vestShape.lineTo(-0.38, 1.04);
    vestShape.lineTo(-0.74, 0.96);
    vestShape.quadraticCurveTo(-0.66, 0.45, -0.92, 0.18);
    vestShape.quadraticCurveTo(-0.84, -0.35, -0.88, -1.02);

    const vestGeo = new THREE.ExtrudeGeometry(vestShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.07,
    });
    vestGeo.center();
    vestGeo.computeVertexNormals();

    const vestBody = new THREE.Mesh(vestGeo, netPrimaryMat);
    vestBody.userData.isPlaceableSurface = true;
    vestBody.castShadow = true;
    vestBody.receiveShadow = true;
    group.add(vestBody);

    const placketGeo = new THREE.BoxGeometry(0.11, 1.38, 0.52);
    const placket = new THREE.Mesh(placketGeo, strapMat);
    placket.position.set(0, -0.32, 0);
    placket.userData.isPlaceableSurface = false;
    group.add(placket);

    [-0.1, -0.38, -0.66, -0.92].forEach((by) => {
      const btnGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.025, 16);
      btnGeo.rotateX(Math.PI / 2);
      const btn = new THREE.Mesh(btnGeo, antiqueBrassMat);
      btn.position.set(0, by, 0.27);
      btn.userData.isPlaceableSurface = false;
      group.add(btn);
    });

    [-0.46, 0.46].forEach((px) => {
      const pocketGeo = new THREE.BoxGeometry(0.46, 0.48, 0.08);
      const pocket = new THREE.Mesh(pocketGeo, strapMat);
      pocket.position.set(px, -0.45, 0.25);
      pocket.userData.isPlaceableSurface = true;
      group.add(pocket);

      const flapGeo = new THREE.BoxGeometry(0.48, 0.12, 0.1);
      const flap = new THREE.Mesh(flapGeo, netPrimaryMat);
      flap.position.set(px, -0.22, 0.26);
      flap.userData.isPlaceableSurface = false;
      group.add(flap);
    });
  }
  // 4. VÒNG TAY NỐI CHUỖI 3D (braided_bracelet)
  else if (key.includes('bracelet')) {
    const wristCm = braceletConfig?.wristSizeCm || 16;
    const slotCount = braceletConfig?.slotCount || 12;
    const radius = 0.95 * (wristCm / 16);

    [-0.032, 0.032].forEach((zOff) => {
      const cordGeo = new THREE.TorusGeometry(radius, 0.036, 20, 84);
      const cordMesh = new THREE.Mesh(cordGeo, netPrimaryMat);
      cordMesh.position.z = zOff;
      cordMesh.userData.isPlaceableSurface = true;
      cordMesh.castShadow = true;
      group.add(cordMesh);
    });

    const claspAngle = -Math.PI / 2;
    const cx = Math.cos(claspAngle) * radius;
    const cy = Math.sin(claspAngle) * radius;

    const macrameGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.24, 18);
    macrameGeo.rotateZ(Math.PI / 2);
    const macrame = new THREE.Mesh(macrameGeo, strapMat);
    macrame.position.set(cx, cy, 0);
    macrame.userData.isPlaceableSurface = false;
    group.add(macrame);

    [-1, 1].forEach((side) => {
      const tasselCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(cx + side * 0.08, cy, 0),
        new THREE.Vector3(cx + side * 0.16, cy - 0.18, 0.02),
        new THREE.Vector3(cx + side * 0.22, cy - 0.36, 0),
      ]);
      const tasselGeo = new THREE.TubeGeometry(tasselCurve, 16, 0.018, 8, false);
      const tassel = new THREE.Mesh(tasselGeo, strapMat);
      tassel.userData.isPlaceableSurface = false;
      group.add(tassel);

      const endBeadGeo = new THREE.SphereGeometry(0.038, 12, 12);
      const endBead = new THREE.Mesh(endBeadGeo, antiqueBrassMat);
      endBead.position.set(cx + side * 0.22, cy - 0.36, 0);
      endBead.userData.isPlaceableSurface = false;
      group.add(endBead);
    });

    const slotGuideMat = new THREE.MeshStandardMaterial({
      color: strapColor,
      roughness: 0.45,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
    });

    for (let i = 0; i < slotCount; i++) {
      const arcSpan = Math.PI * 1.76;
      const startAngle = Math.PI / 2 + arcSpan / 2;
      const theta =
        slotCount > 1
          ? startAngle - (i / (slotCount - 1)) * arcSpan
          : Math.PI / 2;

      const sx = Math.cos(theta) * radius;
      const sy = Math.sin(theta) * radius;
      const nx = Math.cos(theta);
      const ny = Math.sin(theta);

      const slotNodeGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.09, 16);
      const slotNode = new THREE.Mesh(slotNodeGeo, slotGuideMat);
      slotNode.position.set(sx, sy, 0);
      slotNode.rotation.z = theta;
      slotNode.userData.isPlaceableSurface = true;
      slotNode.userData.slotIndex = i;
      slotNode.userData.slotPosition = [
        Number(sx.toFixed(4)),
        Number(sy.toFixed(4)),
        0,
      ];
      slotNode.userData.slotNormal = [
        Number(nx.toFixed(4)),
        Number(ny.toFixed(4)),
        0.22,
      ];
      group.add(slotNode);
    }
  }
  // 5. PHỤ KIỆN MÓC TREO / CHUÔNG GIÓ VỎ SÒ (accessory / shell_charm_holder)
  else if (key.includes('accessory') || key.includes('holder') || key.includes('charm')) {
    const buoyGeo = new THREE.SphereGeometry(0.88, 36, 36);
    buoyGeo.scale(1, 1.12, 1);
    const buoy = new THREE.Mesh(buoyGeo, netPrimaryMat);
    buoy.userData.isPlaceableSurface = true;
    buoy.castShadow = true;
    group.add(buoy);

    [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((rotY) => {
      const meridianGeo = new THREE.TorusGeometry(0.92, 0.028, 12, 48);
      meridianGeo.scale(0.96, 1.08, 1);
      const meridian = new THREE.Mesh(meridianGeo, strapMat);
      meridian.rotation.y = rotY;
      meridian.userData.isPlaceableSurface = false;
      group.add(meridian);
    });

    const eqRingGeo = new THREE.TorusGeometry(0.91, 0.035, 14, 48);
    eqRingGeo.rotateX(Math.PI / 2);
    const eqRing = new THREE.Mesh(eqRingGeo, strapMat);
    eqRing.userData.isPlaceableSurface = false;
    group.add(eqRing);

    const topLoopGeo = new THREE.TorusGeometry(0.24, 0.04, 14, 32);
    const topLoop = new THREE.Mesh(topLoopGeo, antiqueBrassMat);
    topLoop.position.set(0, 1.15, 0);
    topLoop.userData.isPlaceableSurface = false;
    group.add(topLoop);
  }
  // 6. TÚI XÁCH LƯỚI ĐẠI DƯƠNG (tote_bag — Default)
  else {
    const toteGeo = new THREE.CylinderGeometry(1.14, 0.94, 1.72, 48, 20, true);
    toteGeo.scale(1.16, 1, 0.48);
    toteGeo.computeVertexNormals();
    const toteBody = new THREE.Mesh(toteGeo, netPrimaryMat);
    toteBody.userData.isPlaceableSurface = true;
    toteBody.castShadow = true;
    toteBody.receiveShadow = true;
    group.add(toteBody);

    const linerGeo = new THREE.CylinderGeometry(1.06, 0.89, 1.64, 36, 1, false);
    linerGeo.scale(1.13, 1, 0.44);
    const liner = new THREE.Mesh(linerGeo, hempLinerMat);
    liner.position.y = -0.03;
    liner.userData.isPlaceableSurface = false;
    group.add(liner);

    const bootGeo = new THREE.CylinderGeometry(0.97, 0.93, 0.34, 44, 1, false);
    bootGeo.scale(1.17, 1, 0.49);
    const boot = new THREE.Mesh(bootGeo, strapMat);
    boot.position.y = -0.71;
    boot.userData.isPlaceableSurface = true;
    group.add(boot);

    const rimGeo = new THREE.TorusGeometry(1.13, 0.048, 16, 56);
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.scale(1.16, 0.48, 1);
    const rim = new THREE.Mesh(rimGeo, strapMat);
    rim.position.y = 0.86;
    rim.userData.isPlaceableSurface = false;
    group.add(rim);

    [-1, 1].forEach((side) => {
      const zAnchor = side * 0.51;
      const strapCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.48, 0.72, zAnchor),
        new THREE.Vector3(-0.44, 1.25, zAnchor * 0.85),
        new THREE.Vector3(0, 1.56, zAnchor * 0.65),
        new THREE.Vector3(0.44, 1.25, zAnchor * 0.85),
        new THREE.Vector3(0.48, 0.72, zAnchor),
      ]);
      const strapTubeGeo = new THREE.TubeGeometry(strapCurve, 36, 0.042, 14, false);
      const strapMesh = new THREE.Mesh(strapTubeGeo, strapMat);
      strapMesh.userData.isPlaceableSurface = false;
      group.add(strapMesh);

      [-0.48, 0.48].forEach((rx) => {
        const rivetGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16);
        rivetGeo.rotateX(Math.PI / 2);
        const rivet = new THREE.Mesh(rivetGeo, antiqueBrassMat);
        rivet.position.set(rx, 0.72, zAnchor + side * 0.03);
        rivet.userData.isPlaceableSurface = false;
        group.add(rivet);
      });
    });
  }

  return group;
}

// ============================================================================
// SURFACE ALIGNMENT WITH NORMAL OFFSET
// ============================================================================

export function alignGroupToSurface(
  obj: THREE.Object3D,
  position: [number, number, number],
  normal: [number, number, number],
  rotationDeg: number,
  scaleVal: number,
  surfaceOffset = 0.018
) {
  const normVec = new THREE.Vector3(normal[0], normal[1], normal[2]).normalize();
  if (normVec.lengthSq() < 0.0001) {
    normVec.set(0, 1, 0);
  }

  const posVec = new THREE.Vector3(position[0], position[1], position[2]).addScaledVector(
    normVec,
    surfaceOffset
  );
  obj.position.copy(posVec);

  const upVector = new THREE.Vector3(0, 1, 0);
  const alignQuat = new THREE.Quaternion().setFromUnitVectors(upVector, normVec);
  const spinQuat = new THREE.Quaternion().setFromAxisAngle(
    normVec,
    THREE.MathUtils.degToRad(rotationDeg || 0)
  );
  obj.quaternion.copy(spinQuat.multiply(alignQuat));

  const safeScale = Math.min(2.5, Math.max(0.4, scaleVal || 1));
  obj.scale.setScalar(safeScale);
}

// ============================================================================
// MAIN SHARED 3D VIEWER COMPONENT
// ============================================================================

