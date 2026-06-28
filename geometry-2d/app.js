"use strict";

const canvas = document.getElementById("geometryCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  problemInput: document.getElementById("problemInput"),
  questionInput: document.getElementById("questionInput"),
  aiPanel: document.querySelector(".ai-panel"),
  aiProvider: document.getElementById("aiProvider"),
  aiApiKey: document.getElementById("aiApiKey"),
  aiModel: document.getElementById("aiModel"),
  aiEndpoint: document.getElementById("aiEndpoint"),
  saveAiKey: document.getElementById("saveAiKey"),
  aiModeText: document.getElementById("aiModeText"),
  clearAiKeyBtn: document.getElementById("clearAiKeyBtn"),
  generateBtn: document.getElementById("generateBtn"),
  solveBtn: document.getElementById("solveBtn"),
  loadSampleBtn: document.getElementById("loadSampleBtn"),
  clearSolutionBtn: document.getElementById("clearSolutionBtn"),
  copySolutionBtn: document.getElementById("copySolutionBtn"),
  solutionOutput: document.getElementById("solutionOutput"),
  solutionTitle: document.getElementById("solutionTitle"),
  statusText: document.getElementById("statusText"),
  stageTip: document.getElementById("stageTip"),
  tools: [...document.querySelectorAll(".tool")],
  colorPicker: document.getElementById("colorPicker"),
  strokeWidth: document.getElementById("strokeWidth"),
  shapePreset: document.getElementById("shapePreset"),
  insertPresetBtn: document.getElementById("insertPresetBtn"),
  specialPoint: document.getElementById("specialPoint"),
  addSpecialBtn: document.getElementById("addSpecialBtn"),
  undoBtn: document.getElementById("undoBtn"),
  redoBtn: document.getElementById("redoBtn"),
  fitBtn: document.getElementById("fitBtn"),
  exportBtn: document.getElementById("exportBtn"),
  saveBtn: document.getElementById("saveBtn"),
  zoomInBtn: document.getElementById("zoomInBtn"),
  zoomOutBtn: document.getElementById("zoomOutBtn"),
  gridBtn: document.getElementById("gridBtn")
};

const STORAGE_KEY = "geometry-2d-ai-scene-v1";
const AI_SETTINGS_KEY = "geometry-2d-ai-settings-v1";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_PROVIDER = "gemini";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const BASE_COLOR = "#58a6ff";
const POINT_COLOR = "#edf7f2";
const LABEL_COLOR = "#f7fff9";
const GRID_COLOR = "rgba(231,244,237,0.07)";
const AXIS_COLOR = "rgba(231,244,237,0.16)";

let scene = createEmptyScene();
let tool = "select";
let showGrid = true;
let dpr = 1;
let viewport = { x: 0, y: 0, scale: 1 };
let drag = null;
let tempPoints = [];
let selected = null;
let history = [];
let historyIndex = -1;
let pointCounter = 0;

const samples = [
  "Cho hình chữ nhật ABCD có AB = 8cm, BC = 6cm. Kẻ đường cao AH của tam giác ABD. Hãy tính BD, AH và chứng minh hai tam giác đồng dạng.",
  "Cho tam giác ABC có A(0;4), B(-4;-2), C(5;-1). Vẽ trung tuyến AM, đường cao AH và trọng tâm G.",
  "Cho tam giác ABC nội tiếp đường tròn tâm O. Vẽ các cạnh, đường tròn ngoại tiếp và tâm O."
];

const aiSceneSchema = {
  name: "geometry_scene",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["points", "segments", "circles", "polygons", "angles", "texts", "meta"],
    properties: {
      points: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "label", "x", "y", "color", "radius", "labelColor", "role"],
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
            color: { type: "string" },
            radius: { type: "number" },
            labelColor: { type: "string" },
            role: { type: "string" }
          }
        }
      },
      segments: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "from", "to", "color", "width", "dashed", "role"],
          properties: {
            id: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
            color: { type: "string" },
            width: { type: "number" },
            dashed: { type: "boolean" },
            role: { type: "string" }
          }
        }
      },
      circles: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "center", "radius", "color", "width", "dashed", "role"],
          properties: {
            id: { type: "string" },
            center: { type: "string" },
            radius: { type: "number" },
            color: { type: "string" },
            width: { type: "number" },
            dashed: { type: "boolean" },
            role: { type: "string" }
          }
        }
      },
      polygons: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "points", "color", "width", "fill"],
          properties: {
            id: { type: "string" },
            points: { type: "array", items: { type: "string" } },
            color: { type: "string" },
            width: { type: "number" },
            fill: { type: "string" }
          }
        }
      },
      angles: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "a", "o", "b", "radius", "color"],
          properties: {
            id: { type: "string" },
            a: { type: "string" },
            o: { type: "string" },
            b: { type: "string" },
            radius: { type: "number" },
            color: { type: "string" }
          }
        }
      },
      texts: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "x", "y", "text", "color", "size"],
          properties: {
            id: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
            text: { type: "string" },
            color: { type: "string" },
            size: { type: "number" }
          }
        }
      },
      meta: {
        type: "object",
        additionalProperties: false,
        required: ["type", "prompt", "ab", "bc", "notes"],
        properties: {
          type: { type: "string" },
          prompt: { type: "string" },
          ab: { type: "number" },
          bc: { type: "number" },
          notes: { type: "array", items: { type: "string" } }
        }
      }
    }
  }
};

const aiSolutionSchema = {
  name: "geometry_solution",
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "steps", "finalAnswer"],
    properties: {
      title: { type: "string" },
      steps: { type: "array", items: { type: "string" } },
      finalAnswer: { type: "string" }
    }
  }
};

function createEmptyScene() {
  return {
    points: [],
    segments: [],
    circles: [],
    polygons: [],
    angles: [],
    texts: [],
    meta: {}
  };
}

function cloneScene(value = scene) {
  return JSON.parse(JSON.stringify(value));
}

function setScene(nextScene, reason = "Đã cập nhật hình vẽ.") {
  scene = nextScene;
  pointCounter = Math.max(pointCounter, ...scene.points.map((p) => labelIndex(p.label))) + 1;
  selected = null;
  tempPoints = [];
  pushHistory();
  setStatus(reason);
  draw();
}

function pushHistory() {
  const snapshot = JSON.stringify(scene);
  if (history[historyIndex] === snapshot) return;
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot);
  if (history.length > 80) history.shift();
  historyIndex = history.length - 1;
  updateHistoryButtons();
}

function restoreHistory(index) {
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  scene = JSON.parse(history[historyIndex]);
  selected = null;
  tempPoints = [];
  updateHistoryButtons();
  draw();
}

function updateHistoryButtons() {
  ui.undoBtn.disabled = historyIndex <= 0;
  ui.redoBtn.disabled = historyIndex >= history.length - 1;
}

function labelIndex(label) {
  if (!label || !/^[A-Z]$/.test(label)) return 0;
  return label.charCodeAt(0) - 64;
}

function setStatus(message) {
  ui.statusText.textContent = message;
  ui.stageTip.textContent = message;
}

function loadAISettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || "null");
    ui.aiProvider.value = saved?.provider || DEFAULT_PROVIDER;
    ui.aiModel.value = saved?.model || defaultModelForProvider(ui.aiProvider.value);
    ui.aiEndpoint.value = saved?.endpoint || "";
    if (saved?.apiKey) {
      ui.aiApiKey.value = saved.apiKey;
      ui.saveAiKey.checked = true;
    }
  } catch {
    ui.aiProvider.value = DEFAULT_PROVIDER;
    ui.aiModel.value = DEFAULT_GEMINI_MODEL;
  }
  updateAIMode();
}

function saveAISettings() {
  const data = {
    provider: getAISettings().provider,
    model: getAISettings().model,
    endpoint: getAISettings().endpoint
  };
  if (ui.saveAiKey.checked && ui.aiApiKey.value.trim()) {
    data.apiKey = ui.aiApiKey.value.trim();
  }
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(data));
  updateAIMode();
}

function clearAIKey() {
  ui.aiApiKey.value = "";
  ui.saveAiKey.checked = false;
  localStorage.removeItem(AI_SETTINGS_KEY);
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify({
    provider: getAISettings().provider,
    model: getAISettings().model,
    endpoint: getAISettings().endpoint
  }));
  updateAIMode();
  setStatus("Đã xóa API key khỏi trình duyệt này.");
}

function getAISettings() {
  const provider = ui.aiProvider.value || DEFAULT_PROVIDER;
  return {
    provider,
    apiKey: ui.aiApiKey.value.trim(),
    model: ui.aiModel.value.trim() || defaultModelForProvider(provider),
    endpoint: ui.aiEndpoint.value.trim()
  };
}

function hasAIKey() {
  return Boolean(getAISettings().apiKey);
}

function defaultModelForProvider(provider) {
  return provider === "openai" ? DEFAULT_OPENAI_MODEL : DEFAULT_GEMINI_MODEL;
}

function updateProviderDefaults() {
  const currentModel = ui.aiModel.value.trim();
  const defaultModels = [DEFAULT_GEMINI_MODEL, DEFAULT_OPENAI_MODEL, ""];
  if (defaultModels.includes(currentModel)) {
    ui.aiModel.value = defaultModelForProvider(ui.aiProvider.value);
  }
  updateAIMode();
}

function updateAIMode(error = "") {
  const settings = getAISettings();
  const ready = Boolean(settings.apiKey);
  const providerName = settings.provider === "openai" ? "OpenAI" : "Gemini";
  ui.aiPanel.classList.toggle("ready", ready && !error);
  ui.aiPanel.classList.toggle("error", Boolean(error));
  if (error) {
    ui.aiModeText.textContent = error;
    return;
  }
  ui.aiModeText.textContent = ready
    ? `Đã bật AI thật (${providerName}, ${settings.model}).`
    : "Chưa nhập API key: app đang dùng AI demo trong trình duyệt.";
  if (ready && settings.provider === "openai" && !settings.endpoint) {
    ui.aiModeText.textContent = "OpenAI trên GitHub Pages cần endpoint proxy/backend; nếu bỏ trống có thể bị trình duyệt chặn.";
  }
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  draw();
}

function worldToScreen(point) {
  return {
    x: (point.x * viewport.scale + viewport.x) * dpr,
    y: (point.y * viewport.scale + viewport.y) * dpr
  };
}

function screenToWorld(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) - viewport.x) / viewport.scale,
    y: ((clientY - rect.top) - viewport.y) / viewport.scale
  };
}

function snapPoint(point) {
  const grid = 20;
  return {
    x: Math.round(point.x / grid) * grid,
    y: Math.round(point.y / grid) * grid
  };
}

function draw() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b1110";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showGrid) drawGrid();
  scene.polygons.forEach(drawPolygon);
  scene.circles.forEach(drawCircle);
  scene.segments.forEach(drawSegment);
  scene.angles.forEach(drawAngle);
  scene.points.forEach(drawPoint);
  scene.texts.forEach(drawText);
  drawTemp();
}

function drawGrid() {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const step = 20 * viewport.scale;
  if (step < 8) return;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 1;

  const startX = mod(viewport.x, step);
  const startY = mod(viewport.y, step);

  ctx.strokeStyle = GRID_COLOR;
  ctx.beginPath();
  for (let x = startX; x <= width; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y <= height; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  const origin = worldToScreen({ x: 0, y: 0 });
  ctx.strokeStyle = AXIS_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, origin.y / dpr);
  ctx.lineTo(width, origin.y / dpr);
  ctx.moveTo(origin.x / dpr, 0);
  ctx.lineTo(origin.x / dpr, height);
  ctx.stroke();
  ctx.restore();
}

function mod(value, step) {
  return ((value % step) + step) % step;
}

