import * as THREE from 'three';
import { THREE_COLORS } from '@/config/theme';

export function buildProceduralAccessoryMesh(
  meshPreset: string,
  colorHex: string,
  isSelected: boolean,
  isGhost = false
): THREE.Group {
  const wrapper = new THREE.Group();
  const baseColor = new THREE.Color(colorHex || THREE_COLORS.shellDefault);

  const nacreMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.28,
    metalness: 0.14,
    transparent: isGhost,
    opacity: isGhost ? 0.65 : 1,
    emissive: isSelected
      ? new THREE.Color(THREE_COLORS.selectionRust)
      : isGhost
      ? new THREE.Color(THREE_COLORS.ghostKelp)
      : new THREE.Color(THREE_COLORS.emissiveNone),
    emissiveIntensity: isSelected ? 0.35 : isGhost ? 0.22 : 0,
  });

  const ridgeAccentMat = new THREE.MeshStandardMaterial({
    color: baseColor.clone().multiplyScalar(0.84),
    roughness: 0.38,
    metalness: 0.1,
    transparent: isGhost,
    opacity: isGhost ? 0.65 : 1,
  });

  const preset = (meshPreset || 'scallop_shell').toLowerCase();

  // 1. VỎ SÒ ĐIỆP (scallop_shell)
  if (preset.includes('scallop') || preset === 'shell') {
    const shellGroup = new THREE.Group();
    const ribCount = 13;
    const fanSpread = Math.PI * 0.68;

    const domeGeo = new THREE.SphereGeometry(0.155, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
    domeGeo.scale(1.18, 0.38, 1.08);
    const dome = new THREE.Mesh(domeGeo, nacreMat);
    dome.position.set(0, 0.008, 0.01);
    shellGroup.add(dome);

    for (let i = 0; i < ribCount; i++) {
      const t = i / (ribCount - 1) - 0.5;
      const angle = t * fanSpread;
      const ribLen = 0.25 * (1 - 0.22 * Math.abs(t * 2));
      const ribGeo = new THREE.CylinderGeometry(0.006, 0.018, ribLen, 10);
      ribGeo.scale(1.15, 1, 0.55);
      const rib = new THREE.Mesh(ribGeo, i % 2 === 0 ? nacreMat : ridgeAccentMat);
      rib.position.set(
        Math.sin(angle) * (ribLen * 0.45),
        0.032 - Math.abs(t) * 0.012,
        -0.09 + Math.cos(angle) * (ribLen * 0.45)
      );
      rib.rotation.x = Math.PI / 2 - 0.08;
      rib.rotation.z = -angle;
      shellGroup.add(rib);
    }

    const earGeo = new THREE.BoxGeometry(0.14, 0.025, 0.045);
    const ear = new THREE.Mesh(earGeo, ridgeAccentMat);
    ear.position.set(0, 0.018, -0.11);
    shellGroup.add(ear);

    wrapper.add(shellGroup);
  }
  // 2. VỎ ỐC SỨ (cowrie_shell / clam_shell)
  else if (preset.includes('cowrie') || preset.includes('clam')) {
    const cowrieGroup = new THREE.Group();

    [-1, 1].forEach((side) => {
      const lobeGeo = new THREE.SphereGeometry(0.115, 24, 18);
      lobeGeo.scale(0.68, 0.52, 1.48);
      const lobe = new THREE.Mesh(lobeGeo, nacreMat);
      lobe.position.set(side * 0.036, 0.045, 0);
      cowrieGroup.add(lobe);
    });

    const grooveGeo = new THREE.BoxGeometry(0.018, 0.055, 0.27);
    const groove = new THREE.Mesh(grooveGeo, ridgeAccentMat);
    groove.position.set(0, 0.048, 0);
    cowrieGroup.add(groove);

    for (let z = -0.1; z <= 0.1; z += 0.033) {
      const toothGeo = new THREE.BoxGeometry(0.052, 0.014, 0.01);
      const tooth = new THREE.Mesh(toothGeo, nacreMat);
      tooth.position.set(0, 0.082, z);
      cowrieGroup.add(tooth);
    }

    wrapper.add(cowrieGroup);
  }
  // 3. ỐC XOẮN BIỂN (spiral_snail / conch_snail)
  else if (preset.includes('snail') || preset.includes('conch')) {
    const snailGroup = new THREE.Group();
    const totalTurns = 5.5;
    const segments = 54;

    for (let s = 0; s < segments; s++) {
      const frac = s / segments;
      const theta = frac * totalTurns * Math.PI * 2;
      const whorlRadius = 0.008 + Math.pow(frac, 1.35) * 0.085;
      const tubeRadius = 0.006 + Math.pow(frac, 1.25) * 0.058;
      const zPos = -0.16 + frac * 0.31;

      const beadGeo = new THREE.SphereGeometry(tubeRadius, 14, 12);
      beadGeo.scale(1.08, 0.88, 1.25);
      const bead = new THREE.Mesh(beadGeo, s % 4 === 0 ? ridgeAccentMat : nacreMat);
      bead.position.set(
        Math.cos(theta) * (whorlRadius * 0.38),
        0.048 + Math.sin(theta) * (whorlRadius * 0.28),
        zPos
      );
      snailGroup.add(bead);
    }

    const lipGeo = new THREE.TorusGeometry(0.056, 0.015, 12, 24, Math.PI * 1.4);
    const lip = new THREE.Mesh(lipGeo, ridgeAccentMat);
    lip.position.set(0.02, 0.05, 0.13);
    lip.rotation.y = Math.PI * 0.25;
    snailGroup.add(lip);

    wrapper.add(snailGroup);
  }
  // 4. SAO BIỂN 5 CÁNH HỮU CƠ (starfish_charm)
  else if (preset.includes('starfish') || preset.includes('star')) {
    const starGroup = new THREE.Group();
    const shape = new THREE.Shape();
    const numArms = 5;
    const outerR = 0.175;
    const innerR = 0.068;

    for (let i = 0; i < numArms * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / numArms - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.quadraticCurveTo(Math.cos(a - 0.15) * (r * 0.92), Math.sin(a - 0.15) * (r * 0.92), x, y);
    }
    shape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.024,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.016,
      bevelThickness: 0.018,
    });
    extrudeGeo.rotateX(-Math.PI / 2);
    const body = new THREE.Mesh(extrudeGeo, nacreMat);
    body.position.y = 0.016;
    starGroup.add(body);

    for (let arm = 0; arm < 5; arm++) {
      const angle = (arm * Math.PI * 2) / 5 - Math.PI / 2;
      for (let d = 1; d <= 3; d++) {
        const dist = d * 0.044;
        const dotGeo = new THREE.SphereGeometry(0.014 - d * 0.002, 10, 8);
        const dot = new THREE.Mesh(dotGeo, ridgeAccentMat);
        dot.position.set(Math.cos(angle) * dist, 0.048, -Math.sin(angle) * dist);
        starGroup.add(dot);
      }
    }

    wrapper.add(starGroup);
  }
  // 5. CHARM RÙA BIỂN (turtle_charm)
  else if (preset.includes('turtle')) {
    const turtleGroup = new THREE.Group();
    const carapaceGeo = new THREE.SphereGeometry(0.115, 24, 18);
    carapaceGeo.scale(0.92, 0.42, 1.22);
    const carapace = new THREE.Mesh(carapaceGeo, nacreMat);
    carapace.position.y = 0.04;
    turtleGroup.add(carapace);

    const rimGeo = new THREE.TorusGeometry(0.105, 0.012, 10, 28);
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.scale(0.92, 1.22, 1);
    const rim = new THREE.Mesh(rimGeo, ridgeAccentMat);
    rim.position.y = 0.025;
    turtleGroup.add(rim);

    const headGeo = new THREE.SphereGeometry(0.042, 14, 14);
    headGeo.scale(0.85, 0.65, 1.15);
    const head = new THREE.Mesh(headGeo, nacreMat);
    head.position.set(0, 0.03, 0.155);
    turtleGroup.add(head);

    [
      { x: -0.115, z: 0.055, rz: 0.45, sx: 0.095 },
      { x: 0.115, z: 0.055, rz: -0.45, sx: 0.095 },
      { x: -0.085, z: -0.095, rz: -0.55, sx: 0.065 },
      { x: 0.085, z: -0.095, rz: 0.55, sx: 0.065 },
    ].forEach((f) => {
      const flipGeo = new THREE.SphereGeometry(f.sx, 12, 10);
      flipGeo.scale(1, 0.22, 0.42);
      const flip = new THREE.Mesh(flipGeo, ridgeAccentMat);
      flip.position.set(f.x, 0.022, f.z);
      flip.rotation.y = f.rz;
      turtleGroup.add(flip);
    });

    wrapper.add(turtleGroup);
  }
  // 6. HẠT NGỌC TRAI & HẠT THỦY TINH BIỂN MỜ (pearl_bead / sea_glass_bead)
  else if (preset.includes('pearl') || preset.includes('bead') || preset.includes('glass')) {
    const isSeaGlass = preset.includes('glass');
    const beadMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: isSeaGlass ? 0.48 : 0.12,
      metalness: isSeaGlass ? 0.05 : 0.32,
      transparent: isGhost || isSeaGlass,
      opacity: isGhost ? 0.65 : isSeaGlass ? 0.88 : 1,
      emissive: isSelected
        ? new THREE.Color(THREE_COLORS.selectionRust)
        : new THREE.Color(THREE_COLORS.emissiveNone),
      emissiveIntensity: isSelected ? 0.35 : 0,
    });

    const beadGeo = isSeaGlass
      ? new THREE.DodecahedronGeometry(0.11, 2)
      : new THREE.SphereGeometry(0.105, 28, 28);
    if (isSeaGlass) {
      beadGeo.scale(1.18, 0.52, 0.96);
    } else {
      beadGeo.scale(1, 0.86, 1);
    }
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.y = isSeaGlass ? 0.045 : 0.075;
    wrapper.add(bead);
  }
  // 7. NÚT THẮT DÂY LƯỚI THỦY THỦ (fishing_cord)
  else {
    const knotGeo = new THREE.TorusKnotGeometry(0.078, 0.024, 64, 12, 2, 3);
    knotGeo.rotateX(Math.PI / 2);
    knotGeo.scale(1, 1, 0.55);
    const knot = new THREE.Mesh(knotGeo, nacreMat);
    knot.position.y = 0.036;
    wrapper.add(knot);
  }

  // Editorial Hairline Selection Ring when selected in Studio or Inspector
  if (isSelected) {
    const ringGeo = new THREE.RingGeometry(0.185, 0.215, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(THREE_COLORS.selectionRust),
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.006;
    wrapper.add(ring);
  }

  return wrapper;
}

// ============================================================================
// NATURAL PROCEDURAL PRODUCT GEOMETRIES
// ============================================================================

