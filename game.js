import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.getElementById("gameCanvas");
const ui = {
  courseSelect: document.getElementById("courseSelect"),
  strokeCount: document.getElementById("strokeCount"),
  distanceValue: document.getElementById("distanceValue"),
  stimpValue: document.getElementById("stimpValue"),
  scoreValue: document.getElementById("scoreValue"),
  roundModeButton: document.getElementById("roundModeButton"),
  roundModeLabel: document.getElementById("roundModeLabel"),
  greenNumber: document.getElementById("greenNumber"),
  greenName: document.getElementById("greenName"),
  greenDescription: document.getElementById("greenDescription"),
  difficulty: document.querySelectorAll(".difficulty span"),
  slopeButton: document.getElementById("slopeButton"),
  centerButton: document.getElementById("centerButton"),
  placeBallButton: document.getElementById("placeBallButton"),
  retryButton: document.getElementById("retryButton"),
  zoomButton: document.getElementById("zoomButton"),
  statusPill: document.getElementById("statusPill"),
  statusText: document.getElementById("statusText"),
  angleValue: document.getElementById("angleValue"),
  aimLeft: document.getElementById("aimLeft"),
  aimRight: document.getElementById("aimRight"),
  powerValue: document.getElementById("powerValue"),
  powerFill: document.getElementById("powerFill"),
  powerMarker: document.getElementById("powerMarker"),
  puttButton: document.getElementById("puttButton"),
  toast: document.getElementById("toast"),
  helpButton: document.getElementById("helpButton"),
  helpDialog: document.getElementById("helpDialog"),
  closeHelp: document.getElementById("closeHelp"),
  startPlaying: document.getElementById("startPlaying"),
  sceneLoading: document.getElementById("sceneLoading"),
  celebration: document.getElementById("celebration"),
  celebrationTitle: document.getElementById("celebrationTitle"),
  celebrationMessage: document.getElementById("celebrationMessage"),
  celebrationScore: document.getElementById("celebrationScore"),
  celebrationStrokes: document.getElementById("celebrationStrokes"),
  celebrationTotal: document.getElementById("celebrationTotal"),
  celebrationRetry: document.getElementById("celebrationRetry"),
  celebrationNext: document.getElementById("celebrationNext")
};

const WORLD = { width: 1200, height: 760, cx: 600, cy: 380 };
const PIXELS_PER_METER = 48;
const HEIGHT_SCALE = 0.88;
const BALL_RADIUS = 0.16;
const TAU = Math.PI * 2;
const SCORE_STORAGE_KEY = "green-reader-best-scores-v1";

const heightProfiles = {
  valley: (x, y) => {
    const dx = (x - 610) / 420;
    const dy = (y - 370) / 280;
    return dx * dx + dy * dy + 0.40 * Math.sin((x - 120) / 155) - 0.18 * Math.cos(y / 82);
  },
  ridge: (x, y) => 1.85 * Math.exp(-Math.pow((y - 380) / 105, 2)) + 0.42 * ((x - 600) / 450) - 0.20 * Math.sin(x / 95),
  coastal: (x, y) => 0.62 * Math.sin((x - 600) / 120) + 0.46 * Math.cos((y - 380) / 95) + 0.0018 * (y - 380) + 0.0000013 * Math.pow(x - 600, 2),
  plateau: (x, y) => 1.25 * Math.exp(-Math.pow(Math.hypot((x - 610) / 360, (y - 370) / 225), 4)) + 0.0011 * (x - 600),
  saddle: (x, y) => 1.25 * ((x - 600) / 440) * ((y - 380) / 280) + 0.18 * Math.sin(x / 110),
  twoTier: (x, y) => 0.78 * Math.tanh((y - 375) / 58) + 0.0012 * (x - 600),
  crown: (x, y) => 1.8 * Math.exp(-(Math.pow((x - 600) / 300, 2) + Math.pow((y - 370) / 205, 2))) + 0.12 * Math.sin(y / 70),
  funnel: (x, y) => 1.55 * (Math.pow((x - 650) / 470, 2) + Math.pow((y - 350) / 300, 2)) - 0.22 * Math.sin(x / 90),
  westWind: (x, y) => 0.0029 * (x - 600) + 0.34 * Math.sin((y - 100) / 105),
  eastWind: (x, y) => -0.0027 * (x - 600) + 0.30 * Math.cos(y / 92),
  uphill: (x, y) => -0.0034 * (y - 380) + 0.22 * Math.sin(x / 125),
  downhill: (x, y) => 0.0032 * (y - 380) + 0.25 * Math.cos((x + y) / 145),
  spiral: (x, y) => {
    const dx = x - 600;
    const dy = y - 380;
    return 0.64 * Math.sin(Math.atan2(dy, dx) * 2 + Math.hypot(dx, dy) / 135) + 0.0008 * dy;
  },
  ripples: (x, y) => 0.55 * Math.sin(Math.hypot(x - 610, y - 375) / 72) + 0.0012 * (x - 600),
  horseshoe: (x, y) => {
    const radius = Math.hypot((x - 610) / 1.2, y - 380);
    return 1.05 * Math.exp(-Math.pow((radius - 205) / 72, 2)) + 0.0015 * (y - 380);
  },
  diagonal: (x, y) => 1.45 * Math.exp(-Math.pow(((x - 600) + 1.35 * (y - 380)) / 145, 2)) - 0.0011 * (x - 600),
  splitBasin: (x, y) => {
    const left = Math.pow((x - 420) / 250, 2) + Math.pow((y - 390) / 235, 2);
    const right = Math.pow((x - 800) / 250, 2) + Math.pow((y - 350) / 235, 2);
    return Math.min(left, right) + 0.45 * Math.exp(-Math.pow((x - 610) / 85, 2));
  },
  terraces: (x, y) => 0.42 * Math.tanh((x - 430) / 38) + 0.42 * Math.tanh((x - 610) / 38) + 0.42 * Math.tanh((x - 790) / 38) + 0.0007 * (y - 380),
  volcano: (x, y) => {
    const radius = Math.hypot((x - 600) / 1.2, y - 375);
    return 1.35 * Math.exp(-Math.pow((radius - 170) / 60, 2)) - 0.55 * Math.exp(-Math.pow(radius / 85, 2));
  },
  championship: (x, y) => 0.52 * Math.sin((x - 80) / 105) + 0.42 * Math.cos(y / 82) + 0.48 * Math.tanh(((x - 620) - 0.65 * (y - 380)) / 80) + 0.0009 * (x - 600),
  crescent: (x, y) => {
    const curve = y - 380 + 0.0012 * Math.pow(x - 600, 2);
    return 1.25 * Math.exp(-Math.pow(curve / 82, 2)) + 0.0011 * (x - 600);
  },
  doublePeak: (x, y) => {
    const leftPeak = Math.exp(-(Math.pow((x - 440) / 145, 2) + Math.pow((y - 360) / 155, 2)));
    const rightPeak = Math.exp(-(Math.pow((x - 770) / 155, 2) + Math.pow((y - 395) / 145, 2)));
    return 1.35 * leftPeak + 1.2 * rightPeak - 0.0007 * (y - 380);
  },
  glass: (x, y) => 0.22 * Math.sin(x / 155) + 0.20 * Math.cos(y / 125) + 0.0015 * (x - 600) - 0.0011 * (y - 380)
};

