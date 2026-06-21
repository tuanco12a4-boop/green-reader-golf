const YD_TO_M = 0.9144;

const SCORECARD = {
  black: [173, 410, 392, 350, 218, 508, 327, 440, 164, 399, 485, 304, 530, 556, 398, 434, 158, 350],
  blue:  [160, 390, 370, 308, 200, 462, 300, 430, 149, 372, 475, 294, 518, 540, 367, 399, 143, 335],
  white: [138, 370, 338, 287, 159, 424, 272, 399, 127, 343, 436, 268, 482, 524, 348, 386, 122, 310],
  red:   [113, 350, 308, 268, 132, 392, 250, 369, 112, 323, 392, 248, 449, 508, 291, 359, 102, 290],
  par:   [3, 4, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 5, 5, 4, 4, 3, 4]
};

const HOLES = [
  { name: "Mở màn ven hồ", terrain: "Hồ bên phải · Green cao", bend: -.08, wave: .04, flag: "red", wind: 4, hazards: [{type:"water",at:.56,side:.9,length:.22,width:.36},{type:"sand",at:.84,side:-.62,length:.12,width:.44}] },
  { name: "Khúc cua rừng thông", terrain: "Dogleg trái · Fairway hẹp", bend: -.22, wave: .03, flag: "white", wind: 7, hazards: [{type:"sand",at:.48,side:.64,length:.12,width:.42},{type:"sand",at:.82,side:-.58,length:.13,width:.45}] },
  { name: "Dải cát đôi", terrain: "Bunker hai tầng · Green dài", bend: .08, wave: .08, flag: "blue", wind: 5, hazards: [{type:"sand",at:.42,side:-.58,length:.13,width:.5},{type:"sand",at:.67,side:.62,length:.15,width:.48}] },
  { name: "Suối cắt fairway", terrain: "Nước ngang · Green nhỏ", bend: .14, wave: .04, flag: "red", wind: 8, hazards: [{type:"water",at:.62,side:0,length:.075,width:1.25},{type:"sand",at:.85,side:.6,length:.12,width:.4}] },
  { name: "Ốc đảo Par 3", terrain: "Green bán đảo · Cát trước cờ", bend: 0, wave: .02, flag: "blue", wind: 10, hazards: [{type:"water",at:.82,side:-.72,length:.28,width:.56},{type:"sand",at:.79,side:.28,length:.1,width:.42}] },
  { name: "Đường dài cao nguyên", terrain: "Fairway rộng · Ba bẫy cát", bend: -.12, wave: .07, flag: "white", wind: 6, hazards: [{type:"sand",at:.33,side:.64,length:.12,width:.4},{type:"sand",at:.61,side:-.62,length:.13,width:.45},{type:"sand",at:.86,side:.55,length:.1,width:.4}] },
  { name: "Thung lũng xanh", terrain: "Dốc xuống · Rough dày", bend: .18, wave: .06, flag: "red", wind: 3, hazards: [{type:"water",at:.48,side:-.74,length:.2,width:.5},{type:"sand",at:.8,side:.61,length:.14,width:.44}] },
  { name: "Hồ gương", terrain: "Hồ trái dài · Dogleg phải", bend: .25, wave: .03, flag: "blue", wind: 9, hazards: [{type:"water",at:.55,side:-.72,length:.36,width:.54},{type:"sand",at:.86,side:.55,length:.11,width:.4}] },
  { name: "Kim thông", terrain: "Par 3 hẹp · Bunker ôm green", bend: -.04, wave: .03, flag: "white", wind: 12, hazards: [{type:"sand",at:.78,side:-.54,length:.16,width:.5},{type:"sand",at:.86,side:.54,length:.14,width:.48}] },
  { name: "Sườn đồi Đông", terrain: "Dốc ngang · Fairway lượn", bend: -.18, wave: .1, flag: "red", wind: 6, hazards: [{type:"sand",at:.46,side:.66,length:.15,width:.42},{type:"water",at:.72,side:-.75,length:.2,width:.48}] },
  { name: "Bờ biển dài", terrain: "Par 5 ven nước · Gió mạnh", bend: .2, wave: .06, flag: "blue", wind: 15, hazards: [{type:"water",at:.44,side:.76,length:.46,width:.58},{type:"sand",at:.7,side:-.62,length:.13,width:.43},{type:"sand",at:.88,side:.58,length:.1,width:.38}] },
  { name: "Cầu cạn", terrain: "Suối đôi · Khe hẹp", bend: .06, wave: .1, flag: "white", wind: 5, hazards: [{type:"water",at:.38,side:0,length:.055,width:1.2},{type:"water",at:.7,side:0,length:.055,width:1.2}] },
  { name: "Hẻm núi Par 5", terrain: "Dogleg kép · Green trên cao", bend: -.2, wave: .13, flag: "red", wind: 11, hazards: [{type:"sand",at:.35,side:.65,length:.14,width:.42},{type:"water",at:.61,side:-.72,length:.2,width:.5},{type:"sand",at:.84,side:.58,length:.13,width:.42}] },
  { name: "Đường vô địch", terrain: "Hố dài nhất · Hồ trước green", bend: .12, wave: .06, flag: "white", wind: 13, hazards: [{type:"sand",at:.34,side:-.62,length:.14,width:.44},{type:"sand",at:.58,side:.64,length:.14,width:.44},{type:"water",at:.78,side:0,length:.075,width:1.25}] },
  { name: "Móng ngựa", terrain: "Dogleg phải mạnh · Cát trong góc", bend: .3, wave: .03, flag: "blue", wind: 7, hazards: [{type:"sand",at:.54,side:.42,length:.2,width:.55},{type:"water",at:.82,side:-.68,length:.17,width:.48}] },
  { name: "Đảo thông xanh", terrain: "Nước hai bên · Lối vào hẹp", bend: -.1, wave: .06, flag: "red", wind: 9, hazards: [{type:"water",at:.45,side:.78,length:.3,width:.48},{type:"water",at:.66,side:-.76,length:.28,width:.5},{type:"sand",at:.86,side:.55,length:.11,width:.4}] },
  { name: "Cú đánh qua hồ", terrain: "Par 3 qua nước · Green rộng", bend: .04, wave: .02, flag: "blue", wind: 8, hazards: [{type:"water",at:.55,side:0,length:.22,width:1.1},{type:"sand",at:.86,side:-.55,length:.11,width:.43}] },
  { name: "Đường về clubhouse", terrain: "Fairway chữ S · Bunker bảo vệ cờ", bend: .12, wave: .14, flag: "white", wind: 6, hazards: [{type:"sand",at:.45,side:-.62,length:.14,width:.44},{type:"water",at:.67,side:.73,length:.2,width:.48},{type:"sand",at:.88,side:-.52,length:.11,width:.42}] }
];

