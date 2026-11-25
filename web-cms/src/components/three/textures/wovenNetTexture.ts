import * as THREE from 'three';
import { THREE_COLORS } from '@/config/theme';

let cachedNetBumpMap: THREE.CanvasTexture | null = null;

export function getWovenNetTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedNetBumpMap) return cachedNetBumpMap;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = THREE_COLORS.canvasBumpBase;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = THREE_COLORS.canvasBumpCord;
    ctx.lineWidth = 5;
    const step = 32;
    for (let i = -256; i <= 512; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i, 256);
      ctx.lineTo(i + 256, 0);
      ctx.stroke();
    }

    ctx.fillStyle = THREE_COLORS.canvasBumpKnot;
    for (let y = 0; y <= 256; y += step / 2) {
      for (let x = 0; x <= 256; x += step / 2) {
        if (((x + y) / (step / 2)) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 5);
  cachedNetBumpMap = texture;
  return texture;
}

// ============================================================================
// SCULPTED PARAMETRIC GEOMETRIES FOR MARINE ACCESSORIES (SHELLS, SNAILS, CHARMS)
// ============================================================================