const courseSpecs = [
  ["valley", "Thung lũng", "Green lòng chảo · Dốc vừa", 2, 10.5, 62, 9100, 345, 545, 835, 255],
  ["ridge", "Sống lưng", "Gờ cao chia line · Dốc mạnh", 4, 11.8, 54, 9800, 330, 280, 885, 455],
  ["coastal", "Ven biển", "Nhiều tầng dốc · Green nhanh", 5, 12.4, 49, 10300, 300, 510, 905, 250],
  ["plateau", "Cao nguyên", "Mặt cao thoải ra rìa · Dốc vừa", 3, 10.8, 60, 9300, 315, 480, 850, 285],
  ["saddle", "Yên ngựa", "Hai triền dốc giao nhau · Line khó", 4, 11.1, 57, 9700, 345, 520, 860, 245],
  ["twoTier", "Hai tầng", "Bậc green cắt ngang · Chọn lực chuẩn", 4, 11.6, 55, 9900, 315, 535, 875, 245],
  ["crown", "Mai rùa", "Tâm cao trôi ra bốn phía · Green nhanh", 4, 11.9, 52, 10100, 320, 500, 825, 270],
  ["funnel", "Phễu lệch", "Lòng chảo lệch tâm · Break dài", 3, 10.7, 60, 9300, 300, 285, 880, 465],
  ["westWind", "Dốc Tây", "Nghiêng ngang liên tục · Line phải bù", 3, 10.9, 59, 9400, 310, 505, 895, 255],
  ["eastWind", "Dốc Đông", "Break ngược chiều · Green trung bình", 3, 11.0, 58, 9500, 300, 255, 890, 500],
  ["uphill", "Lên đồi", "Putt ngược dốc · Cần thêm lực", 2, 9.8, 66, 9000, 600, 585, 600, 190],
  ["downhill", "Xuống đồi", "Putt xuôi dốc · Kiểm soát tốc độ", 3, 12.1, 51, 10000, 600, 180, 600, 565],
  ["spiral", "Xoáy ốc", "Dốc xoay quanh tâm · Break kép", 5, 11.7, 54, 10200, 300, 470, 880, 285],
  ["ripples", "Gợn sóng", "Nhiều gợn thấp · Tốc độ đổi liên tục", 4, 11.3, 56, 9800, 320, 270, 875, 475],
  ["horseshoe", "Móng ngựa", "Vành dốc cong · Line vòng cung", 5, 11.5, 55, 10100, 325, 520, 875, 255],
  ["diagonal", "Sống chéo", "Gờ cao cắt chéo green · Break muộn", 4, 11.2, 57, 9900, 315, 245, 890, 500],
  ["splitBasin", "Hai lòng chảo", "Hai vùng tụ bóng · Vượt gờ giữa", 5, 10.6, 61, 9600, 335, 485, 865, 285],
  ["terraces", "Ruộng bậc thang", "Ba bậc dốc dọc · Lực là chìa khóa", 5, 11.8, 53, 10300, 295, 500, 910, 260],
  ["volcano", "Miệng núi", "Vành cao bao tâm thấp · Line lạ", 5, 12.0, 51, 10400, 330, 265, 855, 490],
  ["championship", "Championship", "Địa hình tổng hợp · Thử thách cao", 5, 12.5, 48, 10600, 295, 520, 910, 235],
  ["crescent", "Lưỡi liềm", "Gờ cong ôm tâm · Break đổi hướng", 4, 11.4, 56, 9900, 310, 500, 895, 260],
  ["doublePeak", "Hai đỉnh", "Hai gò cao nối tiếp · Chọn khe line", 5, 11.7, 53, 10200, 300, 270, 905, 485],
  ["glass", "Mặt kính", "Dốc nhẹ khó thấy · Tốc độ cực nhanh", 5, 13.0, 45, 10500, 315, 520, 890, 245]
];

const colorSets = [
  ["#6a9948", "#477a38", "#274f2c"],
  ["#77a34c", "#4f8138", "#2a542e"],
  ["#83a95a", "#557d3d", "#294b2d"],
  ["#72a65a", "#477d42", "#244c35"]
];

const courses = courseSpecs.map((spec, index) => ({
  id: spec[0],
  number: String(index + 1).padStart(2, "0"),
  name: spec[1],
  detail: spec[2],
  difficulty: spec[3],
  stimp: spec[4],
  friction: spec[5],
  slopeForce: spec[6],
  colors: colorSets[index % colorSets.length],
  ball: { x: spec[7], y: spec[8] },
  hole: { x: spec[9], y: spec[10] },
  height: heightProfiles[spec[0]]
}));