const CLUBS = [
  { id:"driver", name:"Driver", short:"D", range:225, spread:12, type:"Gỗ" },
  { id:"wood3", name:"3 Wood", short:"3W", range:205, spread:10, type:"Gỗ" },
  { id:"wood5", name:"5 Wood", short:"5W", range:185, spread:9, type:"Gỗ" },
  { id:"iron4", name:"4 Iron", short:"4I", range:175, spread:9, type:"Sắt" },
  { id:"iron5", name:"5 Iron", short:"5I", range:165, spread:8, type:"Sắt" },
  { id:"iron6", name:"6 Iron", short:"6I", range:155, spread:8, type:"Sắt" },
  { id:"iron7", name:"7 Iron", short:"7I", range:145, spread:7, type:"Sắt" },
  { id:"iron8", name:"8 Iron", short:"8I", range:135, spread:7, type:"Sắt" },
  { id:"iron9", name:"9 Iron", short:"9I", range:120, spread:6, type:"Sắt" },
  { id:"pw", name:"Pitching Wedge", short:"PW", range:105, spread:5, type:"Wedge" },
  { id:"sw", name:"Sand Wedge", short:"SW", range:80, spread:5, type:"Wedge" },
  { id:"putter", name:"Putter", short:"PT", range:25, spread:3, type:"Putt" }
];

const FLAG_INFO = {
  red: { label:"Cờ đỏ · đầu green", color:"#e84238", offset:-10 },
  white: { label:"Cờ trắng · giữa green", color:"#ffffff", offset:0 },
  blue: { label:"Cờ xanh · cuối green", color:"#277cc0", offset:10 }
};

const els = Object.fromEntries([...document.querySelectorAll("[id]")].map(el => [el.id, el]));
const canvas = els.courseCanvas;
const ctx = canvas.getContext("2d");

const saved = loadSavedState();
const state = {
  holeIndex: saved.holeIndex ?? 0,
  tee: saved.tee ?? "white",
  unit: saved.unit ?? "yd",
  scores: Array.isArray(saved.scores) ? saved.scores.slice(0, 18) : Array(18).fill(null),
  phase: "tee",
  strokes: 0,
  remainingYd: 0,
  side: 0,
  lie: "tee",
  selectedClub: "iron7",
  guessAttempts: 0,
  animating: false,
  animation: null
};

while (state.scores.length < 18) state.scores.push(null);

function loadSavedState() {
  try { return JSON.parse(localStorage.getItem("fairway-reader-state")) || {}; }
  catch { return {}; }
}

