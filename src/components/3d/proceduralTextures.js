import * as THREE from 'three';

// Cache generated canvas textures so they are created once and reused
let cachedMoonTexture = null;
let cachedCloudTexture = null;
let cachedNoiseTexture = null;

export function getProceduralMoonTexture() {
  if (cachedMoonTexture) return cachedMoonTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Moon surface base
  ctx.fillStyle = '#C8CDD8';
  ctx.fillRect(0, 0, 512, 512);

  // Surface variations & mares (dark basaltic plains)
  const drawMare = (x, y, r, alpha) => {
    const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    grad.addColorStop(0, `rgba(140, 146, 162, ${alpha})`);
    grad.addColorStop(0.7, `rgba(160, 166, 180, ${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(200, 205, 216, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  drawMare(180, 160, 90, 0.55);
  drawMare(320, 220, 110, 0.6);
  drawMare(220, 340, 120, 0.5);
  drawMare(380, 370, 75, 0.45);
  drawMare(140, 380, 60, 0.4);

  // Impact craters with rim highlights and shadow
  const drawCrater = (x, y, r) => {
    // Crater shadow
    ctx.fillStyle = 'rgba(70, 75, 90, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // Inner floor
    ctx.fillStyle = 'rgba(110, 115, 130, 0.4)';
    ctx.beginPath();
    ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    // Sunlight rim highlight
    ctx.strokeStyle = 'rgba(240, 243, 250, 0.7)';
    ctx.lineWidth = Math.max(1.5, r * 0.18);
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.7, Math.PI * 1.8);
    ctx.stroke();
  };

  const craters = [
    [120, 180, 22], [280, 140, 32], [220, 240, 18], [340, 300, 26],
    [160, 320, 14], [400, 180, 16], [240, 420, 28], [320, 400, 12],
    [80, 280, 10], [420, 260, 15], [190, 110, 12], [300, 80, 20]
  ];

  craters.forEach(([x, y, r]) => drawCrater(x, y, r));

  cachedMoonTexture = new THREE.CanvasTexture(canvas);
  cachedMoonTexture.wrapS = THREE.ClampToEdgeWrapping;
  cachedMoonTexture.wrapT = THREE.ClampToEdgeWrapping;
  return cachedMoonTexture;
}

export function getProceduralCloudTexture() {
  if (cachedCloudTexture) return cachedCloudTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 256);
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  grad.addColorStop(0, 'rgba(14, 18, 28, 0.85)');
  grad.addColorStop(0.4, 'rgba(10, 14, 22, 0.55)');
  grad.addColorStop(0.7, 'rgba(6, 9, 16, 0.25)');
  grad.addColorStop(1, 'rgba(4, 6, 12, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  cachedCloudTexture = new THREE.CanvasTexture(canvas);
  return cachedCloudTexture;
}

export function getProceduralNoiseTexture() {
  if (cachedNoiseTexture) return cachedNoiseTexture;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const imgData = ctx.createImageData(128, 128);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const val = Math.floor(Math.random() * 50) + 10;
    imgData.data[i] = val;
    imgData.data[i + 1] = val;
    imgData.data[i + 2] = val + 5;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  cachedNoiseTexture = new THREE.CanvasTexture(canvas);
  cachedNoiseTexture.wrapS = THREE.RepeatWrapping;
  cachedNoiseTexture.wrapT = THREE.RepeatWrapping;
  return cachedNoiseTexture;
}