let courseIndex = 0;
let course = courses[courseIndex];
let lastTime = performance.now();
let showTerrain = true;
let roundMode = true;
let strokeCount = 0;
let power = 0;
let charging = false;
let chargeStartedAt = 0;
let aimAngle = 0;
let placementMode = false;
let toastTimer = 0;
let traceAccumulator = 0;
let previousSafePosition = null;
let lastInsidePosition = null;
let pointerStart = null;
let cameraViewIndex = 0;
let sinkProgress = 0;
let celebrationTimer = 0;
let outOfBoundsTimer = 0;
let bestScores = loadScores();

const ball = { x: 0, y: 0, vx: 0, vy: 0, rolling: false, sunk: false, trail: [] };
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

let renderer;
let scene;
let camera;
let controls;
let terrainGroup;
let terrainMesh;
let terrainWire;
let slopeGroup;
let roughGround;
let holeGroup;
let flagMesh;
let ballGroup;
let ballMesh;
let aimLine;
let predictionLine;
let trailLine;
let aimHandle;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function magnitude(x, y) { return Math.hypot(x, y); }

function boundaryScale(angle) {
  const coursePhase = courseIndex * 0.7;
  return 1 + 0.055 * Math.sin(angle * 3 + coursePhase) + 0.035 * Math.cos(angle * 5 - 0.4);
}

function isInsideGreen(x, y, margin = 0) {
  const dx = x - WORLD.cx;
  const dy = y - WORLD.cy;
  const angle = Math.atan2(dy, dx);
  const scale = boundaryScale(angle);
  const rx = 535 * scale - margin;
  const ry = 315 * scale - margin;
  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

function gradientAt(x, y) {
  const step = 3;
  return {
    x: (course.height(x + step, y) - course.height(x - step, y)) / (step * 2),
    y: (course.height(x, y + step) - course.height(x, y - step)) / (step * 2)
  };
}

function worldPoint(x, y, offset = 0) {
  return new THREE.Vector3(
    (x - WORLD.cx) / PIXELS_PER_METER,
    course.height(x, y) * HEIGHT_SCALE + offset,
    (y - WORLD.cy) / PIXELS_PER_METER
  );
}

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#173624");
  scene.fog = new THREE.Fog("#173624", 24, 58);

  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.minDistance = 7;
  controls.maxDistance = 55;
  controls.minPolarAngle = 0.14;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.zoomToCursor = true;
  controls.target.set(0, 0, 0);

  const hemisphere = new THREE.HemisphereLight("#dff4ff", "#16331f", 2.35);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight("#fff5d2", 3.2);
  sun.position.set(-10, 18, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 45;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  const fill = new THREE.DirectionalLight("#8ec7ff", 0.55);
  fill.position.set(12, 7, -9);
  scene.add(fill);

  createRoughGround();
  createBall();
  createGuideObjects();
  resizeRenderer();
}

function createRoughGround() {
  const geometry = new THREE.PlaneGeometry(60, 42, 38, 28);
  geometry.rotateX(-Math.PI / 2);
  const positions = geometry.attributes.position;
  const colors = [];
  const dark = new THREE.Color("#163d27");
  const light = new THREE.Color("#245e37");
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    positions.setY(i, -2.25 + 0.08 * Math.sin(x * 1.8) + 0.06 * Math.cos(z * 2.1));
    const mix = 0.35 + 0.20 * Math.sin((x + z) * 1.7) + Math.random() * 0.12;
    const color = dark.clone().lerp(light, clamp(mix, 0, 1));
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  roughGround = new THREE.Mesh(geometry, material);
  roughGround.receiveShadow = true;
  scene.add(roughGround);
}

function createTerrainGeometry() {
  const segments = 144;
  const rings = 42;
  const positions = [];
  const colors = [];
  const indices = [];
  const lowColor = new THREE.Color(course.colors[2]);
  const highColor = new THREE.Color(course.colors[0]);

  const addVertex = (x, y) => {
      const height = course.height(x, y);
      positions.push((x - WORLD.cx) / PIXELS_PER_METER, height * HEIGHT_SCALE, (y - WORLD.cy) / PIXELS_PER_METER);
      const stripe = (Math.floor((x + y * 0.28) / 85) + courseIndex) % 2 === 0 ? 0.08 : -0.03;
      const heightMix = clamp(0.55 + height * 0.12 + stripe, 0.18, 0.88);
      const color = lowColor.clone().lerp(highColor, heightMix);
      colors.push(color.r, color.g, color.b);
  };

  addVertex(WORLD.cx, WORLD.cy);
  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = ring / rings;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * TAU;
      const scale = boundaryScale(angle);
      const x = WORLD.cx + Math.cos(angle) * 535 * scale * radius;
      const y = WORLD.cy + Math.sin(angle) * 315 * scale * radius;
      addVertex(x, y);
    }
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const current = 1 + segment;
    const next = 1 + ((segment + 1) % segments);
    indices.push(0, next, current);
  }

  for (let ring = 1; ring < rings; ring += 1) {
    const innerStart = 1 + (ring - 1) * segments;
    const outerStart = 1 + ring * segments;
    for (let segment = 0; segment < segments; segment += 1) {
      const nextSegment = (segment + 1) % segments;
      const a = innerStart + segment;
      const b = outerStart + segment;
      const c = innerStart + nextSegment;
      const d = outerStart + nextSegment;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function rebuildTerrain() {
  if (terrainGroup) {
    scene.remove(terrainGroup);
    disposeTree(terrainGroup);
  }

  terrainGroup = new THREE.Group();
  const geometry = createTerrainGeometry();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.93,
    metalness: 0,
    side: THREE.FrontSide
  });
  terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  terrainGroup.add(terrainMesh);

  terrainWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({ color: "#dff58a", transparent: true, opacity: 0.15, depthWrite: false })
  );
  terrainWire.position.y = 0.018;
  terrainWire.visible = showTerrain;
  terrainGroup.add(terrainWire);

  slopeGroup = createSlopeArrows();
  slopeGroup.visible = showTerrain;
  terrainGroup.add(slopeGroup);

  holeGroup = createHole();
  terrainGroup.add(holeGroup);
  scene.add(terrainGroup);
}

