const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const statusEl = document.getElementById('status');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

let detector = null;
let running = false;
let lastDetections = [];
let animationStartMs = performance.now();

// State derived from person position
let personCenterX = null; // 0..1
let personScale = 0;      // 0..1 approximate proximity

// Juice selections from zones
const zones = [
  { name: 'Pomegranate', color: '#b21a3b' },
  { name: 'Orange', color: '#ff9f1c' },
  { name: 'Kiwi', color: '#7fb800' },
];

function setStatus(text) {
  statusEl.textContent = text;
}

async function initCamera() {
  const constraints = {
    audio: false,
    video: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      facingMode: 'user'
    }
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  await video.play();
}

async function initDetector() {
  await tf.setBackend('webgl');
  await tf.ready();
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true
    }
  );
}

function getPersonFeatures(keypoints) {
  // Compute center X from visible keypoints
  const visible = keypoints.filter(k => k.score > 0.3);
  if (visible.length === 0) {
    personCenterX = null;
    personScale = 0;
    return;
  }
  const avgX = visible.reduce((s, k) => s + k.x, 0) / visible.length;
  personCenterX = Math.min(1, Math.max(0, avgX / video.videoWidth));

  // Approximate scale by shoulder width vs video width
  const ls = keypoints.find(k => k.name === 'left_shoulder');
  const rs = keypoints.find(k => k.name === 'right_shoulder');
  if (ls && rs && ls.score > 0.3 && rs.score > 0.3) {
    const shoulderWidth = Math.abs(ls.x - rs.x);
    personScale = Math.min(1, Math.max(0, shoulderWidth / (video.videoWidth * 0.6)));
  } else {
    personScale = 0.2;
  }
}

function currentZone() {
  if (personCenterX == null) return null;
  if (personCenterX < 0.33) return zones[0];
  if (personCenterX < 0.66) return zones[1];
  return zones[2];
}

function demandLevel() {
  // Map proximity to 0..1
  return personScale; 
}

function drawBackground(t) {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  sky.addColorStop(0, '#0b1522');
  sky.addColorStop(1, '#1d3557');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 100; i++) {
    const x = (i * 73) % CANVAS_WIDTH;
    const y = (i * 211 + 100) % (CANVAS_HEIGHT * 0.5);
    const s = ((i * 37) % 3) + 1;
    ctx.globalAlpha = 0.2 + 0.8 * Math.abs(Math.sin((t/2000) + i));
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // Himalaya mountains
  function mountain(baseY, color, seed) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
      const y = baseY - 80 - 60 * Math.abs(Math.sin((x + seed) * 0.01));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(CANVAS_WIDTH, baseY);
    ctx.closePath();
    ctx.fill();
  }
  mountain(CANVAS_HEIGHT * 0.85, '#16324f', 0);
  mountain(CANVAS_HEIGHT * 0.9, '#0f2740', 200);

  // Snow ground
  ctx.fillStyle = '#e6f3ff';
  ctx.fillRect(0, CANVAS_HEIGHT * 0.9, CANVAS_WIDTH, CANVAS_HEIGHT * 0.1);
}