function saveState() {
  try {
    localStorage.setItem("fairway-reader-state", JSON.stringify({
      holeIndex: state.holeIndex, tee: state.tee, unit: state.unit, scores: state.scores
    }));
  } catch { /* Storage can be unavailable in private browsing. */ }
}

function hole() { return HOLES[state.holeIndex]; }
function par() { return SCORECARD.par[state.holeIndex]; }
function centerDistanceYd() { return SCORECARD[state.tee][state.holeIndex]; }
function targetDistanceYd() { return centerDistanceYd() + FLAG_INFO[hole().flag].offset; }
function displayed(valueYd) { return Math.round(valueYd * (state.unit === "m" ? YD_TO_M : 1)); }
function unitLong() { return state.unit === "m" ? "mét" : "yard"; }
function unitShort() { return state.unit === "m" ? "m" : "yd"; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function formatScore(value) { return value === 0 ? "E" : value > 0 ? `+${value}` : String(value); }
function holeProgress() { return clamp((targetDistanceYd() - state.remainingYd) / targetDistanceYd(), 0, .985); }

function seeded(index) {
  const x = Math.sin(index * 91.713 + state.holeIndex * 17.17 + state.strokes * 3.1) * 43758.5453;
  return x - Math.floor(x);
}

function setPhase(name) {
  state.phase = name;
  ["tee", "estimate", "club", "complete"].forEach(phase => {
    els[`${phase}Phase`].classList.toggle("active", phase === name);
  });
  const meta = {
    tee: ["02", "CÚ ĐẦU TIÊN", "Phát bóng xuống fairway"],
    estimate: ["03", "ĐỌC CỌC MÀU", "Tính khoảng cách đến cờ"],
    club: ["04", "TÚI GẬY ĐÃ MỞ", "Chọn gậy cho cú tiếp"],
    complete: ["✓", "KẾT QUẢ", "Hố đã hoàn thành"]
  }[name];
  els.missionStep.textContent = meta[0];
  els.missionEyebrow.textContent = meta[1];
  els.missionTitle.textContent = meta[2];
  els.setupCard.classList.toggle("locked", name !== "tee");
}

function resetHole() {
  state.strokes = 0;
  state.remainingYd = targetDistanceYd();
  state.side = 0;
  state.lie = "tee";
  state.guessAttempts = 0;
  state.animating = false;
  state.animation = null;
  els.distanceGuess.value = "";
  els.guessFeedback.textContent = "";
  els.guessFeedback.className = "guess-feedback";
  updateDriveLabel();
  setPhase("tee");
  updateUI();
  draw();
}

function updateUI() {
  const currentHole = hole();
  const distance = centerDistanceYd();
  const progress = holeProgress();
  const completed = state.scores.filter(Number.isFinite);
  const roundPar = state.scores.reduce((sum, score, index) => sum + (Number.isFinite(score) ? SCORECARD.par[index] : 0), 0);
  const totalStrokes = completed.reduce((sum, score) => sum + score, 0);

  els.headerHole.innerHTML = `${String(state.holeIndex + 1).padStart(2,"0")} <i>/ 18</i>`;
  els.headerPar.textContent = par();
  els.headerStrokes.textContent = state.strokes;
  els.headerScore.textContent = formatScore(totalStrokes - roundPar);
  els.courseEyebrow.textContent = `HỐ ${String(state.holeIndex + 1).padStart(2,"0")} · PAR ${par()}`;
  els.courseName.textContent = currentHole.name;
  els.courseMeta.textContent = `${displayed(distance)} ${unitShort()} · Tee ${teeLabel(state.tee).toLowerCase()} · ${FLAG_INFO[currentHole.flag].label}`;
  els.windLabel.textContent = `Gió ${currentHole.wind} km/h`;
  els.distanceUnit.textContent = unitLong();
  els.guessUnit.textContent = unitLong();
  els.toleranceUnit.textContent = unitLong();
  els.clubUnit.textContent = unitShort();
  els.remainingDistance.textContent = ["club", "complete"].includes(state.phase) ? displayed(state.remainingYd) : "?";
  els.holeProgress.style.width = `${progress * 100}%`;
  els.ballProgress.style.left = `${progress * 100}%`;
  els.playedDistance.textContent = `${displayed(targetDistanceYd() - state.remainingYd)} / ${displayed(targetDistanceYd())} ${unitShort()}`;
  els.lieName.textContent = lieLabel(state.lie);
  els.lieChip.textContent = state.lie.toUpperCase();
  els.coachTip.innerHTML = coachMessage();

  ["black", "blue", "white", "red"].forEach(tee => {
    els[`${tee}Distance`].textContent = displayed(SCORECARD[tee][state.holeIndex]);
  });
  document.querySelectorAll(".tee-option").forEach(button => {
    const active = button.dataset.tee === state.tee;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".unit-toggle button").forEach(button => {
    button.classList.toggle("active", button.dataset.unit === state.unit);
  });
  updateStakeKey();
  updateClubStats();
}

function teeLabel(tee) { return ({black:"Đen",blue:"Xanh",white:"Trắng",red:"Đỏ"})[tee]; }
function lieLabel(lie) { return ({tee:"Tee box",fairway:"Fairway",rough:"Rough",sand:"Bẫy cát",green:"Green"})[lie] || "Fairway"; }

function coachMessage() {
  if (state.lie === "sand") return "<strong>Đang ở bẫy cát:</strong> cú đánh bị giảm khoảng 22%. Wedge hoặc gậy nhiều loft sẽ an toàn hơn.";
  if (state.lie === "rough") return "<strong>Bóng trong rough:</strong> cú đánh bị giảm khoảng 10%. Chọn dư một gậy nếu khoảng cách xa.";
  if (state.phase === "estimate") return `<strong>Nhìn cờ:</strong> ${FLAG_INFO[hole().flag].label}. Cọc màu đo tới tâm green, hãy bù vị trí cờ.`;
  return "<strong>Mẹo đọc sân:</strong> cọc đỏ cách tâm green 100 yard, cọc trắng 150, cọc xanh 200 và cọc đen 250.";
}

function updateStakeKey() {
  const values = [250, 200, 150, 100];
  document.querySelectorAll(".stake-key b").forEach((label, index) => {
    label.textContent = displayed(values[index]);
  });
}

function renderClubs() {
  els.clubList.innerHTML = CLUBS.map(club => `
    <button class="club-card" type="button" data-club="${club.id}" role="radio" aria-checked="false">
      <span class="club-icon">${club.short}</span>
      <strong>${club.name}</strong>
      <small>${club.type}</small>
    </button>`).join("");
  els.clubList.addEventListener("click", event => {
    const button = event.target.closest("[data-club]");
    if (!button || state.animating) return;
    state.selectedClub = button.dataset.club;
    updateClubStats();
  });
}

function updateClubStats() {
  const club = CLUBS.find(item => item.id === state.selectedClub) || CLUBS[6];
  document.querySelectorAll(".club-card").forEach(button => {
    const active = button.dataset.club === club.id;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });
  els.selectedClubName.textContent = club.name;
  els.selectedClubRange.textContent = displayed(club.range);
  els.selectedClubSpread.textContent = `±${club.spread}%`;
}

function recommendClub() {
  const lieMultiplier = state.lie === "sand" ? .78 : state.lie === "rough" ? .9 : 1;
  const best = CLUBS.reduce((choice, club) => {
    const difference = Math.abs(club.range * lieMultiplier - state.remainingYd);
    return difference < choice.difference ? {club, difference} : choice;
  }, {club: CLUBS[6], difference: Infinity}).club;
  state.selectedClub = best.id;
  updateClubStats();
  requestAnimationFrame(() => {
    els.clubList.querySelector(".active")?.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  });
}

function startDrive() {
  if (state.animating || state.phase !== "tee") return;
  const target = targetDistanceYd();
  const variation = (seeded(2) - .5) * 12;
  const carry = clamp(target * .55 + variation, 62, 215);
  const safeCarry = Math.min(carry, target - 42);
  state.strokes += 1;
  const side = (seeded(3) - .5) * .62;
  resolveShot(safeCarry, side, "Cú phát bóng");
}

function checkGuess() {
  if (state.phase !== "estimate" || state.animating) return;
  const guess = Number(els.distanceGuess.value);
  if (!Number.isFinite(guess) || guess <= 0) {
    els.guessFeedback.textContent = "Hãy nhập một khoảng cách lớn hơn 0.";
    els.distanceGuess.focus();
    return;
  }
  const actual = displayed(state.remainingYd);
  const difference = Math.abs(guess - actual);
  state.guessAttempts += 1;
  if (difference <= 20) {
    els.guessFeedback.className = "guess-feedback success";
    els.guessFeedback.textContent = `Chính xác! Sai số ${difference} ${unitShort()}.`;
    els.actualDistanceText.textContent = `Khoảng cách thật: ${actual} ${unitLong()}`;
    setPhase("club");
    recommendClub();
    updateUI();
    showToast("Túi gậy đã mở. Chọn gậy cho cú tiếp theo.");
    return;
  }
  const direction = guess < actual ? "Bạn đang tính hơi ngắn" : "Bạn đang tính hơi dài";
  const hint = state.guessAttempts >= 2 ? ` Còn khoảng ${Math.round(actual / 10) * 10} ${unitShort()}.` : " Hãy nhìn cọc gần bóng nhất.";
  els.guessFeedback.className = "guess-feedback";
  els.guessFeedback.textContent = `${direction} (${difference} ${unitShort()}).${hint}`;
  shake(els.distanceGuess);
}

function swingClub() {
  if (state.animating || state.phase !== "club") return;
  const club = CLUBS.find(item => item.id === state.selectedClub);
  const lieMultiplier = state.lie === "sand" ? .78 : state.lie === "rough" ? .9 : 1;
  const windMultiplier = 1 - Math.min(hole().wind, 18) * .0025;
  const strike = .96 + seeded(11) * .08;
  const carry = club.range * lieMultiplier * windMultiplier * strike;
  const side = clamp((seeded(12) - .5) * (club.spread / 9), -.82, .82);
  state.strokes += 1;
  resolveShot(carry, side, club.name);
}

function resolveShot(carry, side, label) {
  const target = targetDistanceYd();
  const startRemaining = state.remainingYd;
  let nextRemaining;
  let overshot = false;
  if (carry > startRemaining) {
    overshot = true;
    nextRemaining = Math.max(2, (carry - startRemaining) * .58);
  } else {
    nextRemaining = startRemaining - carry;
  }
  let landingP = clamp((target - nextRemaining) / target, .02, .985);
  const hazard = findHazard(landingP, side);
  let nextLie = Math.abs(side) > .48 ? "rough" : "fairway";
  let message = `${label}: ${displayed(carry)} ${unitShort()}`;

  if (hazard?.type === "water") {
    state.strokes += 1;
    landingP = clamp(hazard.at - hazard.length / 2 - .025, holeProgress() + .025, .9);
    nextRemaining = target * (1 - landingP);
    side = 0;
    nextLie = "rough";
    message = "Bóng xuống nước · cộng 1 gậy phạt";
  } else if (hazard?.type === "sand") {
    nextLie = "sand";
    message = "Bóng rơi vào bẫy cát";
  } else if (overshot) {
    nextLie = "rough";
    side = clamp(side, -.38, .38);
    message = "Bóng vượt cờ và dừng sau green";
  }

  animateBall({
    fromRemaining: startRemaining,
    toRemaining: nextRemaining,
    fromSide: state.side,
    toSide: side,
    message,
    callback: () => {
      state.remainingYd = nextRemaining;
      state.side = side;
      state.lie = nextLie;
      if (state.remainingYd <= 24 && !hazard) finishOnGreen();
      else beginEstimate();
    }
  });
}

function findHazard(progress, side) {
  return hole().hazards.find(hazard => {
    if (Math.abs(progress - hazard.at) > hazard.length / 2) return false;
    if (hazard.side === 0) return true;
    const hazardCenter = hazard.side * .7;
    return Math.abs(side - hazardCenter) < hazard.width * .62;
  });
}

function animateBall(config) {
  state.animating = true;
  els.driveButton.disabled = true;
  els.swingButton.disabled = true;
  showFlight(config.message);
  state.animation = {...config, started: performance.now(), duration: 1300};
  requestAnimationFrame(animationFrame);
}

function animationFrame(now) {
  if (!state.animation) return;
  const t = clamp((now - state.animation.started) / state.animation.duration, 0, 1);
  draw(t);
  if (t < 1) {
    requestAnimationFrame(animationFrame);
    return;
  }
  const callback = state.animation.callback;
  state.animation = null;
  state.animating = false;
  els.driveButton.disabled = false;
  els.swingButton.disabled = false;
  callback();
}

function beginEstimate() {
  state.guessAttempts = 0;
  els.distanceGuess.value = "";
  els.guessFeedback.textContent = "";
  els.guessFeedback.className = "guess-feedback";
  setPhase("estimate");
  updateUI();
  draw();
  setTimeout(() => els.distanceGuess.focus({preventScroll:true}), 120);
}

function finishOnGreen() {
  state.lie = "green";
  const putts = state.remainingYd <= 5 ? 1 : 2;
  state.strokes += putts;
  state.remainingYd = 0;
  state.side = 0;
  state.scores[state.holeIndex] = state.strokes;
  saveState();
  const relative = state.strokes - par();
  const title = relative <= -2 ? "EAGLE" : relative === -1 ? "BIRDIE" : relative === 0 ? "PAR" : relative === 1 ? "BOGEY" : `+${relative}`;
  const totalStrokes = state.scores.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const totalPar = state.scores.reduce((sum, value, index) => sum + (Number.isFinite(value) ? SCORECARD.par[index] : 0), 0);
  els.resultTitle.textContent = title;
  els.resultSummary.textContent = `${state.strokes} gậy · Par ${par()} · ${putts} putt`;
  els.roundScore.textContent = formatScore(totalStrokes - totalPar);
  els.nextHoleButton.innerHTML = state.holeIndex === 17 ? "XEM SCORECARD VÒNG ĐẤU" : "SANG HỐ TIẾP THEO <span>→</span>";
  setPhase("complete");
  updateUI();
  draw();
  showFlight(`Lên green · hoàn tất bằng ${putts} putt`);
}

function nextHole() {
  if (state.holeIndex === 17) {
    renderScorecard();
    els.scorecardDialog.showModal();
    return;
  }
  state.holeIndex += 1;
  saveState();
  resetHole();
  document.querySelector(".control-deck").scrollTo({top:0,behavior:"smooth"});
}

function showFlight(message) {
  els.flightMessage.textContent = message;
  els.flightMessage.classList.add("show");
  clearTimeout(showFlight.timer);
  showFlight.timer = setTimeout(() => els.flightMessage.classList.remove("show"), 1700);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function shake(element) {
  element.animate([{transform:"translateX(0)"},{transform:"translateX(-5px)"},{transform:"translateX(5px)"},{transform:"translateX(0)"}], {duration:220});
}

function selectTee(tee) {
  if (state.phase !== "tee") return;
  state.tee = tee;
  state.remainingYd = targetDistanceYd();
  saveState();
  updateDriveLabel();
  updateUI();
  draw();
}

function selectUnit(unit) {
  if (state.phase !== "tee") return;
  state.unit = unit;
  saveState();
  updateUI();
  renderScorecard();
  draw();
}

function updateDriveLabel() {
  const distance = targetDistanceYd();
  els.driveClubLabel.textContent = distance < 175 ? "Bằng 7 Iron" : distance < 230 ? "Bằng gỗ 3" : "Bằng Driver";
}

function renderScorecard() {
  const header = `<tr><th>HỐ</th>${HOLES.map((_, i) => `<th class="${i === state.holeIndex ? "current-hole" : ""}">${i + 1}</th>`).join("")}</tr>`;
  const rows = ["black","blue","white","red"].map(tee => `<tr><td>${teeLabel(tee).toUpperCase()}</td>${SCORECARD[tee].map(value => `<td>${displayed(value)}</td>`).join("")}</tr>`).join("");
  const pars = `<tr><td>PAR</td>${SCORECARD.par.map(value => `<td>${value}</td>`).join("")}</tr>`;
  const player = `<tr class="player-row"><td>BẠN</td>${state.scores.map(value => `<td>${Number.isFinite(value) ? value : "·"}</td>`).join("")}</tr>`;
  els.scorecardTable.innerHTML = header + rows + pars + player;
  const total = state.scores.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const playedPar = state.scores.reduce((sum, value, index) => sum + (Number.isFinite(value) ? SCORECARD.par[index] : 0), 0);
  els.scorecardTotal.textContent = total;
  els.scorecardVsPar.textContent = formatScore(total - playedPar);
}

function setupEvents() {
  document.querySelectorAll(".tee-option").forEach(button => button.addEventListener("click", () => selectTee(button.dataset.tee)));
  document.querySelectorAll(".unit-toggle button").forEach(button => button.addEventListener("click", () => selectUnit(button.dataset.unit)));
  els.driveButton.addEventListener("click", startDrive);
  els.checkGuessButton.addEventListener("click", checkGuess);
  els.distanceGuess.addEventListener("keydown", event => { if (event.key === "Enter") checkGuess(); });
  els.swingButton.addEventListener("click", swingClub);
  els.nextHoleButton.addEventListener("click", nextHole);
  els.scorecardButton.addEventListener("click", () => { renderScorecard(); els.scorecardDialog.showModal(); });
  els.helpButton.addEventListener("click", () => els.helpDialog.showModal());
  els.closeHelpButton.addEventListener("click", () => els.helpDialog.close());
  document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  els.brandHome.addEventListener("click", event => {
    event.preventDefault();
    state.holeIndex = 0;
    saveState();
    resetHole();
  });
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function coursePoint(progress, side = 0) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  const p = clamp(progress, 0, 1);
  const y = h * (.9 - p * .77);
  const perspective = .35 + (1 - p) * .65;
  const center = w * (.5 + hole().bend * Math.sin(Math.PI * p) + hole().wave * Math.sin(Math.PI * 2 * p + state.holeIndex));
  const halfWidth = Math.min(w * .22, 185) * perspective;
  return {x: center + side * halfWidth, y, halfWidth, perspective};
}

function draw(animationT = null) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (!w || !h) return;
  ctx.clearRect(0, 0, w, h);
  drawRough(w, h);
  drawFairway();
  drawTrees(w, h);
  hole().hazards.forEach(drawHazard);
  drawGreen();
  drawStakes();
  drawTee();
  drawBall(animationT);
  drawVignette(w, h);
}

function drawRough(w, h) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#204b30");
  gradient.addColorStop(1, "#0f3423");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = .09;
  for (let i = 0; i < 150; i++) {
    const x = seeded(i + 90) * w;
    const y = seeded(i + 300) * h;
    ctx.fillStyle = i % 2 ? "#b2d57b" : "#061b12";
    ctx.fillRect(x, y, 1.2, 5 + seeded(i + 520) * 8);
  }
  ctx.globalAlpha = 1;
}

function fairwayPolygon(extra = 0) {
  const left = [], right = [];
  for (let i = 0; i <= 34; i++) {
    const p = i / 34;
    left.push(coursePoint(p, -1 - extra));
    right.unshift(coursePoint(p, 1 + extra));
  }
  return [...left, ...right];
}

function tracePolygon(points) {
  ctx.beginPath();
  points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.closePath();
}

function drawFairway() {
  tracePolygon(fairwayPolygon(.11));
  ctx.fillStyle = "#2f6d40";
  ctx.fill();
  tracePolygon(fairwayPolygon());
  const gradient = ctx.createLinearGradient(0, coursePoint(1).y, 0, coursePoint(0).y);
  gradient.addColorStop(0, "#69a955");
  gradient.addColorStop(1, "#74b95b");
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.save();
  tracePolygon(fairwayPolygon());
  ctx.clip();
  for (let i = 0; i < 12; i++) {
    const top = coursePoint(i / 12).y;
    const bottom = coursePoint((i + 1) / 12).y;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)";
    ctx.fillRect(0, Math.min(top,bottom), canvas.clientWidth, Math.abs(bottom-top));
  }
  ctx.restore();
}