function createSlopeArrows() {
  const group = new THREE.Group();
  for (let y = 115; y <= 650; y += 105) {
    for (let x = 115; x <= 1085; x += 125) {
      if (!isInsideGreen(x, y, 42)) continue;
      const slope = gradientAt(x, y);
      const strength = magnitude(slope.x, slope.y);
      if (strength < 0.00045) continue;
      const horizontalX = -slope.x / strength;
      const horizontalZ = -slope.y / strength;
      const vertical = -strength * PIXELS_PER_METER * HEIGHT_SCALE;
      const direction = new THREE.Vector3(horizontalX, vertical, horizontalZ).normalize();
      const color = strength > 0.004 ? 0xf2a94a : 0xd7f05a;
      const length = clamp(0.48 + strength * 85, 0.5, 1.05);
      const origin = worldPoint(x, y, 0.12);
      const arrow = new THREE.ArrowHelper(direction, origin, length, color, 0.20, 0.11);
      arrow.traverse(child => {
        if (!child.material) return;
        child.material.transparent = true;
        child.material.opacity = 0.82;
        child.material.depthWrite = false;
      });
      group.add(arrow);
    }
  }
  return group;
}

function createHole() {
  const group = new THREE.Group();
  const surface = worldPoint(course.hole.x, course.hole.y, 0.015);
  group.position.copy(surface);

  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.155, 0.035, 32),
    new THREE.MeshStandardMaterial({ color: "#050706", roughness: 1 })
  );
  cup.position.y = -0.015;
  group.add(cup);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.012, 8, 32),
    new THREE.MeshStandardMaterial({ color: "#e6ece3", roughness: 0.55 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.01;
  group.add(rim);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 2.2, 12),
    new THREE.MeshStandardMaterial({ color: "#f3f4e8", roughness: 0.42 })
  );
  pole.position.y = 1.1;
  pole.castShadow = true;
  group.add(pole);

  const flagGeometry = new THREE.BufferGeometry();
  flagGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
    0, 0, 0,
    0.95, -0.25, 0,
    0, -0.52, 0
  ], 3));
  flagGeometry.setIndex([0, 1, 2]);
  flagGeometry.computeVertexNormals();
  flagMesh = new THREE.Mesh(
    flagGeometry,
    new THREE.MeshStandardMaterial({ color: "#d7f05a", side: THREE.DoubleSide, roughness: 0.55 })
  );
  flagMesh.position.y = 2.18;
  flagMesh.castShadow = true;
  group.add(flagMesh);
  return group;
}

function createBall() {
  ballGroup = new THREE.Group();
  const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 22);
  const material = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.27,
    clearcoat: 0.7,
    clearcoatRoughness: 0.3
  });
  ballMesh = new THREE.Mesh(geometry, material);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  ballGroup.add(ballMesh);

  const line = new THREE.Mesh(
    new THREE.TorusGeometry(BALL_RADIUS * 0.72, 0.008, 5, 36, Math.PI * 0.7),
    new THREE.MeshBasicMaterial({ color: "#263127" })
  );
  line.rotation.y = Math.PI / 2;
  line.rotation.z = -0.35;
  ballMesh.add(line);
  scene.add(ballGroup);
}

function createGuideObjects() {
  aimLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineDashedMaterial({ color: "#ffffff", transparent: true, opacity: 0.9, dashSize: 0.20, gapSize: 0.13 })
  );
  predictionLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineDashedMaterial({ color: "#d7f05a", transparent: true, opacity: 0.62, dashSize: 0.08, gapSize: 0.11 })
  );
  trailLine = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: "#f3b74a", transparent: true, opacity: 0.9 })
  );
  aimHandle = new THREE.Mesh(
    new THREE.RingGeometry(0.13, 0.21, 28),
    new THREE.MeshBasicMaterial({ color: "#d7f05a", side: THREE.DoubleSide, depthTest: false })
  );
  aimHandle.rotation.x = -Math.PI / 2;
  aimHandle.renderOrder = 5;
  scene.add(aimLine, predictionLine, trailLine, aimHandle);
}

function disposeTree(root) {
  root.traverse(object => {
    if (object.geometry) object.geometry.dispose();
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => material.dispose());
  });
}

function updateLine(line, points) {
  line.geometry.dispose();
  line.geometry = new THREE.BufferGeometry().setFromPoints(points);
  if (line.material.isLineDashedMaterial) line.computeLineDistances();
  line.visible = points.length > 1;
}

function predictPath() {
  const points = [];
  let x = ball.x;
  let y = ball.y;
  const previewPower = power > 3 ? power : 58;
  const speed = 110 + previewPower * 4.25;
  let vx = Math.cos(aimAngle) * speed;
  let vy = Math.sin(aimAngle) * speed;
  const dt = 0.045;
  for (let i = 0; i < 64; i += 1) {
    const slope = gradientAt(x, y);
    vx += -slope.x * course.slopeForce * dt;
    vy += -slope.y * course.slopeForce * dt;
    const velocity = magnitude(vx, vy);
    if (velocity <= 2) break;
    const slowed = Math.max(0, velocity - course.friction * dt);
    vx = (vx / velocity) * slowed;
    vy = (vy / velocity) * slowed;
    x += vx * dt;
    y += vy * dt;
    if (!isInsideGreen(x, y, 8)) break;
    if (i % 3 === 0) points.push(worldPoint(x, y, 0.09));
  }
  return points;
}