function drawSnowman(t) {
  const cx = CANVAS_WIDTH * 0.28;
  const cy = CANVAS_HEIGHT * 0.78;
  const scale = 1.0;

  // Body
  ctx.fillStyle = '#f5fbff';
  ctx.strokeStyle = '#d0e6ff';
  ctx.lineWidth = 3;

  // Bottom
  ctx.beginPath();
  ctx.arc(cx, cy, 80 * scale, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Middle
  ctx.beginPath();
  ctx.arc(cx, cy - 100 * scale, 55 * scale, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 170 * scale, 38 * scale, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Eyes
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.arc(cx - 12, cy - 178, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 12, cy - 178, 4, 0, Math.PI * 2); ctx.fill();

  // Nose (carrot)
  ctx.fillStyle = '#f77f00';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 170);
  ctx.lineTo(cx + 22, cy - 166);
  ctx.lineTo(cx, cy - 162);
  ctx.closePath();
  ctx.fill();

  // Arms
  ctx.strokeStyle = '#5a3e2b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 50, cy - 110);
  ctx.lineTo(cx - 90, cy - 140);
  ctx.moveTo(cx + 50, cy - 110);
  ctx.lineTo(cx + 90, cy - 140);
  ctx.stroke();

  // Scarf
  ctx.fillStyle = '#e71d36';
  ctx.fillRect(cx - 40, cy - 150, 80, 12);
  ctx.fillRect(cx - 10, cy - 138, 14, 26);
}

function drawHandPress(t, activeColor) {
  const baseX = CANVAS_WIDTH * 0.55;
  const baseY = CANVAS_HEIGHT * 0.75;

  // Base
  ctx.fillStyle = '#b0c4de';
  ctx.fillRect(baseX - 100, baseY, 200, 16);

  // Column
  ctx.fillStyle = '#c8d6e5';
  ctx.fillRect(baseX - 10, baseY - 160, 20, 160);

  // Press plate
  const pressY = baseY - 90 + Math.sin(t / 500) * 6;
  ctx.fillStyle = '#8aa3b5';
  ctx.fillRect(baseX - 40, pressY, 80, 14);

  // Handle (animated rotation)
  ctx.save();
  ctx.translate(baseX + 50, baseY - 130);
  const angle = Math.sin(t / 500) * 0.5 - 0.6;
  ctx.rotate(angle);
  ctx.fillStyle = '#6b7c93';
  ctx.fillRect(0, -6, 120, 12);
  ctx.beginPath(); ctx.arc(120, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Collection glass
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(baseX - 20, baseY - 20, 40, 60);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(baseX - 20, baseY - 20, 40, 60);

  // Juice level and color
  ctx.fillStyle = activeColor;
  const juiceLevel = 20 + 30 * Math.abs(Math.sin(t/800));
  ctx.fillRect(baseX - 19, baseY + 40 - juiceLevel, 38, juiceLevel);
}

function drawFruitAndEffects(t, zone, demand) {
  const baseX = CANVAS_WIDTH * 0.55;
  const baseY = CANVAS_HEIGHT * 0.75;

  // Falling fruits being crushed
  for (let i = 0; i < 5; i++) {
    const phase = (i * 400) + (t % 2000);
    const fx = baseX + Math.sin((phase + i*53) / 200) * 40 + (i - 2) * 6;
    let fy = baseY - 160 + (phase / 10) % 160;
    ctx.fillStyle = zone ? zone.color : '#999999';
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soda bubbles if demand high (>0.5)
  if (demand > 0.5) {
    ctx.fillStyle = 'rgba(240,248,255,0.9)';
    for (let i = 0; i < 25; i++) {
      const bx = baseX - 12 + (i * 9) % 24;
      const by = baseY + 36 - ((t/40 + i*13) % 36);
      const r = 1 + ((i * 7) % 3);
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin((t/1000)+i));
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Ice cubes proportional to demand
  const iceCount = Math.floor(demand * 6);
  ctx.fillStyle = 'rgba(200, 236, 255, 0.85)';
  for (let i = 0; i < iceCount; i++) {
    const ix = baseX - 14 + (i * 6);
    const iy = baseY + 20 + ((i * 11) % 16);
    ctx.fillRect(ix, iy, 6, 6);
  }
}

function drawHUD(zone, demand) {
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(CANVAS_WIDTH - 260, 16, 244, 80);
  ctx.fillStyle = '#eaf2ff';
  ctx.fillText('Selection: ' + (zone ? zone.name : '—'), CANVAS_WIDTH - 248, 44);
  const demandPct = Math.round((demand || 0) * 100);
  ctx.fillText('Ice & Soda level: ' + demandPct + '%', CANVAS_WIDTH - 248, 68);
}

async function detectPose() {
  if (!detector) return [];
  try {
    const poses = await detector.estimatePoses(video, {flipHorizontal: true});
    return poses;
  } catch (e) {
    console.warn('Pose detection error:', e);
    return [];
  }
}

async function loop() {
  if (!running) return;
  const now = performance.now();
  const t = now - animationStartMs;

  // Pose
  const poses = await detectPose();
  lastDetections = poses;
  if (poses && poses[0] && poses[0].keypoints) {
    getPersonFeatures(poses[0].keypoints);
  } else {
    personCenterX = null;
    personScale = 0;
  }

  // Compute UI state
  const zone = currentZone();
  const demand = demandLevel();

  // Draw
  drawBackground(t);
  drawSnowman(t);
  drawHandPress(t, (zone ? zone.color : '#aaaaaa'));
  drawFruitAndEffects(t, zone || {color:'#aaaaaa'}, demand);
  drawHUD(zone, demand);

  requestAnimationFrame(loop);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  setStatus('Starting…');
  try {
    await initCamera();
    await initDetector();
    running = true;
    setStatus('Detecting pose… Move left/right to change fruit. Step closer for more ice & soda.');
    loop();
  } catch (e) {
    console.error(e);
    setStatus('Camera or model failed. Running demo mode (no camera).');
    // Demo mode: animate without pose, allow mouse to set personCenterX
    running = true;
    personCenterX = 0.5;
    personScale = 0.3;
    window.addEventListener('mousemove', (ev) => {
      const rect = canvas.getBoundingClientRect();
      personCenterX = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
      personScale = Math.min(1, Math.max(0, (rect.height - (ev.clientY - rect.top)) / rect.height));
    });
    loop();
  }
});

// If user never clicks, allow keyboard demo: arrows adjust center, +/- adjust demand
window.addEventListener('keydown', (e) => {
  if (running) return; // will be used only in demo after failure
  if (e.key === 'ArrowLeft') personCenterX = Math.max(0, (personCenterX ?? 0.5) - 0.05);
  if (e.key === 'ArrowRight') personCenterX = Math.min(1, (personCenterX ?? 0.5) + 0.05);
  if (e.key === '+') personScale = Math.min(1, (personScale ?? 0.3) + 0.05);
  if (e.key === '-') personScale = Math.max(0, (personScale ?? 0.3) - 0.05);
});