function drawPolygon(poly) {
  const pts = poly.points.map(findPoint).filter(Boolean);
  if (pts.length < 3) return;

  ctx.save();
  ctx.beginPath();
  pts.forEach((p, index) => {
    const s = worldToScreen(p);
    if (index === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  });
  ctx.closePath();
  ctx.fillStyle = poly.fill || "rgba(88,166,255,0.08)";
  ctx.strokeStyle = poly.color || BASE_COLOR;
  ctx.lineWidth = (poly.width || 2) * dpr;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSegment(seg) {
  const a = findPoint(seg.from);
  const b = findPoint(seg.to);
  if (!a || !b) return;

  const start = worldToScreen(a);
  const end = worldToScreen(b);
  ctx.save();
  ctx.strokeStyle = seg.color || BASE_COLOR;
  ctx.lineWidth = (seg.width || 2) * dpr;
  ctx.lineCap = "round";
  ctx.setLineDash(seg.dashed ? [8 * dpr, 8 * dpr] : []);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

function drawCircle(circle) {
  const center = findPoint(circle.center);
  if (!center) return;
  const s = worldToScreen(center);
  ctx.save();
  ctx.strokeStyle = circle.color || BASE_COLOR;
  ctx.lineWidth = (circle.width || 2) * dpr;
  ctx.setLineDash(circle.dashed ? [8 * dpr, 8 * dpr] : []);
  ctx.beginPath();
  ctx.arc(s.x, s.y, Math.abs(circle.radius * viewport.scale * dpr), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawAngle(angle) {
  const a = findPoint(angle.a);
  const o = findPoint(angle.o);
  const b = findPoint(angle.b);
  if (!a || !o || !b) return;

  const os = worldToScreen(o);
  const start = Math.atan2(a.y - o.y, a.x - o.x);
  const end = Math.atan2(b.y - o.y, b.x - o.x);
  const radius = (angle.radius || 34) * viewport.scale * dpr;

  ctx.save();
  ctx.strokeStyle = angle.color || "#42d392";
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.arc(os.x, os.y, radius, start, end, normalizeArc(start, end) > Math.PI);
  ctx.stroke();
  ctx.restore();
}

function normalizeArc(start, end) {
  let value = end - start;
  while (value < 0) value += Math.PI * 2;
  while (value > Math.PI * 2) value -= Math.PI * 2;
  return value;
}

function drawPoint(point) {
  const s = worldToScreen(point);
  const isSelected = selected && selected.type === "point" && selected.id === point.id;
  ctx.save();
  ctx.fillStyle = point.color || POINT_COLOR;
  ctx.strokeStyle = isSelected ? "#42d392" : "rgba(11,17,16,0.92)";
  ctx.lineWidth = (isSelected ? 3 : 2) * dpr;
  ctx.beginPath();
  ctx.arc(s.x, s.y, (point.radius || 5) * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (point.label) {
    ctx.font = `${13 * dpr}px Segoe UI, Arial`;
    ctx.fillStyle = point.labelColor || LABEL_COLOR;
    ctx.textBaseline = "bottom";
    ctx.fillText(point.label, s.x + 8 * dpr, s.y - 7 * dpr);
  }
  ctx.restore();
}

function drawText(item) {
  const s = worldToScreen(item);
  ctx.save();
  ctx.font = `${(item.size || 15) * dpr}px Segoe UI, Arial`;
  ctx.fillStyle = item.color || LABEL_COLOR;
  ctx.fillText(item.text || "", s.x, s.y);
  ctx.restore();
}

function drawTemp() {
  if (!tempPoints.length) return;
  ctx.save();
  ctx.fillStyle = "#42d392";
  tempPoints.forEach((p) => {
    const s = worldToScreen(p);
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function findPoint(idOrLabel) {
  return scene.points.find((p) => p.id === idOrLabel || p.label === idOrLabel);
}

function addPoint(x, y, label = nextLabel(), options = {}) {
  const point = {
    id: uniqueId("p"),
    x,
    y,
    label,
    color: options.color || POINT_COLOR,
    radius: options.radius || 5,
    labelColor: options.labelColor || LABEL_COLOR,
    role: options.role || ""
  };
  scene.points.push(point);
  return point;
}

function addSegment(from, to, options = {}) {
  const segment = {
    id: uniqueId("s"),
    from: typeof from === "string" ? from : from.id,
    to: typeof to === "string" ? to : to.id,
    color: options.color || ui.colorPicker.value || BASE_COLOR,
    width: options.width || Number(ui.strokeWidth.value) || 2,
    dashed: Boolean(options.dashed),
    role: options.role || ""
  };
  scene.segments.push(segment);
  return segment;
}

function addCircle(center, radius, options = {}) {
  const circle = {
    id: uniqueId("c"),
    center: typeof center === "string" ? center : center.id,
    radius,
    color: options.color || ui.colorPicker.value || BASE_COLOR,
    width: options.width || Number(ui.strokeWidth.value) || 2,
    dashed: Boolean(options.dashed),
    role: options.role || ""
  };
  scene.circles.push(circle);
  return circle;
}

function addText(x, y, text, options = {}) {
  const item = {
    id: uniqueId("t"),
    x,
    y,
    text,
    color: options.color || LABEL_COLOR,
    size: options.size || 15
  };
  scene.texts.push(item);
  return item;
}

function uniqueId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function nextLabel() {
  const label = String.fromCharCode(65 + (pointCounter % 26));
  pointCounter += 1;
  return label;
}

function setTool(nextTool) {
  tool = nextTool;
  tempPoints = [];
  ui.tools.forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));

  const tips = {
    select: "Chọn/kéo điểm để chỉnh hình. Kéo nền để di chuyển khung nhìn.",
    point: "Bấm lên lưới để thêm điểm mới.",
    segment: "Bấm 2 điểm để vẽ đoạn thẳng.",
    dashed: "Bấm 2 điểm để vẽ đoạn nét đứt.",
    circle: "Bấm tâm rồi bấm một điểm trên đường tròn.",
    polygon: "Bấm các đỉnh đa giác, bấm gần đỉnh đầu để khép kín.",
    angle: "Bấm 3 điểm theo thứ tự cạnh - đỉnh - cạnh để đánh dấu góc.",
    text: "Bấm vị trí cần đặt văn bản.",
    erase: "Bấm vào điểm, đoạn, đường tròn hoặc chữ để xóa."
  };
  setStatus(tips[tool] || "Sẵn sàng.");
  draw();
}

function handlePointerDown(event) {
  canvas.setPointerCapture(event.pointerId);
  const raw = screenToWorld(event.clientX, event.clientY);
  const point = event.shiftKey ? raw : snapPoint(raw);
  const hit = hitTest(raw);

  if (tool === "select") {
    if (hit && hit.type === "point") {
      selected = hit;
      drag = { mode: "point", id: hit.id };
      setStatus(`Đang kéo điểm ${findPoint(hit.id)?.label || ""}.`);
    } else {
      selected = null;
      drag = { mode: "pan", startX: event.clientX, startY: event.clientY, vx: viewport.x, vy: viewport.y };
      canvas.classList.add("grabbing");
    }
    draw();
    return;
  }

  if (tool === "erase") {
    if (hit) {
      removeHit(hit);
      pushHistory();
      setStatus("Đã xóa đối tượng.");
      draw();
    }
    return;
  }

  if (tool === "point") {
    addPoint(point.x, point.y);
    pushHistory();
    setStatus("Đã thêm điểm.");
    draw();
    return;
  }

  if (tool === "text") {
    const text = window.prompt("Nhập nội dung văn bản:", "Ghi chú");
    if (text) {
      addText(point.x, point.y, text);
      pushHistory();
      setStatus("Đã thêm văn bản.");
      draw();
    }
    return;
  }

  handleMultiPointTool(point, hit);
}

function handlePointerMove(event) {
  if (!drag) return;

  if (drag.mode === "pan") {
    viewport.x = drag.vx + event.clientX - drag.startX;
    viewport.y = drag.vy + event.clientY - drag.startY;
    draw();
    return;
  }

  if (drag.mode === "point") {
    const raw = screenToWorld(event.clientX, event.clientY);
    const point = event.shiftKey ? raw : snapPoint(raw);
    const target = findPoint(drag.id);
    if (target) {
      target.x = point.x;
      target.y = point.y;
      draw();
    }
  }
}

function handlePointerUp() {
  if (drag && drag.mode === "point") {
    pushHistory();
    setStatus("Đã cập nhật vị trí điểm.");
  }
  drag = null;
  canvas.classList.remove("grabbing");
}

function handleMultiPointTool(point, hit) {
  const actual = hit && hit.type === "point" ? findPoint(hit.id) : addPoint(point.x, point.y);
  tempPoints.push(actual);

  if ((tool === "segment" || tool === "dashed") && tempPoints.length === 2) {
    addSegment(tempPoints[0], tempPoints[1], { dashed: tool === "dashed" });
    tempPoints = [];
    pushHistory();
    setStatus("Đã vẽ đoạn thẳng.");
  }

  if (tool === "circle" && tempPoints.length === 2) {
    const radius = distance(tempPoints[0], tempPoints[1]);
    addCircle(tempPoints[0], radius);
    tempPoints = [];
    pushHistory();
    setStatus("Đã vẽ đường tròn.");
  }

  if (tool === "angle" && tempPoints.length === 3) {
    scene.angles.push({
      id: uniqueId("a"),
      a: tempPoints[0].id,
      o: tempPoints[1].id,
      b: tempPoints[2].id,
      radius: 34,
      color: ui.colorPicker.value
    });
    tempPoints = [];
    pushHistory();
    setStatus("Đã đánh dấu góc.");
  }

  if (tool === "polygon") {
    if (tempPoints.length >= 3 && distance(tempPoints[0], actual) < 12) {
      tempPoints.pop();
      scene.polygons.push({
        id: uniqueId("poly"),
        points: tempPoints.map((p) => p.id),
        color: ui.colorPicker.value,
        width: Number(ui.strokeWidth.value),
        fill: "rgba(88,166,255,0.08)"
      });
      tempPoints = [];
      pushHistory();
      setStatus("Đã tạo đa giác.");
    } else {
      setStatus("Bấm các đỉnh tiếp theo, bấm lại gần đỉnh đầu để khép kín.");
    }
  }

  draw();
}

function hitTest(point) {
  for (let i = scene.points.length - 1; i >= 0; i -= 1) {
    const p = scene.points[i];
    if (distance(point, p) <= 10 / viewport.scale) return { type: "point", id: p.id };
  }

  for (let i = scene.texts.length - 1; i >= 0; i -= 1) {
    const t = scene.texts[i];
    if (Math.abs(point.x - t.x) < 70 / viewport.scale && Math.abs(point.y - t.y) < 22 / viewport.scale) {
      return { type: "text", id: t.id };
    }
  }

  for (let i = scene.segments.length - 1; i >= 0; i -= 1) {
    const seg = scene.segments[i];
    const a = findPoint(seg.from);
    const b = findPoint(seg.to);
    if (a && b && distancePointToSegment(point, a, b) <= 8 / viewport.scale) {
      return { type: "segment", id: seg.id };
    }
  }

  for (let i = scene.circles.length - 1; i >= 0; i -= 1) {
    const circle = scene.circles[i];
    const center = findPoint(circle.center);
    if (center && Math.abs(distance(point, center) - circle.radius) <= 8 / viewport.scale) {
      return { type: "circle", id: circle.id };
    }
  }

  return null;
}

function removeHit(hit) {
  if (hit.type === "point") {
    scene.points = scene.points.filter((p) => p.id !== hit.id);
    scene.segments = scene.segments.filter((s) => s.from !== hit.id && s.to !== hit.id);
    scene.circles = scene.circles.filter((c) => c.center !== hit.id);
    scene.polygons = scene.polygons.filter((p) => !p.points.includes(hit.id));
    scene.angles = scene.angles.filter((a) => ![a.a, a.o, a.b].includes(hit.id));
  }
  if (hit.type === "segment") scene.segments = scene.segments.filter((s) => s.id !== hit.id);
  if (hit.type === "circle") scene.circles = scene.circles.filter((c) => c.id !== hit.id);
  if (hit.type === "text") scene.texts = scene.texts.filter((t) => t.id !== hit.id);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distancePointToSegment(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return distance(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function zoomAt(factor, centerClientX, centerClientY) {
  const before = screenToWorld(centerClientX, centerClientY);
  viewport.scale = Math.max(0.28, Math.min(3.2, viewport.scale * factor));
  const rect = canvas.getBoundingClientRect();
  viewport.x = (centerClientX - rect.left) - before.x * viewport.scale;
  viewport.y = (centerClientY - rect.top) - before.y * viewport.scale;
  draw();
}

function fitScene() {
  const bounds = sceneBounds();
  const rect = canvas.getBoundingClientRect();
  const padding = 86;
  const scaleX = (rect.width - padding) / Math.max(1, bounds.maxX - bounds.minX);
  const scaleY = (rect.height - padding) / Math.max(1, bounds.maxY - bounds.minY);
  viewport.scale = Math.max(0.35, Math.min(2.4, Math.min(scaleX, scaleY)));
  viewport.x = rect.width / 2 - ((bounds.minX + bounds.maxX) / 2) * viewport.scale;
  viewport.y = rect.height / 2 - ((bounds.minY + bounds.maxY) / 2) * viewport.scale;
  draw();
}

function sceneBounds() {
  const points = scene.points.length ? scene.points : [{ x: -260, y: -180 }, { x: 260, y: 180 }];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });

  scene.circles.forEach((c) => {
    const center = findPoint(c.center);
    if (!center) return;
    minX = Math.min(minX, center.x - c.radius);
    minY = Math.min(minY, center.y - c.radius);
    maxX = Math.max(maxX, center.x + c.radius);
    maxY = Math.max(maxY, center.y + c.radius);
  });

  return { minX: minX - 40, minY: minY - 40, maxX: maxX + 40, maxY: maxY + 40 };
}

function createSceneFromPrompt(prompt) {
  const text = normalizeText(prompt);
  if (text.includes("hinh chu nhat")) return rectangleScene(prompt);
  if (text.includes("duong tron") || text.includes("noi tiep")) return circleTriangleScene(prompt);
  if (text.includes("tam giac vuong")) return rightTriangleScene(prompt);
  if (text.includes("tam giac")) return triangleScene(prompt);
  return rectangleScene(prompt);
}

async function createSceneWithAI(prompt) {
  const system = [
    "Bạn là trợ lý dựng hình học phẳng 2D cho giáo viên Việt Nam.",
    "Nhiệm vụ: đọc đề hình học và trả về một scene JSON để canvas dựng hình.",
    "Hệ tọa độ: gốc ở giữa màn hình, x sang phải, y đi xuống, đơn vị pixel.",
    "Hãy đặt hình gọn trong khoảng x từ -320 đến 320, y từ -230 đến 230.",
    "Ưu tiên đúng quan hệ hình học hơn đúng tỉ lệ tuyệt đối khi đề thiếu dữ kiện.",
    "Dùng nhãn điểm quen thuộc A, B, C, D, H, M, O, I, G.",
    "Các tham chiếu from/to/center/a/o/b/points phải trỏ tới id hoặc label điểm có tồn tại.",
    "Nếu có đường cao, trung tuyến, đường tròn, tâm đặc biệt, hãy thêm nét phụ bằng dashed=true.",
    "Không trả lời văn bản ngoài JSON."
  ].join("\n");

  const user = [
    "Đề bài:",
    prompt,
    "",
    "Hãy tạo scene gồm points, segments, circles, polygons, angles, texts, meta.",
    "Màu gợi ý: cạnh chính #58a6ff, nét phụ #42d392, chữ #edf7f2."
  ].join("\n");

  const raw = await callAIResponses({ system, user, schema: aiSceneSchema, maxOutputTokens: 3500 });
  return normalizeAIScene(parseJSONText(raw), prompt);
}

async function solveWithAI(question) {
  const system = [
    "Bạn là giáo viên Toán THCS/THPT, giải hình học phẳng bằng tiếng Việt.",
    "Bạn nhận đề bài, câu hỏi và scene JSON đã được dựng ở canvas.",
    "Hãy giải ngắn gọn, từng bước, có công thức khi cần.",
    "Nếu dữ kiện chưa đủ để tính số cụ thể, hãy nói rõ thiếu dữ kiện và đưa hướng chứng minh.",
    "Không bịa giả thiết ngoài đề và scene.",
    "Không trả lời văn bản ngoài JSON."
  ].join("\n");

  const user = [
    `Đề bài: ${ui.problemInput.value.trim()}`,
    `Câu hỏi: ${question || "Hãy giải bài toán theo hình đã dựng."}`,
    "Scene JSON hiện tại:",
    JSON.stringify(scene)
  ].join("\n\n");

  const raw = await callAIResponses({ system, user, schema: aiSolutionSchema, maxOutputTokens: 2600 });
  const data = parseJSONText(raw);
  return {
    title: cleanText(data.title, "Lời giải AI"),
    html: renderAISolution(data)
  };
}

async function callAIResponses(options) {
  return getAISettings().provider === "openai"
    ? callOpenAIResponses(options)
    : callGeminiInteractions(options);
}

async function callOpenAIResponses({ system, user, schema, maxOutputTokens }) {
  const { apiKey, model, endpoint } = getAISettings();
  if (!apiKey) throw new Error("Chưa nhập OpenAI API key.");
  if (!endpoint) throw new Error("OpenAI trên GitHub Pages cần endpoint proxy/backend để tránh lộ key và lỗi CORS.");

  const body = {
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature: 0.2,
    max_output_tokens: maxOutputTokens,
    store: false,
    text: {
      format: {
        type: "json_schema",
        name: schema.name,
        strict: true,
        schema: schema.schema
      }
    }
  };

  const response = await fetch(endpoint || OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI API trả lỗi ${response.status}.`;
    throw new Error(message);
  }

  const text = extractResponseText(payload);
  if (!text) throw new Error("AI không trả về nội dung có thể đọc.");
  return text;
}

async function callGeminiInteractions({ system, user, schema }) {
  const { apiKey, model } = getAISettings();
  if (!apiKey) throw new Error("Chưa nhập Gemini API key.");

  const response = await fetch(GEMINI_INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      model,
      input: `${system}\n\n${user}`,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schema.schema
      }
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini API trả lỗi ${response.status}.`;
    throw new Error(message);
  }

  const text = extractResponseText(payload);
  if (!text) throw new Error("Gemini không trả về nội dung có thể đọc.");
  return text;
}

function extractResponseText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  if (typeof payload.text === "string") return payload.text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") parts.push(content.text);
      if (typeof content.output_text === "string") parts.push(content.output_text);
    }
  }
  for (const candidate of payload.candidates || []) {
    for (const part of candidate.content?.parts || []) {
      if (typeof part.text === "string") parts.push(part.text);
    }
  }
  return parts.join("\n").trim();
}

function parseJSONText(text) {
  const cleaned = String(text)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function normalizeAIScene(raw, prompt) {
  const next = createEmptyScene();
  const idMap = new Map();
  const usedIds = new Set();

  const sourcePoints = Array.isArray(raw?.points) ? raw.points : [];
  sourcePoints.slice(0, 40).forEach((point, index) => {
    const label = cleanLabel(point.label, index);
    const originalId = cleanText(point.id, label);
    const id = uniqueSceneId(originalId || `p_${label}`, usedIds);
    const normalized = {
      id,
      label,
      x: clampNumber(point.x, -520, 520, index * 24 - 180),
      y: clampNumber(point.y, -380, 380, index * 24 - 120),
      color: cleanColor(point.color, POINT_COLOR),
      radius: clampNumber(point.radius, 3, 9, 5),
      labelColor: cleanColor(point.labelColor, LABEL_COLOR),
      role: cleanText(point.role, "")
    };
    next.points.push(normalized);
    idMap.set(originalId, id);
    idMap.set(label, id);
  });

  if (next.points.length < 2) throw new Error("AI chưa tạo đủ điểm để dựng hình.");

  const resolve = (value) => idMap.get(String(value || "").trim()) || "";

  next.segments = (Array.isArray(raw?.segments) ? raw.segments : [])
    .slice(0, 80)
    .map((segment) => ({
      id: uniqueSceneId(cleanText(segment.id, "s"), usedIds),
      from: resolve(segment.from),
      to: resolve(segment.to),
      color: cleanColor(segment.color, BASE_COLOR),
      width: clampNumber(segment.width, 1, 6, 2),
      dashed: Boolean(segment.dashed),
      role: cleanText(segment.role, "")
    }))
    .filter((segment) => segment.from && segment.to && segment.from !== segment.to);

  next.circles = (Array.isArray(raw?.circles) ? raw.circles : [])
    .slice(0, 20)
    .map((circle) => ({
      id: uniqueSceneId(cleanText(circle.id, "c"), usedIds),
      center: resolve(circle.center),
      radius: clampNumber(circle.radius, 8, 420, 120),
      color: cleanColor(circle.color, "#42d392"),
      width: clampNumber(circle.width, 1, 6, 2),
      dashed: Boolean(circle.dashed),
      role: cleanText(circle.role, "")
    }))
    .filter((circle) => circle.center);

  next.polygons = (Array.isArray(raw?.polygons) ? raw.polygons : [])
    .slice(0, 20)
    .map((polygon) => ({
      id: uniqueSceneId(cleanText(polygon.id, "poly"), usedIds),
      points: (Array.isArray(polygon.points) ? polygon.points : []).map(resolve).filter(Boolean),
      color: cleanColor(polygon.color, BASE_COLOR),
      width: clampNumber(polygon.width, 1, 6, 2),
      fill: cleanColor(polygon.fill, "rgba(88,166,255,0.08)")
    }))
    .filter((polygon) => polygon.points.length >= 3);

  next.angles = (Array.isArray(raw?.angles) ? raw.angles : [])
    .slice(0, 30)
    .map((angle) => ({
      id: uniqueSceneId(cleanText(angle.id, "angle"), usedIds),
      a: resolve(angle.a),
      o: resolve(angle.o),
      b: resolve(angle.b),
      radius: clampNumber(angle.radius, 12, 70, 34),
      color: cleanColor(angle.color, "#42d392")
    }))
    .filter((angle) => angle.a && angle.o && angle.b);

  next.texts = (Array.isArray(raw?.texts) ? raw.texts : [])
    .slice(0, 20)
    .map((text, index) => ({
      id: uniqueSceneId(cleanText(text.id, "t"), usedIds),
      x: clampNumber(text.x, -560, 560, -260),
      y: clampNumber(text.y, -420, 420, 250 + index * 22),
      text: cleanText(text.text, ""),
      color: cleanColor(text.color, "#cfe7dc"),
      size: clampNumber(text.size, 10, 24, 15)
    }))
    .filter((text) => text.text);

  next.meta = {
    type: cleanText(raw?.meta?.type, "ai"),
    prompt,
    ab: Number(raw?.meta?.ab) || readLength(prompt, "AB", 0),
    bc: Number(raw?.meta?.bc) || readLength(prompt, "BC", 0),
    notes: Array.isArray(raw?.meta?.notes) ? raw.meta.notes.slice(0, 8).map((note) => cleanText(note, "")) : []
  };
  return next;
}

function renderAISolution(data) {
  const steps = Array.isArray(data.steps) ? data.steps : [];
  const items = steps
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");
  const finalAnswer = cleanText(data.finalAnswer, "");
  return `
    <h3>${escapeHtml(cleanText(data.title, "Lời giải AI"))}</h3>
    <ol>${items || "<li>AI chưa tạo được bước giải chi tiết.</li>"}</ol>
    ${finalAnswer ? `<p><b>Kết luận:</b> ${escapeHtml(finalAnswer)}</p>` : ""}
  `;
}

function uniqueSceneId(value, usedIds) {
  const base = String(value || "id")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 32) || "id";
  let id = base;
  let index = 2;
  while (usedIds.has(id)) {
    id = `${base}_${index}`;
    index += 1;
  }
  usedIds.add(id);
  return id;
}

function cleanLabel(value, index) {
  const label = String(value || "").trim().toUpperCase();
  if (/^[A-Z][0-9]?$/.test(label)) return label;
  return String.fromCharCode(65 + (index % 26));
}

function cleanText(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanColor(value, fallback) {
  const color = String(value || "").trim();
  if (/^#[0-9a-f]{3,8}$/i.test(color)) return color;
  if (/^rgba?\([\d\s.,%]+\)$/i.test(color)) return color;
  return fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function rectangleScene(prompt) {
  const ab = readLength(prompt, "AB", 8);
  const bc = readLength(prompt, "BC", readLength(prompt, "AD", 6));
  const scale = 42;
  const width = ab * scale;
  const height = bc * scale;
  const next = createEmptyScene();
  scene = next;
  pointCounter = 0;

  const a = addPoint(-width / 2, -height / 2, "A");
  const b = addPoint(width / 2, -height / 2, "B");
  const c = addPoint(width / 2, height / 2, "C");
  const d = addPoint(-width / 2, height / 2, "D");
  addSegment(a, b, { color: BASE_COLOR });
  addSegment(b, c, { color: BASE_COLOR });
  addSegment(c, d, { color: BASE_COLOR });
  addSegment(d, a, { color: BASE_COLOR });
  addSegment(a, d, { color: "#42d392" });
  addSegment(d, b, { color: "#42d392" });
  addSegment(a, b, { color: "#42d392" });

  const h = footOfPerpendicular(a, d, b);
  const hp = addPoint(h.x, h.y, "H", { color: "#42d392", role: "altitude-foot" });
  addSegment(a, hp, { color: "#42d392", dashed: true, role: "altitude" });
  next.angles.push({ id: uniqueId("a"), a: "A", o: "H", b: "B", radius: 24, color: "#42d392" });

  addText(-width / 2, height / 2 + 38, `AB = ${ab}cm, BC = ${bc}cm`, { color: "#cfe7dc" });
  next.meta = { type: "rectangle", ab, bc, prompt };
  return next;
}

function triangleScene(prompt) {
  const next = createEmptyScene();
  scene = next;
  pointCounter = 0;
  const a = addPoint(-40, -190, "A");
  const b = addPoint(-240, 150, "B");
  const c = addPoint(260, 120, "C");
  addSegment(a, b, { color: BASE_COLOR });
  addSegment(b, c, { color: BASE_COLOR });
  addSegment(c, a, { color: BASE_COLOR });

  const mid = addPoint((b.x + c.x) / 2, (b.y + c.y) / 2, "M", { color: "#42d392" });
  addSegment(a, mid, { color: "#42d392", dashed: true, role: "median" });

  const h = footOfPerpendicular(a, b, c);
  const hp = addPoint(h.x, h.y, "H", { color: "#42d392", role: "altitude-foot" });
  addSegment(a, hp, { color: "#42d392", dashed: true, role: "altitude" });
  next.meta = { type: "triangle", prompt };
  return next;
}

function rightTriangleScene(prompt) {
  const next = createEmptyScene();
  scene = next;
  pointCounter = 0;
  const a = addPoint(-210, 150, "A");
  const b = addPoint(230, 150, "B");
  const c = addPoint(-210, -160, "C");
  addSegment(a, b, { color: BASE_COLOR });
  addSegment(a, c, { color: BASE_COLOR });
  addSegment(c, b, { color: BASE_COLOR });
  next.angles.push({ id: uniqueId("a"), a: "B", o: "A", b: "C", radius: 32, color: "#42d392" });
  next.meta = { type: "rightTriangle", prompt };
  return next;
}

function circleTriangleScene(prompt) {
  const next = createEmptyScene();
  scene = next;
  pointCounter = 0;
  const o = addPoint(0, 0, "O", { color: "#42d392" });
  const radius = 210;
  const a = addPoint(-90, -190, "A");
  const b = addPoint(-210, 80, "B");
  const c = addPoint(190, 100, "C");
  addCircle(o, radius, { color: "#42d392" });
  addSegment(a, b, { color: BASE_COLOR });
  addSegment(b, c, { color: BASE_COLOR });
  addSegment(c, a, { color: BASE_COLOR });
  addSegment(o, a, { color: "#42d392", dashed: true });
  addSegment(o, b, { color: "#42d392", dashed: true });
  addSegment(o, c, { color: "#42d392", dashed: true });
  next.meta = { type: "circleTriangle", prompt };
  return next;
}

function readLength(prompt, segment, fallback) {
  const pattern = new RegExp(`${segment}\\s*=\\s*([0-9]+(?:[.,][0-9]+)?)`, "i");
  const match = prompt.match(pattern);
  if (!match) return fallback;
  return Number(match[1].replace(",", ".")) || fallback;
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function footOfPerpendicular(point, lineA, lineB) {
  const dx = lineB.x - lineA.x;
  const dy = lineB.y - lineA.y;
  const lengthSq = dx * dx + dy * dy;
  const t = ((point.x - lineA.x) * dx + (point.y - lineA.y) * dy) / lengthSq;
  return { x: lineA.x + t * dx, y: lineA.y + t * dy };
}

function makeSolution() {
  const question = ui.questionInput.value.trim();
  const meta = scene.meta || {};
  if (meta.type === "rectangle") return rectangleSolution(meta, question);
  if (meta.type === "triangle") return triangleSolution(question);
  if (meta.type === "rightTriangle") return rightTriangleSolution(question);
  if (meta.type === "circleTriangle") return circleTriangleSolution(question);
  return genericSolution(question);
}

function rectangleSolution(meta, question) {
  const ab = meta.ab || 8;
  const bc = meta.bc || 6;
  const bd = round(Math.hypot(ab, bc), 2);
  const ah = round((ab * bc) / bd, 2);
  const bh = round((ab * ab) / bd, 2);
  const dh = round((bc * bc) / bd, 2);
  return {
    title: "Hình chữ nhật và đường cao",
    html: `
      <h3>Hướng giải</h3>
      <ol>
        <li>Vì ABCD là hình chữ nhật nên tam giác ABD vuông tại A, với <code>AB = ${ab}cm</code>, <code>AD = BC = ${bc}cm</code>.</li>
        <li>Áp dụng định lý Pythagore: <code>BD = √(AB² + AD²) = √(${ab}² + ${bc}²) = ${bd}cm</code>.</li>
        <li>Trong tam giác vuông ABD, đường cao từ A xuống cạnh huyền BD thỏa mãn <code>AH = AB.AD / BD</code>, nên <code>AH = ${ab}.${bc}/${bd} = ${ah}cm</code>.</li>
        <li>Ngoài ra <code>BH = AB² / BD = ${bh}cm</code> và <code>DH = AD² / BD = ${dh}cm</code>.</li>
        <li>Để chứng minh đồng dạng, xét hai tam giác AHB và BCD: chúng có một cặp góc vuông và có thể dùng các góc phụ nhau trong hình chữ nhật để suy ra cặp góc nhọn tương ứng bằng nhau.</li>
      </ol>
      <p><b>Kết luận:</b> <code>BD = ${bd}cm</code>, <code>AH = ${ah}cm</code>. ${escapeHtml(question || "Bài toán")} đã được dựng hình ở canvas.</p>
    `
  };
}

function triangleSolution(question) {
  return {
    title: "Tam giác với trung tuyến và đường cao",
    html: `
      <h3>Hướng giải mẫu</h3>
      <ol>
        <li>Xác định các đỉnh A, B, C trên hình vẽ và nối ba cạnh để tạo tam giác ABC.</li>
        <li>Điểm M là trung điểm của BC nên <code>BM = MC</code>. Do đó AM là trung tuyến xuất phát từ A.</li>
        <li>Điểm H là hình chiếu vuông góc của A lên BC nên <code>AH ⟂ BC</code>. Đây là đường cao của tam giác ABC.</li>
        <li>Nếu cần tính độ dài hoặc diện tích, dùng các hệ thức: <code>S = 1/2.BC.AH</code>, hoặc dùng Pythagore trong các tam giác vuông ABH, ACH.</li>
      </ol>
      <p><b>Gợi ý tiếp:</b> Với câu hỏi "${escapeHtml(question || "chưa nhập")}", cần thêm số đo cụ thể để AI thật sinh lời giải đầy đủ.</p>
    `
  };
}

function rightTriangleSolution(question) {
  return {
    title: "Tam giác vuông",
    html: `
      <h3>Hướng giải mẫu</h3>
      <ol>
        <li>Nhận diện góc vuông tại A, suy ra AB và AC là hai cạnh góc vuông, BC là cạnh huyền.</li>
        <li>Khi biết hai cạnh góc vuông, dùng <code>BC² = AB² + AC²</code>.</li>
        <li>Khi kẻ đường cao từ A xuống BC, có thể dùng các hệ thức lượng: <code>AB² = BH.BC</code>, <code>AC² = CH.BC</code>, <code>AH² = BH.CH</code>.</li>
      </ol>
      <p>Câu hỏi hiện tại: ${escapeHtml(question || "chưa nhập câu hỏi")}.</p>
    `
  };
}

function circleTriangleSolution(question) {
  return {
    title: "Tam giác nội tiếp đường tròn",
    html: `
      <h3>Hướng giải mẫu</h3>
      <ol>
        <li>O là tâm đường tròn ngoại tiếp tam giác ABC nên <code>OA = OB = OC</code>.</li>
        <li>Các góc nội tiếp cùng chắn một cung thì bằng nhau. Góc ở tâm bằng hai lần góc nội tiếp cùng chắn cung.</li>
        <li>Nếu cần chứng minh vuông góc, tiếp tuyến hoặc song song, hãy tìm các cặp góc cùng chắn cung hoặc các tam giác cân tạo bởi bán kính.</li>
      </ol>
      <p>Câu hỏi hiện tại: ${escapeHtml(question || "chưa nhập câu hỏi")}.</p>
    `
  };
}

function genericSolution(question) {
  return {
    title: "Lời giải gợi ý",
    html: `
      <h3>Quy trình giải</h3>
      <ol>
        <li>Đọc đề và đánh dấu giả thiết trực tiếp lên hình.</li>
        <li>Xác định quan hệ cần dùng: song song, vuông góc, đồng dạng, bằng nhau, trung điểm hoặc đường tròn.</li>
        <li>Chia bài toán thành các tam giác nhỏ rồi áp dụng định lý phù hợp.</li>
        <li>Viết kết luận theo đúng yêu cầu đề bài.</li>
      </ol>
      <p>Câu hỏi: ${escapeHtml(question || "chưa nhập câu hỏi")}.</p>
    `
  };
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function addSpecialPoint(type) {
  const triangle = firstThreeTrianglePoints();
  if (!triangle) {
    setStatus("Cần có ít nhất 3 điểm A, B, C để tạo điểm đặc biệt.");
    return;
  }

  const [a, b, c] = triangle;
  let point;
  let label;
  let note;

  if (type === "centroid") {
    point = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
    label = "G";
    note = "Đã thêm trọng tâm G.";
  }

  if (type === "orthocenter") {
    point = orthocenter(a, b, c);
    label = "H";
    note = "Đã thêm trực tâm H.";
  }

  if (type === "circumcenter") {
    point = circumcenter(a, b, c);
    label = "O";
    note = "Đã thêm tâm ngoại tiếp O.";
    if (point) addCircle({ id: addPoint(point.x, point.y, label, { color: "#42d392" }).id }, distance(point, a), { color: "#42d392" });
    pushHistory();
    setStatus(note);
    draw();
    return;
  }

  if (type === "incenter") {
    point = incenter(a, b, c);
    label = "I";
    note = "Đã thêm tâm nội tiếp I.";
  }

  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    setStatus("Không tính được điểm đặc biệt cho tam giác hiện tại.");
    return;
  }

  addPoint(point.x, point.y, label, { color: "#42d392" });
  pushHistory();
  setStatus(note);
  draw();
}

function firstThreeTrianglePoints() {
  const a = findPoint("A") || scene.points[0];
  const b = findPoint("B") || scene.points[1];
  const c = findPoint("C") || scene.points[2];
  return a && b && c ? [a, b, c] : null;
}

function orthocenter(a, b, c) {
  const h1 = altitudeLine(a, b, c);
  const h2 = altitudeLine(b, a, c);
  return lineIntersection(h1.p1, h1.p2, h2.p1, h2.p2);
}

function altitudeLine(p, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { p1: p, p2: { x: p.x - dy, y: p.y + dx } };
}

function circumcenter(a, b, c) {
  const midAB = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const midAC = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ac = { x: c.x - a.x, y: c.y - a.y };
  return lineIntersection(midAB, { x: midAB.x - ab.y, y: midAB.y + ab.x }, midAC, { x: midAC.x - ac.y, y: midAC.y + ac.x });
}

function incenter(a, b, c) {
  const sideA = distance(b, c);
  const sideB = distance(a, c);
  const sideC = distance(a, b);
  const sum = sideA + sideB + sideC;
  return {
    x: (sideA * a.x + sideB * b.x + sideC * c.x) / sum,
    y: (sideA * a.y + sideB * b.y + sideC * c.y) / sum
  };
}

function lineIntersection(a1, a2, b1, b2) {
  const dax = a2.x - a1.x;
  const day = a2.y - a1.y;
  const dbx = b2.x - b1.x;
  const dby = b2.y - b1.y;
  const denom = dax * dby - day * dbx;
  if (Math.abs(denom) < 0.00001) return null;
  const t = ((b1.x - a1.x) * dby - (b1.y - a1.y) * dbx) / denom;
  return { x: a1.x + t * dax, y: a1.y + t * day };
}

function saveScene() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ scene, problem: ui.problemInput.value, question: ui.questionInput.value }));
  setStatus("Đã lưu hình vào trình duyệt.");
}

function loadScene() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || !saved.scene) return false;
    scene = saved.scene;
    ui.problemInput.value = saved.problem || ui.problemInput.value;
    ui.questionInput.value = saved.question || ui.questionInput.value;
    pushHistory();
    fitScene();
    setStatus("Đã tải lại hình đã lưu.");
    return true;
  } catch {
    return false;
  }
}

function exportImage() {
  const link = document.createElement("a");
  link.download = "hinh-hoc-phang-2d.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  setStatus("Đã xuất ảnh PNG.");
}

function initEvents() {
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoomAt(event.deltaY < 0 ? 1.12 : 0.88, event.clientX, event.clientY);
  }, { passive: false });

  ui.tools.forEach((button) => button.addEventListener("click", () => setTool(button.dataset.tool)));
  ui.aiProvider.addEventListener("change", () => {
    updateProviderDefaults();
    saveAISettings();
  });
  ui.aiApiKey.addEventListener("input", () => updateAIMode());
  ui.aiApiKey.addEventListener("change", saveAISettings);
  ui.aiModel.addEventListener("input", () => updateAIMode());
  ui.aiModel.addEventListener("change", saveAISettings);
  ui.aiEndpoint.addEventListener("input", () => updateAIMode());
  ui.aiEndpoint.addEventListener("change", saveAISettings);
  ui.saveAiKey.addEventListener("change", saveAISettings);
  ui.clearAiKeyBtn.addEventListener("click", clearAIKey);
  ui.generateBtn.addEventListener("click", async () => {
    const prompt = ui.problemInput.value.trim();
    if (!prompt) {
      setStatus("Hãy nhập đề bài trước khi tạo hình.");
      return;
    }

    const oldText = ui.generateBtn.textContent;
    ui.generateBtn.disabled = true;
    ui.generateBtn.textContent = hasAIKey() ? "AI đang dựng hình..." : "Đang dựng hình demo...";
    try {
      const next = hasAIKey() ? await createSceneWithAI(prompt) : createSceneFromPrompt(prompt);
      setScene(next, hasAIKey() ? "AI thật đã tạo hình từ đề bài." : "Chưa nhập API key, đã tạo hình bằng chế độ demo.");
      fitScene();
      updateAIMode();
    } catch (error) {
      console.error(error);
      const next = createSceneFromPrompt(prompt);
      setScene(next, "AI thật bị lỗi nên app tạm tạo hình bằng chế độ demo.");
      fitScene();
      updateAIMode(`Lỗi AI: ${error.message}`);
    } finally {
      ui.generateBtn.disabled = false;
      ui.generateBtn.textContent = oldText;
    }
  });
  ui.solveBtn.addEventListener("click", async () => {
    const oldText = ui.solveBtn.textContent;
    ui.solveBtn.disabled = true;
    ui.solveBtn.textContent = hasAIKey() ? "AI đang giải..." : "Đang tạo lời giải demo...";
    try {
      const solution = hasAIKey() ? await solveWithAI(ui.questionInput.value.trim()) : makeSolution();
      ui.solutionTitle.textContent = solution.title;
      ui.solutionOutput.innerHTML = solution.html;
      setStatus(hasAIKey() ? "AI thật đã tạo lời giải từ hình hiện tại." : "Đã tạo lời giải mẫu.");
      updateAIMode();
    } catch (error) {
      console.error(error);
      const solution = makeSolution();
      ui.solutionTitle.textContent = solution.title;
      ui.solutionOutput.innerHTML = solution.html;
      setStatus("AI thật bị lỗi nên app tạm dùng lời giải demo.");
      updateAIMode(`Lỗi AI: ${error.message}`);
    } finally {
      ui.solveBtn.disabled = false;
      ui.solveBtn.textContent = oldText;
    }
  });
  ui.clearSolutionBtn.addEventListener("click", () => {
    ui.solutionTitle.textContent = "Chưa có lời giải";
    ui.solutionOutput.innerHTML = "<p>Nhập câu hỏi rồi bấm <b>Giải bài bằng AI</b>.</p>";
  });
  ui.copySolutionBtn.addEventListener("click", async () => {
    const text = ui.solutionOutput.innerText.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setStatus("Đã copy lời giải.");
  });
  ui.loadSampleBtn.addEventListener("click", () => {
    const current = samples.indexOf(ui.problemInput.value);
    ui.problemInput.value = samples[(current + 1 + samples.length) % samples.length];
    setStatus("Đã nạp đề mẫu.");
  });
  ui.insertPresetBtn.addEventListener("click", () => {
    const preset = ui.shapePreset.value;
    const map = {
      rectangle: rectangleScene,
      triangle: triangleScene,
      rightTriangle: rightTriangleScene,
      circleTriangle: circleTriangleScene
    };
    setScene(map[preset](""), "Đã chèn hình từ thư viện.");
    fitScene();
  });
  ui.addSpecialBtn.addEventListener("click", () => addSpecialPoint(ui.specialPoint.value));
  ui.undoBtn.addEventListener("click", () => restoreHistory(historyIndex - 1));
  ui.redoBtn.addEventListener("click", () => restoreHistory(historyIndex + 1));
  ui.fitBtn.addEventListener("click", fitScene);
  ui.exportBtn.addEventListener("click", exportImage);
  ui.saveBtn.addEventListener("click", saveScene);
  ui.zoomInBtn.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    zoomAt(1.18, rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
  ui.zoomOutBtn.addEventListener("click", () => {
    const rect = canvas.getBoundingClientRect();
    zoomAt(0.84, rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
  ui.gridBtn.addEventListener("click", () => {
    showGrid = !showGrid;
    ui.gridBtn.classList.toggle("active", showGrid);
    draw();
  });
}

function init() {
  initEvents();
  loadAISettings();
  resize();
  if (!loadScene()) {
    scene = rectangleScene(ui.problemInput.value);
    pushHistory();
    fitScene();
  }
  setTool("select");
}

init();