function refreshGuides() {
  if (!aimLine) return;
  if (ball.rolling || ball.sunk) {
    aimLine.visible = false;
    predictionLine.visible = false;
    aimHandle.visible = false;
  } else {
    const guideLength = 170;
    const endX = ball.x + Math.cos(aimAngle) * guideLength;
    const endY = ball.y + Math.sin(aimAngle) * guideLength;
    updateLine(aimLine, [worldPoint(ball.x, ball.y, BALL_RADIUS + 0.04), worldPoint(endX, endY, 0.10)]);
    const prediction = [worldPoint(ball.x, ball.y, 0.09), ...predictPath()];
    updateLine(predictionLine, prediction);
    aimHandle.position.copy(worldPoint(endX, endY, 0.11));
    aimHandle.visible = true;
  }

  const trail = ball.trail.map(point => worldPoint(point.x, point.y, 0.08));
  updateLine(trailLine, trail);
}

function syncBallMesh(dt = 0) {
  if (!ballGroup) return;
  const point = worldPoint(ball.x, ball.y, BALL_RADIUS);
  const sinkOffset = ball.sunk ? sinkProgress * 0.43 : 0;
  ballGroup.position.set(point.x, point.y - sinkOffset, point.z);
  const scale = ball.sunk ? 1 - sinkProgress * 0.42 : 1;
  ballGroup.scale.setScalar(Math.max(0.58, scale));
  ballGroup.visible = true;

  if (ball.rolling && dt > 0) {
    const speed = magnitude(ball.vx, ball.vy);
    if (speed > 0.1) {
      const axis = new THREE.Vector3(ball.vy, 0, -ball.vx).normalize();
      ballMesh.rotateOnWorldAxis(axis, speed * dt / PIXELS_PER_METER / BALL_RADIUS);
    }
  }
}

function resizeRenderer() {
  if (!renderer) return;
  const rect = canvas.getBoundingClientRect();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, rect.width < 680 ? 1.35 : 1.75));
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function setCameraView(index, focusBall = false) {
  if (!camera || !controls) return;
  cameraViewIndex = ((index % 3) + 3) % 3;
  const target = focusBall ? worldPoint(ball.x, ball.y, 0) : worldPoint(WORLD.cx, WORLD.cy, 0);
  const rect = canvas.getBoundingClientRect();
  const aspect = rect.width / Math.max(1, rect.height);
  const portraitScale = clamp(0.86 / Math.max(aspect, 0.35), 1, 1.72);
  let offset;
  if (cameraViewIndex === 1) {
    offset = new THREE.Vector3(-Math.cos(aimAngle) * 5.8, 3.6, -Math.sin(aimAngle) * 5.8);
  } else if (cameraViewIndex === 2) {
    offset = new THREE.Vector3(0.01, 27 * portraitScale, 0.01);
  } else {
    offset = new THREE.Vector3(0, 15.5 * portraitScale, 18.5 * portraitScale);
  }
  controls.target.copy(target);
  camera.position.copy(target).add(offset);
  camera.lookAt(target);
  controls.update();
  const labels = ["Toàn cảnh 3D", "Góc sát mặt green", "Góc nhìn từ trên"];
  showToast(labels[cameraViewIndex], "Kéo để xoay · Cuộn/chụm để zoom");
}

function focusCameraOnBall() {
  const target = worldPoint(ball.x, ball.y, 0);
  const offset = camera.position.clone().sub(controls.target);
  controls.target.copy(target);
  camera.position.copy(target).add(offset);
  controls.update();
  showToast("Đã về vị trí bóng", "Kéo để xoay quanh bóng");
}

function raycastGreen(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNdc, camera);
  const hit = raycaster.intersectObject(terrainMesh, false)[0];
  if (!hit) return null;
  return {
    x: hit.point.x * PIXELS_PER_METER + WORLD.cx,
    y: hit.point.z * PIXELS_PER_METER + WORLD.cy,
    point: hit.point
  };
}

function findBoundaryDrop(insidePoint, outsidePoint) {
  const inset = BALL_RADIUS * PIXELS_PER_METER + 4;
  let inside = insidePoint && isInsideGreen(insidePoint.x, insidePoint.y, inset)
    ? { x: insidePoint.x, y: insidePoint.y }
    : { x: WORLD.cx, y: WORLD.cy };
  let outside = { x: outsidePoint.x, y: outsidePoint.y };

  for (let i = 0; i < 24; i += 1) {
    const middle = { x: (inside.x + outside.x) / 2, y: (inside.y + outside.y) / 2 };
    if (isInsideGreen(middle.x, middle.y, inset)) inside = middle;
    else outside = middle;
  }
  return inside;
}