function drawTrees(w, h) {
  for (let i = 0; i < 28; i++) {
    const p = .04 + seeded(i + 700) * .92;
    const side = i % 2 ? -1.48 - seeded(i + 800) * .55 : 1.48 + seeded(i + 800) * .55;
    const point = coursePoint(p, side);
    if (point.x < -20 || point.x > w + 20 || point.y < 0 || point.y > h) continue;
    const size = 5 + point.perspective * 12;
    ctx.fillStyle = "rgba(0,0,0,.16)";
    ctx.beginPath(); ctx.ellipse(point.x + 3, point.y + 4, size * .8, size * .35, .3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = i % 3 ? "#17472b" : "#205936";
    ctx.beginPath(); ctx.arc(point.x, point.y - size * .35, size * .65, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(point.x - size * .45, point.y, size * .52, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(point.x + size * .45, point.y, size * .52, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHazard(hazard) {
  const center = coursePoint(hazard.at, hazard.side * .84);
  const fw = center.halfWidth;
  const rx = hazard.side === 0 ? fw * 1.3 : fw * (hazard.width || .5);
  const ry = Math.max(9, canvas.clientHeight * hazard.length * .24);
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate((hazard.side || .2) * .2);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const angle = i / 24 * Math.PI * 2;
    const wobble = .88 + Math.sin(angle * 5 + hazard.at * 30) * .09;
    const x = Math.cos(angle) * rx * wobble;
    const y = Math.sin(angle) * ry * (1 + Math.cos(angle * 3) * .08);
    i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
  }
  ctx.closePath();
  if (hazard.type === "water") {
    const water = ctx.createLinearGradient(0,-ry,0,ry);
    water.addColorStop(0,"#67bfd2"); water.addColorStop(1,"#2b87ad");
    ctx.fillStyle = water; ctx.fill();
    ctx.strokeStyle = "rgba(210,246,250,.35)"; ctx.lineWidth = 1;
    for (let y = -ry * .55; y < ry * .7; y += 7) { ctx.beginPath(); ctx.moveTo(-rx*.6,y); ctx.lineTo(rx*.55,y+1); ctx.stroke(); }
  } else {
    const sand = ctx.createRadialGradient(-rx*.2,-ry*.3,2,0,0,rx);
    sand.addColorStop(0,"#f2dfaa"); sand.addColorStop(1,"#d5b76d");
    ctx.fillStyle = sand; ctx.fill();
    ctx.strokeStyle = "rgba(116,86,35,.25)"; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}

function drawGreen() {
  const point = coursePoint(1);
  const rx = Math.max(32, point.halfWidth * 1.55);
  const ry = Math.max(15, canvas.clientHeight * .045);
  ctx.fillStyle = "#91d56a";
  ctx.beginPath(); ctx.ellipse(point.x, point.y, rx, ry, hole().bend * .6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(225,255,208,.34)"; ctx.lineWidth = 2; ctx.stroke();
  const flag = FLAG_INFO[hole().flag];
  const flagX = point.x + flag.offset * .35;
  const flagY = point.y - 3;
  ctx.fillStyle = "rgba(0,0,0,.18)";
  ctx.beginPath(); ctx.ellipse(flagX + 5, flagY + 6, 12, 3, .2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f6f4df"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(flagX, flagY + 4); ctx.lineTo(flagX, flagY - 39); ctx.stroke();
  ctx.fillStyle = flag.color;
  ctx.beginPath(); ctx.moveTo(flagX + 1, flagY - 38); ctx.lineTo(flagX + 24, flagY - 32); ctx.lineTo(flagX + 1, flagY - 25); ctx.closePath(); ctx.fill();
  if (hole().flag === "white") { ctx.strokeStyle = "#bcc7c0"; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.fillStyle = "#264b32"; ctx.beginPath(); ctx.ellipse(flagX, flagY+4, 4, 1.8, 0, 0, Math.PI*2); ctx.fill();
}

function drawStakes() {
  const stakes = [
    {distance:250,color:"#222725"},{distance:200,color:"#277bc0"},{distance:150,color:"#ffffff"},{distance:100,color:"#da4139"}
  ];
  const total = centerDistanceYd();
  stakes.forEach(stake => {
    if (stake.distance >= total - 15) return;
    const p = 1 - stake.distance / total;
    [-1.12,1.12].forEach(side => {
      const point = coursePoint(p, side);
      const height = 12 + point.perspective * 12;
      ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(point.x+1,point.y+2); ctx.lineTo(point.x+1,point.y-height); ctx.stroke();
      ctx.strokeStyle = stake.color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(point.x,point.y); ctx.lineTo(point.x,point.y-height); ctx.stroke();
    });
  });
}

function drawTee() {
  const point = coursePoint(0);
  const width = point.halfWidth * 1.25;
  ctx.fillStyle = "#87c568";
  roundedRect(point.x - width/2, point.y - 10, width, 26, 7); ctx.fill();
  const markerColor = ({black:"#202522",blue:"#2a78ba",white:"#ffffff",red:"#d8443c"})[state.tee];
  [-.22,.22].forEach(offset => {
    ctx.fillStyle = markerColor;
    ctx.beginPath(); ctx.ellipse(point.x + width*offset, point.y+2, 7, 3, 0, 0, Math.PI*2); ctx.fill();
    if (state.tee === "white") { ctx.strokeStyle="#b8c2ba"; ctx.lineWidth=1; ctx.stroke(); }
  });
}

function roundedRect(x,y,w,h,r) {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
}

function drawBall(animationT) {
  let remaining = state.remainingYd;
  let side = state.side;
  let arc = 0;
  if (animationT !== null && state.animation) {
    const eased = 1 - Math.pow(1-animationT, 2.6);
    remaining = state.animation.fromRemaining + (state.animation.toRemaining - state.animation.fromRemaining) * eased;
    side = state.animation.fromSide + (state.animation.toSide - state.animation.fromSide) * eased;
    arc = Math.sin(Math.PI * animationT) * Math.min(115, canvas.clientHeight * .19);
  }
  const progress = clamp((targetDistanceYd() - remaining) / targetDistanceYd(), 0, .985);
  const ground = coursePoint(progress, side);
  const size = 4.5 + ground.perspective * 4.5;
  ctx.fillStyle = `rgba(0,0,0,${.2 - (arc ? .08 : 0)})`;
  ctx.beginPath(); ctx.ellipse(ground.x + 2, ground.y + 3, size * 1.35, size * .52, 0, 0, Math.PI*2); ctx.fill();
  const y = ground.y - arc;
  const gradient = ctx.createRadialGradient(ground.x-size*.35,y-size*.45,1,ground.x,y,size);
  gradient.addColorStop(0,"#ffffff"); gradient.addColorStop(1,"#d7ded9");
  ctx.fillStyle = gradient;
  ctx.beginPath(); ctx.arc(ground.x,y,size,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "rgba(20,45,32,.25)"; ctx.lineWidth = 1; ctx.stroke();
}

function drawVignette(w,h) {
  const gradient = ctx.createRadialGradient(w*.5,h*.52,Math.min(w,h)*.2,w*.5,h*.52,Math.max(w,h)*.72);
  gradient.addColorStop(.55,"rgba(0,0,0,0)"); gradient.addColorStop(1,"rgba(0,18,9,.32)");
  ctx.fillStyle = gradient; ctx.fillRect(0,0,w,h);
}

renderClubs();
setupEvents();
updateDriveLabel();
resetHole();
renderScorecard();
resizeCanvas();
new ResizeObserver(resizeCanvas).observe(els.courseStage);
