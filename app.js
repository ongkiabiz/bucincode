import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// hadjsdhasda
// --- DOM Elements ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('threeCanvas');
const loadingOverlay = document.getElementById('loadingOverlay');
const statusText = document.getElementById('statusText');
const quoteText = document.getElementById('quoteText');
const flashEffect = document.getElementById('flashEffect');

// --- Romantic Quotes & Configurations ---
const quotes = [
  "Kamu adalah alasanku tersenyum setiap hari... 💕",
  "Mei Rinda Ayyu Muazzamah,\nyou're my everything ✨",
  "Aku sangat mencintaimu\nlebih dari yang kamu tau 💖",
  "Melihatmu bahagia\nadalah bahagiaku juga 🌸",
  "Setiap detik bersamamu\nadalah keajaiban 🎇"
];

const templates = ['heart', 'text', 'flower', 'fireworks'];
const colors = [0xff0080, 0x00ffff, 0xff00ff, 0xffaa00];
let currentTemplateIndex = 0;
let maxParticles = 2500;

// --- Three.js Setup ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020005, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 18;

const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: false }); // Antialias false for post-processing performance
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x020005, 1);

// Post-Processing (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 1.8;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Handle Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// --- Particle System ---
let particleSystem;
let particlesData = []; 

// State variables driven by hand tracking
let targetSystemScale = 1.0;
let currentSystemScale = 1.0;
let systemRotation = { x: 0, y: 0 };
let autoRotateTime = 0;

function initParticles() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(maxParticles * 3);
  const colorsArray = new Float32Array(maxParticles * 3);
  const sizes = new Float32Array(maxParticles);

  const baseColor = new THREE.Color(colors[currentTemplateIndex]);

  for (let i = 0; i < maxParticles; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;

    colorsArray[i * 3] = baseColor.r;
    colorsArray[i * 3 + 1] = baseColor.g;
    colorsArray[i * 3 + 2] = baseColor.b;

    sizes[i] = Math.random() * 0.15 + 0.05;

    particlesData.push({
      target: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      noiseOffset: Math.random() * Math.PI * 2,
      noiseSpeed: Math.random() * 0.02 + 0.01
    });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = (0.5 - dist) * 2.0;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  updateTemplate();
}

// --- Generators ---
function generateHeartPoints(count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    points.push(new THREE.Vector3(x * 0.45 + (Math.random() - 0.5), y * 0.45 + (Math.random() - 0.5) + 2, (Math.random() - 0.5) * 2));
  }
  return points;
}

function generateFlowerPoints(count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = Math.abs(Math.cos(5 * theta / 2)) * 10;
    const rad = r * (0.8 + Math.random() * 0.2); 
    points.push(new THREE.Vector3(Math.cos(theta) * rad, Math.sin(theta) * rad, (Math.random() - 0.5) * 1.5));
  }
  return points;
}

function generateTextPoints(count) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  
  ctx.font = 'bold 110px sans-serif';
  ctx.fillText("Mei Rinda", 600, 300);
  ctx.fillText("Ayyu Muazzamah", 600, 420);
  
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const validPoints = [];
  
  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      if (imgData[(y * canvas.width + x) * 4] > 128) {
        validPoints.push({ x: (x / canvas.width - 0.5) * 35, y: -(y / canvas.height - 0.5) * 23 });
      }
    }
  }
  
  const points = [];
  for (let i = 0; i < count; i++) {
    const pt = validPoints[Math.floor(Math.random() * validPoints.length)];
    if (pt) points.push(new THREE.Vector3(pt.x + (Math.random() - 0.5)*0.1, pt.y + (Math.random() - 0.5)*0.1, (Math.random() - 0.5)*0.3));
    else points.push(new THREE.Vector3(0,0,0));
  }
  return points;
}

function generateFireworksPoints(count) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const u = Math.random(), v = Math.random();
    const theta = u * 2.0 * Math.PI, phi = Math.acos(2.0 * v - 1.0);
    const r = Math.pow(Math.random(), 1/3) * 14; 
    points.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)));
  }
  return points;
}

function updateTemplate() {
  const type = templates[currentTemplateIndex];
  let points;
  if(type === 'heart') points = generateHeartPoints(maxParticles);
  else if(type === 'text') points = generateTextPoints(maxParticles);
  else if(type === 'flower') points = generateFlowerPoints(maxParticles);
  else points = generateFireworksPoints(maxParticles);

  for (let i = 0; i < maxParticles; i++) {
    particlesData[i].target.copy(points[i]);
  }

  // Update Color
  const baseColor = new THREE.Color(colors[currentTemplateIndex]);
  const colorsArray = particleSystem.geometry.attributes.color.array;
  for (let i = 0; i < maxParticles; i++) {
    const hsl = {}; baseColor.getHSL(hsl);
    const varColor = new THREE.Color().setHSL(hsl.h + (Math.random()-0.5)*0.1, hsl.s, hsl.l + (Math.random()-0.5)*0.2);
    colorsArray[i*3] = varColor.r; colorsArray[i*3+1] = varColor.g; colorsArray[i*3+2] = varColor.b;
  }
  particleSystem.geometry.attributes.color.needsUpdate = true;
}