function updatePhysics(dt) {
  if (!ball.rolling || ball.sunk) return;
  const slope = gradientAt(ball.x, ball.y);
  ball.vx += -slope.x * course.slopeForce * dt;
  ball.vy += -slope.y * course.slopeForce * dt;

  const speed = magnitude(ball.vx, ball.vy);
  const slopeAcceleration = magnitude(slope.x * course.slopeForce, slope.y * course.slopeForce);
  if (speed > 0) {
    const nextSpeed = Math.max(0, speed - course.friction * dt);
    ball.vx = (ball.vx / speed) * nextSpeed;
    ball.vy = (ball.vy / speed) * nextSpeed;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  if (isInsideGreen(ball.x, ball.y, BALL_RADIUS * PIXELS_PER_METER + 4)) {
    lastInsidePosition = { x: ball.x, y: ball.y };
  }
  traceAccumulator += dt;
  if (traceAccumulator > 0.045) {
    ball.trail.push({ x: ball.x, y: ball.y });
    traceAccumulator = 0;
    refreshGuides();
  }

  const holeDistance = magnitude(ball.x - course.hole.x, ball.y - course.hole.y);
  const currentSpeed = magnitude(ball.vx, ball.vy);
  if (holeDistance < 13 && currentSpeed < 145) {
    sinkBall();
    return;
  }

  if (!isInsideGreen(ball.x, ball.y, -18)) {
    const dropPosition = findBoundaryDrop(lastInsidePosition || previousSafePosition, { x: ball.x, y: ball.y });
    ball.rolling = false;
    ball.vx = 0;
    ball.vy = 0;
    ui.puttButton.disabled = true;
    clearTimeout(outOfBoundsTimer);
    outOfBoundsTimer = setTimeout(() => {
      ball.x = dropPosition.x;
      ball.y = dropPosition.y;
      ball.trail.push({ x: dropPosition.x, y: dropPosition.y });
      lastInsidePosition = { ...dropPosition };
      strokeCount += 1;
      ui.strokeCount.textContent = strokeCount;
      ui.puttButton.disabled = false;
      updateDistance();
      refreshGuides();
      syncBallMesh();
      setStatus(`Bóng đặt tại mép green · Cú tiếp theo là gậy ${strokeCount + 1}`, false);
      showToast("Bóng ra ngoài", "Đặt tại điểm rời green · +1 gậy phạt");
    }, 450);
    return;
  }

  if (currentSpeed < 3.2 && slopeAcceleration < course.friction * 0.95) stopBall();
}

function stopBall() {
  ball.rolling = false;
  ball.vx = 0;
  ball.vy = 0;
  ui.puttButton.disabled = false;
  updateDistance();
  refreshGuides();
  setStatus(roundMode
    ? `Vị trí cú tiếp theo · Chuẩn bị gậy ${strokeCount + 1}`
    : "Bóng đã dừng · Chạm green để căn cú tiếp theo", false);
}

function sinkBall() {
  ball.x = course.hole.x;
  ball.y = course.hole.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.rolling = false;
  ball.sunk = true;
  ball.trail.push({ x: ball.x, y: ball.y });
  sinkProgress = 0;
  ui.puttButton.disabled = true;
  ui.distanceValue.textContent = "0.0";
  setStatus("Bóng đã vào lỗ · Đang ghi nhận điểm", false);
  refreshGuides();
  clearTimeout(celebrationTimer);
  celebrationTimer = setTimeout(() => showCelebration(), 720);
}

function hitBall() {
  if (ball.rolling || ball.sunk || power < 2) {
    resetPower();
    return;
  }
  const speed = 110 + power * 4.25;
  previousSafePosition = { x: ball.x, y: ball.y, strokeCount };
  lastInsidePosition = { x: ball.x, y: ball.y };
  ball.vx = Math.cos(aimAngle) * speed;
  ball.vy = Math.sin(aimAngle) * speed;
  ball.rolling = true;
  ball.trail = [{ x: ball.x, y: ball.y }];
  strokeCount += 1;
  ui.strokeCount.textContent = strokeCount;
  ui.puttButton.disabled = true;
  setStatus("Bóng đang lăn trên địa hình 3D...", true);
  resetPower();
  refreshGuides();
}

function retryLastShot() {
  if (roundMode) {
    loadCourse(courseIndex);
    showToast("Bắt đầu lại green", "Số gậy được tính lại từ 0");
    return;
  }
  clearTimeout(celebrationTimer);
  clearTimeout(outOfBoundsTimer);
  hideCelebration();
  const target = previousSafePosition || { x: course.ball.x, y: course.ball.y, strokeCount: 0 };
  ball.x = target.x;
  ball.y = target.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.rolling = false;
  ball.sunk = false;
  ball.trail = [];
  sinkProgress = 0;
  strokeCount = target.strokeCount;
  previousSafePosition = null;
  lastInsidePosition = { x: ball.x, y: ball.y };
  ui.strokeCount.textContent = strokeCount;
  ui.puttButton.disabled = false;
  resetPower();
  aimAtHole();
  updateDistance();
  refreshGuides();
  syncBallMesh();
  setStatus("Đã đưa bóng về trước cú đánh", false);
  showToast("Sẵn sàng đánh lại", "Lượt đánh vừa rồi đã được hoàn tác");
}

function startCharge(event) {
  if (event) event.preventDefault();
  if (ball.rolling || ball.sunk || charging) return;
  charging = true;
  chargeStartedAt = performance.now();
  ui.puttButton.classList.add("charging");
  ui.statusText.textContent = "Thả đúng lực bạn muốn";
}

function releaseCharge(event) {
  if (event) event.preventDefault();
  if (!charging) return;
  charging = false;
  ui.puttButton.classList.remove("charging");
  hitBall();
}

function updateCharge(now) {
  if (!charging) return;
  const cycle = ((now - chargeStartedAt) % 2400) / 1200;
  const t = cycle <= 1 ? cycle : 2 - cycle;
  power = 5 + t * 95;
  updatePowerUI();
  refreshGuides();
}

function updatePowerUI() {
  const rounded = Math.round(power);
  ui.powerValue.textContent = `${rounded}%`;
  ui.powerFill.style.width = `${power}%`;
  ui.powerMarker.style.left = `${power}%`;
}

function resetPower() {
  charging = false;
  power = 0;
  ui.puttButton.classList.remove("charging");
  updatePowerUI();
}

function setAim(angle) {
  aimAngle = Math.atan2(Math.sin(angle), Math.cos(angle));
  let degrees = Math.round(aimAngle * 180 / Math.PI);
  if (Object.is(degrees, -0)) degrees = 0;
  ui.angleValue.textContent = `${degrees > 0 ? "+" : ""}${degrees}°`;
  refreshGuides();
}

function aimAtHole() {
  setAim(Math.atan2(course.hole.y - ball.y, course.hole.x - ball.x));
}

function setStatus(text, rolling) {
  ui.statusText.textContent = text;
  ui.statusPill.classList.toggle("rolling", Boolean(rolling));
}

function syncRoundModeUI() {
  ui.roundModeButton.classList.toggle("active", roundMode);
  ui.roundModeButton.setAttribute("aria-pressed", String(roundMode));
  ui.roundModeLabel.textContent = roundMode ? "Tính gậy: BẬT" : "Luyện tự do";
  ui.placeBallButton.classList.toggle("locked", roundMode);
  ui.retryButton.title = roundMode ? "Bắt đầu lại green và tính lại từ 0" : "Hoàn tác cú đánh gần nhất";
  ui.placeBallButton.title = roundMode ? "Tắt chế độ tính gậy để đặt bóng tự do" : "Đặt bóng tại vị trí luyện tập";
}

function setRoundMode(enabled) {
  roundMode = Boolean(enabled);
  syncRoundModeUI();
  loadCourse(courseIndex);
  showToast(
    roundMode ? "Đã bật chơi tính gậy" : "Đã chuyển sang luyện tự do",
    roundMode ? "Mọi cú đánh và gậy phạt được tính từ đầu green" : "Có thể đặt bóng và hoàn tác từng cú"
  );
}

function setPlacementMode(enabled) {
  placementMode = Boolean(enabled) && !roundMode && !ball.rolling && !ball.sunk;
  ui.placeBallButton.classList.toggle("active", placementMode);
  ui.placeBallButton.setAttribute("aria-pressed", String(placementMode));
  canvas.classList.toggle("placing", placementMode);
  if (controls) controls.enabled = !placementMode;
  if (placementMode) setStatus("Chạm một vị trí trên mô hình để đặt bóng", false);
  else if (!ball.rolling && !ball.sunk) {
    setStatus(roundMode ? `Gậy ${strokeCount + 1} · Chạm green để căn hướng` : "Kéo để xoay · Chạm green để căn hướng", false);
  }
}

function placeBallAt(x, y) {
  if (!isInsideGreen(x, y, 22)) {
    showToast("Không thể đặt bóng", "Hãy chọn vị trí bên trong green");
    return false;
  }
  ball.x = x;
  ball.y = y;
  ball.vx = 0;
  ball.vy = 0;
  ball.rolling = false;
  ball.sunk = false;
  ball.trail = [];
  sinkProgress = 0;
  previousSafePosition = null;
  lastInsidePosition = { x, y };
  ui.puttButton.disabled = false;
  resetPower();
  aimAtHole();
  updateDistance();
  refreshGuides();
  syncBallMesh();
  setPlacementMode(false);
  showToast("Đã đặt lại bóng", `${ui.distanceValue.textContent} m tới cờ`);
  return true;
}

function updateDistance() {
  const distance = magnitude(course.hole.x - ball.x, course.hole.y - ball.y) / PIXELS_PER_METER;
  ui.distanceValue.textContent = distance.toFixed(1);
}

function showToast(title, detail, duration = 1700) {
  clearTimeout(toastTimer);
  ui.toast.innerHTML = `${title}<small>${detail}</small>`;
  ui.toast.classList.add("show");
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), duration);
}

