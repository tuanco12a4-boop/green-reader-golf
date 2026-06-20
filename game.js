(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const ui = {
    courseSelect: document.getElementById("courseSelect"),
    strokeCount: document.getElementById("strokeCount"),
    distanceValue: document.getElementById("distanceValue"),
    stimpValue: document.getElementById("stimpValue"),
    greenNumber: document.getElementById("greenNumber"),
    greenName: document.getElementById("greenName"),
    greenDescription: document.getElementById("greenDescription"),
    difficulty: document.querySelectorAll(".difficulty span"),
    slopeButton: document.getElementById("slopeButton"),
    centerButton: document.getElementById("centerButton"),
    placeBallButton: document.getElementById("placeBallButton"),
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
    nextButton: document.getElementById("nextButton"),
    toast: document.getElementById("toast"),
    helpButton: document.getElementById("helpButton"),
    helpDialog: document.getElementById("helpDialog"),
    closeHelp: document.getElementById("closeHelp"),
    startPlaying: document.getElementById("startPlaying")
  };

  const WORLD = { width: 1200, height: 760, cx: 600, cy: 380 };
  const PIXELS_PER_METER = 48;
  const TAU = Math.PI * 2;

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
  let dpr = 1;
  let size = { width: 0, height: 0 };
  let lastTime = performance.now();
  let showSlope = true;
  let strokeCount = 0;
  let power = 0;
  let charging = false;
  let chargeStartedAt = 0;
  let aimAngle = 0;
  let completed = false;
  let placementMode = false;
  let toastTimer = 0;
  let traceAccumulator = 0;
  let previousSafePosition = null;

  const ball = { x: 0, y: 0, vx: 0, vy: 0, radius: 8, rolling: false, sunk: false, trail: [] };
  const camera = { x: WORLD.cx, y: WORLD.cy, zoom: 1 };
  const pointers = new Map();
  let gesture = { mode: "none", startX: 0, startY: 0, cameraX: 0, cameraY: 0, pinchDistance: 0, pinchZoom: 1 };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function magnitude(x, y) { return Math.hypot(x, y); }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    dpr = clamp(window.devicePixelRatio || 1, 1, 2);
    size.width = rect.width;
    size.height = rect.height;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!camera.zoom || camera.zoom === 1) fitCamera();
  }

  function fitCamera() {
    const usableHeight = size.height - (size.width < 680 ? 130 : 60);
    camera.zoom = clamp(Math.min(size.width / 1180, usableHeight / 720), 0.48, 1.25);
    camera.x = WORLD.cx;
    camera.y = WORLD.cy;
  }

  function worldToScreen(x, y) {
    return {
      x: (x - camera.x) * camera.zoom + size.width / 2,
      y: (y - camera.y) * camera.zoom + size.height / 2
    };
  }

  function screenToWorld(x, y) {
    return {
      x: (x - size.width / 2) / camera.zoom + camera.x,
      y: (y - size.height / 2) / camera.zoom + camera.y
    };
  }

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

  function buildGreenPath() {
    const path = new Path2D();
    for (let i = 0; i <= 120; i += 1) {
      const angle = (i / 120) * TAU;
      const scale = boundaryScale(angle);
      const x = WORLD.cx + Math.cos(angle) * 535 * scale;
      const y = WORLD.cy + Math.sin(angle) * 315 * scale;
      const p = worldToScreen(x, y);
      if (i === 0) path.moveTo(p.x, p.y); else path.lineTo(p.x, p.y);
    }
    path.closePath();
    return path;
  }

  function gradientAt(x, y) {
    const step = 3;
    return {
      x: (course.height(x + step, y) - course.height(x - step, y)) / (step * 2),
      y: (course.height(x, y + step) - course.height(x, y - step)) / (step * 2)
    };
  }

  function drawRough() {
    const bg = ctx.createLinearGradient(0, 0, 0, size.height);
    bg.addColorStop(0, course.colors[2]);
    bg.addColorStop(1, "#172e21");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.width, size.height);

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#b5ce7b";
    ctx.lineWidth = 1;
    const spacing = 19;
    for (let y = -20; y < size.height + 20; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.width, y + 25);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGreen() {
    const path = buildGreenPath();
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.38)";
    ctx.shadowBlur = 35 * camera.zoom;
    ctx.shadowOffsetY = 18 * camera.zoom;
    ctx.fillStyle = course.colors[1];
    ctx.fill(path);
    ctx.restore();

    ctx.save();
    ctx.clip(path);
    const center = worldToScreen(WORLD.cx, WORLD.cy);
    const grad = ctx.createRadialGradient(center.x - 100 * camera.zoom, center.y - 80 * camera.zoom, 15, center.x, center.y, 620 * camera.zoom);
    grad.addColorStop(0, course.colors[0]);
    grad.addColorStop(0.72, course.colors[1]);
    grad.addColorStop(1, course.colors[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size.width, size.height);

    const stripeWidth = 72 * camera.zoom;
    ctx.globalAlpha = 0.055;
    for (let x = -size.height; x < size.width + size.height; x += stripeWidth) {
      ctx.fillStyle = (Math.round(x / stripeWidth) % 2 === 0) ? "#efffb0" : "#102918";
      ctx.save();
      ctx.translate(x, 0);
      ctx.transform(1, 0, -0.3, 1, 0, 0);
      ctx.fillRect(0, 0, stripeWidth, size.height);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    drawElevationTint();
    if (showSlope) drawSlopeMap();
    ctx.restore();

    ctx.strokeStyle = "rgba(210,233,148,.22)";
    ctx.lineWidth = Math.max(1, camera.zoom * 2);
    ctx.stroke(path);
  }

  function drawElevationTint() {
    const cell = 46;
    ctx.globalCompositeOperation = "soft-light";
    for (let y = 70; y < WORLD.height - 30; y += cell) {
      for (let x = 70; x < WORLD.width - 30; x += cell) {
        if (!isInsideGreen(x, y, 6)) continue;
        const p = worldToScreen(x, y);
        const h = course.height(x, y);
        const alpha = clamp(Math.abs(h) * 0.035, 0.015, 0.11);
        ctx.fillStyle = h > 0 ? `rgba(245,245,185,${alpha})` : `rgba(5,35,32,${alpha})`;
        ctx.fillRect(p.x - cell * camera.zoom / 2, p.y - cell * camera.zoom / 2, cell * camera.zoom + 1, cell * camera.zoom + 1);
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function drawSlopeMap() {
    const contourStep = 0.23;
    ctx.save();
    ctx.lineWidth = 1;
    for (let y = 80; y < WORLD.height - 40; y += 14) {
      for (let x = 75; x < WORLD.width - 40; x += 14) {
        if (!isInsideGreen(x, y, 12)) continue;
        const h = course.height(x, y);
        const distanceToContour = Math.abs(h / contourStep - Math.round(h / contourStep));
        if (distanceToContour < 0.065) {
          const p = worldToScreen(x, y);
          ctx.fillStyle = "rgba(230,246,185,.28)";
          ctx.fillRect(p.x, p.y, Math.max(1.1, camera.zoom * 1.7), Math.max(1.1, camera.zoom * 1.7));
        }
      }
    }

    for (let y = 130; y < WORLD.height - 70; y += 95) {
      for (let x = 125; x < WORLD.width - 70; x += 110) {
        if (!isInsideGreen(x, y, 38)) continue;
        const slope = gradientAt(x, y);
        const mag = magnitude(slope.x, slope.y);
        if (mag < 0.0004) continue;
        const length = clamp(mag * 2600, 11, 25);
        const dx = (-slope.x / mag) * length;
        const dy = (-slope.y / mag) * length;
        drawArrow(x, y, x + dx, y + dy, mag);
      }
    }
    ctx.restore();
  }

  function drawArrow(x1, y1, x2, y2, strength) {
    const a = worldToScreen(x1, y1);
    const b = worldToScreen(x2, y2);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const head = 4 + clamp(strength * 500, 0, 3);
    ctx.strokeStyle = strength > 0.004 ? "rgba(255,184,74,.72)" : "rgba(215,240,90,.6)";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - Math.cos(angle - 0.55) * head, b.y - Math.sin(angle - 0.55) * head);
    ctx.lineTo(b.x - Math.cos(angle + 0.55) * head, b.y - Math.sin(angle + 0.55) * head);
    ctx.closePath(); ctx.fill();
  }

  function drawHole() {
    const p = worldToScreen(course.hole.x, course.hole.y);
    const z = camera.zoom;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.48)";
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 10 * z, 6 * z, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#e8eee6";
    ctx.beginPath(); ctx.ellipse(p.x, p.y - z, 7 * z, 3.5 * z, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#f4f0dc";
    ctx.lineWidth = Math.max(1.4, 2 * z);
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 2 * z); ctx.lineTo(p.x, p.y - 96 * z); ctx.stroke();
    ctx.fillStyle = "#d7f05a";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 96 * z); ctx.lineTo(p.x + 47 * z, p.y - 80 * z); ctx.lineTo(p.x, p.y - 67 * z); ctx.closePath(); ctx.fill();
    ctx.restore();
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
      const v = magnitude(vx, vy);
      if (v <= 2) break;
      const slowed = Math.max(0, v - course.friction * dt);
      vx = (vx / v) * slowed;
      vy = (vy / v) * slowed;
      x += vx * dt;
      y += vy * dt;
      if (!isInsideGreen(x, y, 8)) break;
      if (i % 3 === 0) points.push({ x, y });
    }
    return points;
  }

  function drawAimGuide() {
    if (ball.rolling || ball.sunk) return;
    const start = worldToScreen(ball.x, ball.y);
    const guideLength = 170;
    const endWorld = { x: ball.x + Math.cos(aimAngle) * guideLength, y: ball.y + Math.sin(aimAngle) * guideLength };
    const end = worldToScreen(endWorld.x, endWorld.y);

    ctx.save();
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#d7f05a";
    ctx.beginPath(); ctx.arc(end.x, end.y, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = "#213012";
    ctx.beginPath(); ctx.arc(end.x, end.y, 2.5, 0, TAU); ctx.fill();

    const prediction = predictPath();
    if (prediction.length > 1) {
      ctx.strokeStyle = "rgba(215,240,90,.38)";
      ctx.lineWidth = 3;
      ctx.setLineDash([2, 7]);
      ctx.beginPath();
      prediction.forEach((point, index) => {
        const p = worldToScreen(point.x, point.y);
        if (index === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTrail() {
    if (ball.trail.length < 2) return;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const grad = ctx.createLinearGradient(0, 0, size.width, size.height);
    grad.addColorStop(0, "rgba(215,240,90,.15)");
    grad.addColorStop(1, "rgba(244,187,77,.9)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ball.trail.forEach((point, index) => {
      const p = worldToScreen(point.x, point.y);
      if (index === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function drawBall() {
    if (ball.sunk) return;
    const p = worldToScreen(ball.x, ball.y);
    const r = Math.max(5.5, ball.radius * camera.zoom);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + r * .75, r * 1.15, r * .48, -0.15, 0, TAU); ctx.fill();
    const grad = ctx.createRadialGradient(p.x - r * .35, p.y - r * .45, r * .12, p.x, p.y, r);
    grad.addColorStop(0, "#ffffff"); grad.addColorStop(.72, "#e5e9df"); grad.addColorStop(1, "#9ca89d");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    ctx.fillStyle = "rgba(65,78,69,.25)";
    for (let i = 0; i < 5; i += 1) {
      const angle = i * 2.1 + ball.x * .02;
      ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * r * .47, p.y + Math.sin(angle) * r * .47, Math.max(0.7, r * .09), 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawCompass() {
    const x = size.width - 47;
    const y = size.height - (size.width < 680 ? 166 : 48);
    if (y < 120) return;
    ctx.save();
    ctx.globalAlpha = .75;
    ctx.fillStyle = "rgba(9,25,17,.6)";
    ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.stroke();
    ctx.fillStyle = "#d7f05a";
    ctx.font = "700 8px Segoe UI"; ctx.textAlign = "center"; ctx.fillText("BẮC", x, y - 8);
    ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x - 4, y + 7); ctx.lineTo(x + 4, y + 7); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function render() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);
    drawRough();
    drawGreen();
    drawHole();
    drawTrail();
    drawAimGuide();
    drawBall();
    drawCompass();
  }

  function updatePhysics(dt) {
    if (!ball.rolling || ball.sunk) return;
    const slope = gradientAt(ball.x, ball.y);
    ball.vx += -slope.x * course.slopeForce * dt;
    ball.vy += -slope.y * course.slopeForce * dt;

    const speed = magnitude(ball.vx, ball.vy);
    const slopeAcceleration = magnitude(slope.x * course.slopeForce, slope.y * course.slopeForce);
    if (speed > 0) {
      const deceleration = course.friction * dt;
      const nextSpeed = Math.max(0, speed - deceleration);
      ball.vx = (ball.vx / speed) * nextSpeed;
      ball.vy = (ball.vy / speed) * nextSpeed;
    }

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    traceAccumulator += dt;
    if (traceAccumulator > 0.045) {
      ball.trail.push({ x: ball.x, y: ball.y });
      traceAccumulator = 0;
    }

    const holeDistance = magnitude(ball.x - course.hole.x, ball.y - course.hole.y);
    const currentSpeed = magnitude(ball.vx, ball.vy);
    if (holeDistance < 13 && currentSpeed < 145) {
      sinkBall();
      return;
    }

    if (!isInsideGreen(ball.x, ball.y, -18)) {
      ball.rolling = false;
      ball.vx = 0;
      ball.vy = 0;
      setTimeout(() => {
        ball.x = previousSafePosition.x;
        ball.y = previousSafePosition.y;
        ball.trail = [];
        updateDistance();
        setStatus("Bóng ngoài green · Đặt lại vị trí", false);
        showToast("Ngoài green", "Cộng 1 gậy phạt");
        strokeCount += 1;
        ui.strokeCount.textContent = strokeCount;
      }, 450);
      return;
    }

    if (currentSpeed < 3.2 && slopeAcceleration < course.friction * 0.95) {
      stopBall();
    }
  }

  function stopBall() {
    ball.rolling = false;
    ball.vx = 0;
    ball.vy = 0;
    ui.puttButton.disabled = false;
    setStatus("Bóng đã dừng · Căn cú tiếp theo", false);
    updateDistance();
  }

  function sinkBall() {
    ball.x = course.hole.x;
    ball.y = course.hole.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.rolling = false;
    ball.sunk = true;
    completed = true;
    ui.puttButton.disabled = true;
    ui.distanceValue.textContent = "0.0";
    setStatus("Hoàn thành green!", false);
    const result = strokeCount === 1 ? "Hole in one" : `${strokeCount} gậy`;
    showToast("Bóng vào lỗ!", result, 2600);
    ui.nextButton.hidden = false;
  }

  function hitBall() {
    if (ball.rolling || ball.sunk || power < 2) {
      resetPower();
      return;
    }
    const speed = 110 + power * 4.25;
    previousSafePosition = { x: ball.x, y: ball.y };
    ball.vx = Math.cos(aimAngle) * speed;
    ball.vy = Math.sin(aimAngle) * speed;
    ball.rolling = true;
    ball.trail = [{ x: ball.x, y: ball.y }];
    strokeCount += 1;
    ui.strokeCount.textContent = strokeCount;
    ui.puttButton.disabled = true;
    setStatus("Bóng đang lăn...", true);
    resetPower();
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
  }

  function aimAtHole() {
    setAim(Math.atan2(course.hole.y - ball.y, course.hole.x - ball.x));
  }

  function setStatus(text, rolling) {
    ui.statusText.textContent = text;
    ui.statusPill.classList.toggle("rolling", Boolean(rolling));
  }

  function setPlacementMode(enabled) {
    placementMode = Boolean(enabled) && !ball.rolling;
    ui.placeBallButton.classList.toggle("active", placementMode);
    ui.placeBallButton.setAttribute("aria-pressed", String(placementMode));
    canvas.classList.toggle("placing", placementMode);
    if (placementMode) setStatus("Chạm một vị trí bên trong green để đặt bóng", false);
    else if (!ball.rolling && !ball.sunk) setStatus("Kéo đường ngắm để căn hướng", false);
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
    completed = false;
    ui.nextButton.hidden = true;
    ui.puttButton.disabled = false;
    resetPower();
    aimAtHole();
    updateDistance();
    showToast("Đã đặt lại bóng", `${ui.distanceValue.textContent} m tới cờ`);
    setPlacementMode(false);
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
    courseIndex = (index + courses.length) % courses.length;
    course = courses[courseIndex];
    ball.x = course.ball.x;
    ball.y = course.ball.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.rolling = false;
    ball.sunk = false;
    ball.trail = [];
    completed = false;
    setPlacementMode(false);
    strokeCount = 0;
    ui.strokeCount.textContent = "0";
    ui.stimpValue.textContent = course.stimp.toFixed(1);
    ui.greenNumber.textContent = `GREEN ${course.number}`;
    ui.greenName.textContent = course.name;
    ui.greenDescription.textContent = course.detail;
    ui.courseSelect.value = course.id;
    ui.difficulty.forEach((node, i) => node.classList.toggle("active", i < course.difficulty));
    ui.nextButton.hidden = true;
    ui.puttButton.disabled = false;
    resetPower();
    fitCamera();
    aimAtHole();
    updateDistance();
    setStatus("Kéo đường ngắm để căn hướng", false);
    showToast(course.name, course.detail);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event) {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = pointerPosition(event);
    pointers.set(event.pointerId, point);

    if (placementMode && pointers.size === 1) {
      const world = screenToWorld(point.x, point.y);
      placeBallAt(world.x, world.y);
      pointers.delete(event.pointerId);
      return;
    }

    if (pointers.size === 2) {
      const list = [...pointers.values()];
      gesture.mode = "pinch";
      gesture.pinchDistance = magnitude(list[0].x - list[1].x, list[0].y - list[1].y);
      gesture.pinchZoom = camera.zoom;
      return;
    }

    const ballScreen = worldToScreen(ball.x, ball.y);
    const aimEnd = worldToScreen(ball.x + Math.cos(aimAngle) * 170, ball.y + Math.sin(aimAngle) * 170);
    const nearAim = magnitude(point.x - aimEnd.x, point.y - aimEnd.y) < 34;
    const nearBall = magnitude(point.x - ballScreen.x, point.y - ballScreen.y) < 45;
    if (!ball.rolling && !ball.sunk && (nearAim || nearBall)) {
      gesture.mode = "aim";
      const world = screenToWorld(point.x, point.y);
      setAim(Math.atan2(world.y - ball.y, world.x - ball.x));
    } else {
      gesture.mode = "pan";
      gesture.startX = point.x;
      gesture.startY = point.y;
      gesture.cameraX = camera.x;
      gesture.cameraY = camera.y;
    }
  }

  function onPointerMove(event) {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const point = pointerPosition(event);
    pointers.set(event.pointerId, point);

    if (pointers.size === 2) {
      const list = [...pointers.values()];
      const distance = magnitude(list[0].x - list[1].x, list[0].y - list[1].y);
      if (gesture.pinchDistance > 0) camera.zoom = clamp(gesture.pinchZoom * distance / gesture.pinchDistance, 0.42, 2.1);
      return;
    }

    if (gesture.mode === "aim") {
      const world = screenToWorld(point.x, point.y);
      setAim(Math.atan2(world.y - ball.y, world.x - ball.x));
    } else if (gesture.mode === "pan") {
      camera.x = gesture.cameraX - (point.x - gesture.startX) / camera.zoom;
      camera.y = gesture.cameraY - (point.y - gesture.startY) / camera.zoom;
      camera.x = clamp(camera.x, 120, WORLD.width - 120);
      camera.y = clamp(camera.y, 80, WORLD.height - 80);
    }
  }

  function onPointerUp(event) {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) gesture.mode = "none";
    else if (pointers.size === 1) {
      const point = [...pointers.values()][0];
      gesture = { ...gesture, mode: "pan", startX: point.x, startY: point.y, cameraX: camera.x, cameraY: camera.y };
    }
  }

  function onWheel(event) {
    event.preventDefault();
    const point = pointerPosition(event);
    const before = screenToWorld(point.x, point.y);
    camera.zoom = clamp(camera.zoom * (event.deltaY > 0 ? 0.9 : 1.1), 0.42, 2.1);
    const after = screenToWorld(point.x, point.y);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    ui.puttButton.addEventListener("pointerdown", startCharge);
    ui.puttButton.addEventListener("pointerup", releaseCharge);
    ui.puttButton.addEventListener("pointercancel", releaseCharge);
    ui.puttButton.addEventListener("pointerleave", event => { if (charging && event.pointerType === "mouse") releaseCharge(event); });

    window.addEventListener("keydown", event => {
      if (event.code === "Space" && !event.repeat && !ui.helpDialog.open) startCharge(event);
      if (event.code === "ArrowLeft" && !ball.rolling) setAim(aimAngle - Math.PI / 180);
      if (event.code === "ArrowRight" && !ball.rolling) setAim(aimAngle + Math.PI / 180);
      if (event.code === "KeyM" && !ui.helpDialog.open) setPlacementMode(!placementMode);
      if (event.code === "Escape" && placementMode) setPlacementMode(false);
    });
    window.addEventListener("keyup", event => { if (event.code === "Space") releaseCharge(event); });

    ui.aimLeft.addEventListener("click", () => { if (!ball.rolling) setAim(aimAngle - 2 * Math.PI / 180); });
    ui.aimRight.addEventListener("click", () => { if (!ball.rolling) setAim(aimAngle + 2 * Math.PI / 180); });
    ui.slopeButton.addEventListener("click", () => {
      showSlope = !showSlope;
      ui.slopeButton.classList.toggle("active", showSlope);
      ui.slopeButton.setAttribute("aria-pressed", String(showSlope));
      showToast(showSlope ? "Đã bật bản đồ dốc" : "Đã ẩn bản đồ dốc", showSlope ? "Mũi tên chỉ hướng xuống dốc" : "Chế độ mặt cỏ sạch");
    });
    ui.centerButton.addEventListener("click", () => {
      camera.x = ball.x; camera.y = ball.y;
      showToast("Đã về vị trí bóng", "Kéo nền để xem khu vực khác");
    });
    ui.placeBallButton.addEventListener("click", () => {
      if (ball.rolling) {
        showToast("Bóng đang lăn", "Đợi bóng dừng rồi đặt lại vị trí");
        return;
      }
      setPlacementMode(!placementMode);
    });
    ui.zoomButton.addEventListener("click", () => {
      if (camera.zoom > 1.3) fitCamera(); else camera.zoom = clamp(camera.zoom * 1.35, 0.42, 2.1);
    });
    ui.courseSelect.addEventListener("change", event => {
      const index = courses.findIndex(item => item.id === event.target.value);
      loadCourse(index);
    });
    ui.nextButton.addEventListener("click", () => loadCourse(courseIndex + 1));

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
    render();
    requestAnimationFrame(gameLoop);
  }

  function init() {
    populateCourseSelect();
    bindEvents();
    resizeCanvas();
    loadCourse(0);
    requestAnimationFrame(gameLoop);
  }

  init();
})();