// --- Cinematic Transitions ---
let quoteTimeout;
function showQuoteAndTransition(newIndex) {
  // Flash effect
  flashEffect.classList.add('active');
  setTimeout(() => flashEffect.classList.remove('active'), 100);

  // Change Template
  currentTemplateIndex = newIndex;
  updateTemplate();

  // Show Quote
  quoteText.innerText = quotes[currentTemplateIndex % quotes.length];
  quoteText.classList.add('show');
  
  clearTimeout(quoteTimeout);
  quoteTimeout = setTimeout(() => {
    quoteText.classList.remove('show');
  }, 4000); // Tampil selama 4 detik
}


// --- MediaPipe Hand Tracking (Gesture Detection) ---
let stableFingerCount = 0;
let fingerHoldFrames = 0;
let lastTriggeredFingers = -1;

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    let totalTension = 0;

    results.multiHandLandmarks.forEach(landmarks => {
      const d8 = Math.hypot(landmarks[8].x - landmarks[0].x, landmarks[8].y - landmarks[0].y);
      const d12 = Math.hypot(landmarks[12].x - landmarks[0].x, landmarks[12].y - landmarks[0].y);
      const d16 = Math.hypot(landmarks[16].x - landmarks[0].x, landmarks[16].y - landmarks[0].y);
      const d20 = Math.hypot(landmarks[20].x - landmarks[0].x, landmarks[20].y - landmarks[0].y);
      totalTension += (d8 + d12 + d16 + d20) / 4;
    });

    const tension = totalTension / results.multiHandLandmarks.length;

    // Map Tension to Scale
    let scale = (tension - 0.15) * 3;
    scale = Math.max(0.1, Math.min(scale, 1.8));
    targetSystemScale = scale;

    // Finger Counting Logic (Use first hand)
    const lm = results.multiHandLandmarks[0];
    let count = 0;
    // Check if finger tips are higher than their lower joints (Y is inverted)
    if (lm[8].y < lm[6].y) count++;
    if (lm[12].y < lm[10].y) count++;
    if (lm[16].y < lm[14].y) count++;
    if (lm[20].y < lm[18].y) count++;

    if (count > 0 && count <= 4) {
      if (count === stableFingerCount) {
        fingerHoldFrames++;
        if (fingerHoldFrames > 5 && lastTriggeredFingers !== count) { // Tahan ~0.15 detik
          lastTriggeredFingers = count;
          // Change shape based on finger count (1 to 4 -> index 0 to 3)
          showQuoteAndTransition(count - 1);
        }
      } else {
        stableFingerCount = count;
        fingerHoldFrames = 0;
      }
    } else {
      fingerHoldFrames = 0;
      if (count === 0) lastTriggeredFingers = -1; // Reset if hand closed
    }

  } else {
    targetSystemScale = 1.0;
    fingerHoldFrames = 0;
    lastTriggeredFingers = -1;
  }
}

async function initMediaPipe() {
  const hands = new Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
  hands.onResults(onResults);

  const cameraHelper = new Camera(videoElement, {
    onFrame: async () => { await hands.send({ image: videoElement }); },
    width: 640, height: 480
  });

  try {
    await cameraHelper.start();
    loadingOverlay.classList.remove('active');
  } catch (err) {
    statusText.innerText = "Gagal akses kamera! Izinkan kamera di browser.";
  }
}


// --- Render Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  if (particleSystem) {
    currentSystemScale += (targetSystemScale - currentSystemScale) * 0.1;
    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < maxParticles; i++) {
      const data = particlesData[i];
      const noiseX = Math.sin(time * 2 + data.noiseOffset) * 0.5;
      const noiseY = Math.cos(time * 1.5 + data.noiseOffset) * 0.5;
      
      const tx = (data.target.x + noiseX) * currentSystemScale;
      const ty = (data.target.y + noiseY) * currentSystemScale;
      const tz = data.target.z * currentSystemScale;

      positions[i * 3] += (tx - positions[i * 3]) * 0.05;
      positions[i * 3 + 1] += (ty - positions[i * 3 + 1]) * 0.05;
      positions[i * 3 + 2] += (tz - positions[i * 3 + 2]) * 0.05;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Auto Rotation
    autoRotateTime += delta;
    systemRotation.y += Math.sin(autoRotateTime * 0.5) * 0.003;
    systemRotation.x += Math.cos(autoRotateTime * 0.3) * 0.0015;
    
    particleSystem.rotation.y = systemRotation.y;
    particleSystem.rotation.x = systemRotation.x;
  }

  // Use Composer instead of Renderer for Post-Processing Bloom
  composer.render();
}

initParticles();
animate();
initMediaPipe();