function loadScores() {
  try {
    const stored = JSON.parse(localStorage.getItem(SCORE_STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch (error) {
    console.warn("Không thể đọc điểm đã lưu.", error);
    return {};
  }
}

function saveScores() {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(bestScores));
  } catch (error) {
    console.warn("Không thể lưu điểm.", error);
  }
}

function totalScore() {
  return Object.values(bestScores).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

function calculateGreenScore() {
  return Math.max(100, 900 + course.difficulty * 110 - Math.max(0, strokeCount - 1) * 170);
}

function updateScoreUI() {
  ui.scoreValue.textContent = totalScore().toLocaleString("vi-VN");
}

function showCelebration() {
  const earned = roundMode ? calculateGreenScore() : 0;
  const previousBest = Number(bestScores[course.id]) || 0;
  const isNewBest = roundMode && earned > previousBest;
  if (isNewBest) {
    bestScores[course.id] = earned;
    saveScores();
  }
  updateScoreUI();

  ui.celebrationTitle.textContent = strokeCount === 1 ? "Hole in one!" : strokeCount <= 2 ? "Cú putt xuất sắc!" : "Bóng đã vào lỗ!";
  ui.celebrationMessage.textContent = roundMode
    ? `${course.name} · ${isNewBest ? "Kỷ lục mới đã được lưu" : "Green đã hoàn thành"}`
    : `${course.name} · Hoàn thành luyện tập, điểm không được lưu`;
  ui.celebrationScore.textContent = `+${earned.toLocaleString("vi-VN")}`;
  ui.celebrationStrokes.textContent = String(strokeCount);
  ui.celebrationTotal.textContent = totalScore().toLocaleString("vi-VN");
  ui.celebration.hidden = false;
  requestAnimationFrame(() => ui.celebration.classList.add("show"));
  setStatus(roundMode ? "Hoàn thành green · Điểm và số gậy đã được ghi nhận" : "Hoàn thành green luyện tập", false);
  playSuccessSound();
}

function hideCelebration() {
  ui.celebration.classList.remove("show");
  ui.celebration.hidden = true;
}

function playSuccessSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = new AudioContext();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      const start = audio.currentTime + index * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.34);
    });
  } catch (error) {
    console.warn("Không thể phát âm thanh chúc mừng.", error);
  }
}

function populateCourseSelect() {
  const fragment = document.createDocumentFragment();
  courses.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.number} · ${item.name}`;
    fragment.appendChild(option);
  });
  ui.courseSelect.replaceChildren(fragment);
}

function loadCourse(index) {
  clearTimeout(celebrationTimer);
  clearTimeout(outOfBoundsTimer);
  hideCelebration();
  courseIndex = (index + courses.length) % courses.length;
  course = courses[courseIndex];
  ball.x = course.ball.x;
  ball.y = course.ball.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.rolling = false;
  ball.sunk = false;
  ball.trail = [];
  sinkProgress = 0;
  previousSafePosition = null;
  lastInsidePosition = { x: ball.x, y: ball.y };
  setPlacementMode(false);
  strokeCount = 0;
  ui.strokeCount.textContent = "0";
  ui.stimpValue.textContent = course.stimp.toFixed(1);
  ui.greenNumber.textContent = `GREEN ${course.number}`;
  ui.greenName.textContent = course.name;
  ui.greenDescription.textContent = course.detail;
  ui.courseSelect.value = course.id;
  ui.difficulty.forEach((node, i) => node.classList.toggle("active", i < course.difficulty));
  ui.puttButton.disabled = false;
  resetPower();
  rebuildTerrain();
  aimAtHole();
  updateDistance();
  updateScoreUI();
  syncRoundModeUI();
  syncBallMesh();
  refreshGuides();
  setCameraView(0);
  setStatus(roundMode ? "Gậy 1 · Chạm green để căn hướng" : "Kéo để xoay · Chạm green để căn hướng", false);
  showToast(course.name, course.detail);
}

function onScenePointerDown(event) {
  if (!event.isPrimary || event.button !== 0) return;
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
}

function onScenePointerUp(event) {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  const movement = magnitude(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (movement > 8 || ball.rolling || ball.sunk) return;
  const hit = raycastGreen(event.clientX, event.clientY);
  if (!hit) return;
  if (placementMode) {
    placeBallAt(hit.x, hit.y);
    return;
  }
  if (magnitude(hit.x - ball.x, hit.y - ball.y) < 16) return;
  setAim(Math.atan2(hit.y - ball.y, hit.x - ball.x));
  setStatus("Đã cập nhật hướng đánh trên mô hình 3D", false);
}

function bindEvents() {
  window.addEventListener("resize", resizeRenderer);
  canvas.addEventListener("pointerdown", onScenePointerDown);
  canvas.addEventListener("pointerup", onScenePointerUp);
  canvas.addEventListener("pointercancel", () => { pointerStart = null; });

  ui.puttButton.addEventListener("pointerdown", startCharge);
  ui.puttButton.addEventListener("pointerup", releaseCharge);
  ui.puttButton.addEventListener("pointercancel", releaseCharge);
  ui.puttButton.addEventListener("pointerleave", event => {
    if (charging && event.pointerType === "mouse") releaseCharge(event);
  });

  window.addEventListener("keydown", event => {
    if (event.code === "Space" && !event.repeat && !ui.helpDialog.open && ui.celebration.hidden) startCharge(event);
    if (event.code === "ArrowLeft" && !ball.rolling) setAim(aimAngle - Math.PI / 180);
    if (event.code === "ArrowRight" && !ball.rolling) setAim(aimAngle + Math.PI / 180);
    if (event.code === "KeyM" && !ui.helpDialog.open) {
      if (roundMode) showToast("Đang chơi tính gậy", "Chuyển sang Luyện tự do để đặt bóng");
      else setPlacementMode(!placementMode);
    }
    if (event.code === "KeyR" && !ui.helpDialog.open) retryLastShot();
    if (event.code === "Escape" && placementMode) setPlacementMode(false);
  });
  window.addEventListener("keyup", event => { if (event.code === "Space") releaseCharge(event); });

  ui.aimLeft.addEventListener("click", () => { if (!ball.rolling) setAim(aimAngle - 2 * Math.PI / 180); });
  ui.aimRight.addEventListener("click", () => { if (!ball.rolling) setAim(aimAngle + 2 * Math.PI / 180); });
  ui.slopeButton.addEventListener("click", () => {
    showTerrain = !showTerrain;
    terrainWire.visible = showTerrain;
    slopeGroup.visible = showTerrain;
    ui.slopeButton.classList.toggle("active", showTerrain);
    ui.slopeButton.setAttribute("aria-pressed", String(showTerrain));
    showToast(showTerrain ? "Đã bật phân tích địa hình" : "Đã ẩn lớp phân tích", showTerrain ? "Lưới cao độ và mũi tên dốc đang hiển thị" : "Vẫn có thể xoay mô hình 3D tự do");
  });
  ui.centerButton.addEventListener("click", focusCameraOnBall);
  ui.placeBallButton.addEventListener("click", () => {
    if (roundMode) {
      showToast("Đang chơi tính gậy", "Chuyển sang Luyện tự do để đặt bóng");
      return;
    }
    if (ball.rolling) {
      showToast("Bóng đang lăn", "Đợi bóng dừng rồi đặt lại vị trí");
      return;
    }
    setPlacementMode(!placementMode);
  });
  ui.retryButton.addEventListener("click", retryLastShot);
  ui.roundModeButton.addEventListener("click", () => setRoundMode(!roundMode));
  ui.zoomButton.addEventListener("click", () => setCameraView(cameraViewIndex + 1, cameraViewIndex === 0));
  ui.courseSelect.addEventListener("change", event => {
    const index = courses.findIndex(item => item.id === event.target.value);
    loadCourse(index);
  });

  ui.celebrationRetry.addEventListener("click", () => loadCourse(courseIndex));
  ui.celebrationNext.addEventListener("click", () => loadCourse(courseIndex + 1));
  ui.helpButton.addEventListener("click", () => ui.helpDialog.showModal());
  ui.closeHelp.addEventListener("click", () => ui.helpDialog.close());
  ui.startPlaying.addEventListener("click", () => ui.helpDialog.close());
  ui.helpDialog.addEventListener("click", event => {
    if (event.target === ui.helpDialog) ui.helpDialog.close();
  });
}

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  updateCharge(now);
  updatePhysics(dt);
  if (ball.sunk) sinkProgress = Math.min(1, sinkProgress + dt * 1.65);
  syncBallMesh(dt);
  if (flagMesh) flagMesh.rotation.y = Math.sin(now * 0.0018) * 0.12;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(gameLoop);
}

function showFatalError(error) {
  console.error("Không thể khởi tạo game 3D.", error);
  ui.sceneLoading.innerHTML = "<strong>Không thể tải chế độ 3D.</strong><small>Hãy tải lại trang hoặc bật tăng tốc phần cứng của trình duyệt.</small>";
}

function init() {
  try {
    initScene();
    populateCourseSelect();
    bindEvents();
    loadCourse(0);
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);
    setTimeout(() => ui.sceneLoading.classList.add("done"), 350);
  } catch (error) {
    showFatalError(error);
  }
}

init();
