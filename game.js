(function () {
  "use strict";

  /* ============================================================
   * Cute icon pool (Font Awesome solid). Each has an icon class
   * and a color so kids can tell them apart easily.
   * ========================================================== */
  var ICONS = [
    { i: "fa-cat", c: "#ff8fb1" },
    { i: "fa-dog", c: "#c98a5e" },
    { i: "fa-fish", c: "#4fc3f7" },
    { i: "fa-frog", c: "#66bb6a" },
    { i: "fa-hippo", c: "#9575cd" },
    { i: "fa-dove", c: "#7ac7ff" },
    { i: "fa-crow", c: "#5a4a6a" },
    { i: "fa-otter", c: "#a1887f" },
    { i: "fa-spider", c: "#8d6e63" },
    { i: "fa-bugs", c: "#ef5350" },
    { i: "fa-star", c: "#ffd166" },
    { i: "fa-heart", c: "#ff5d73" },
    { i: "fa-sun", c: "#ffb300" },
    { i: "fa-moon", c: "#7986cb" },
    { i: "fa-cloud", c: "#90caf9" },
    { i: "fa-bolt", c: "#ffca28" },
    { i: "fa-snowflake", c: "#4dd0e1" },
    { i: "fa-fire", c: "#ff7043" },
    { i: "fa-leaf", c: "#66bb6a" },
    { i: "fa-tree", c: "#43a047" },
    { i: "fa-apple-whole", c: "#e53935" },
    { i: "fa-carrot", c: "#fb8c00" },
    { i: "fa-lemon", c: "#fdd835" },
    { i: "fa-ice-cream", c: "#f48fb1" },
    { i: "fa-cookie", c: "#a1887f" },
    { i: "fa-candy-cane", c: "#ef5350" },
    { i: "fa-cake-candles", c: "#ba68c8" },
    { i: "fa-gift", c: "#ec407a" },
    { i: "fa-crown", c: "#ffca28" },
    { i: "fa-gem", c: "#26c6da" },
    { i: "fa-ghost", c: "#b0bec5" },
    { i: "fa-robot", c: "#78909c" },
    { i: "fa-rocket", c: "#7e57c2" },
    { i: "fa-car", c: "#42a5f5" },
    { i: "fa-plane", c: "#29b6f6" },
    { i: "fa-anchor", c: "#5c6bc0" },
    { i: "fa-umbrella", c: "#26a69a" },
    { i: "fa-key", c: "#ffa726" },
    { i: "fa-bell", c: "#ffb300" },
    { i: "fa-football", c: "#8d6e63" },
    // --- thêm icon mới ---
    { i: "fa-dragon", c: "#66bb6a" },
    { i: "fa-horse", c: "#a1887f" },
    { i: "fa-kiwi-bird", c: "#8d6e63" },
    { i: "fa-shrimp", c: "#ff7043" },
    { i: "fa-worm", c: "#ec407a" },
    { i: "fa-mosquito", c: "#78909c" },
    { i: "fa-feather", c: "#7ac7ff" },
    { i: "fa-paw", c: "#c98a5e" },
    { i: "fa-bone", c: "#cfd8dc" },
    { i: "fa-egg", c: "#ffe082" },
    { i: "fa-cheese", c: "#ffca28" },
    { i: "fa-pizza-slice", c: "#ff7043" },
    { i: "fa-hamburger", c: "#a1887f" },
    { i: "fa-hotdog", c: "#ef6c00" },
    { i: "fa-drumstick-bite", c: "#bcaaa4" },
    { i: "fa-bacon", c: "#ef5350" },
    { i: "fa-mug-hot", c: "#8d6e63" },
    { i: "fa-ice-cream", c: "#f48fb1" },
    { i: "fa-cubes-stacked", c: "#7e57c2" },
    { i: "fa-pepper-hot", c: "#e53935" },
    { i: "fa-seedling", c: "#66bb6a" },
    { i: "fa-spa", c: "#26a69a" },
    { i: "fa-clover", c: "#43a047" },
    { i: "fa-mountain", c: "#8d6e63" },
    { i: "fa-water", c: "#4fc3f7" },
    { i: "fa-wind", c: "#90a4ae" },
    { i: "fa-rainbow", c: "#ba68c8" },
    { i: "fa-meteor", c: "#ff7043" },
    { i: "fa-star-and-crescent", c: "#7986cb" },
    { i: "fa-puzzle-piece", c: "#26c6da" },
    { i: "fa-dice", c: "#ef5350" },
    { i: "fa-chess-knight", c: "#5c6bc0" },
    { i: "fa-guitar", c: "#ff8a65" },
    { i: "fa-drum", c: "#8d6e63" },
    { i: "fa-bicycle", c: "#42a5f5" },
    { i: "fa-train", c: "#7e57c2" },
    { i: "fa-sailboat", c: "#29b6f6" },
    { i: "fa-helicopter", c: "#78909c" },
    { i: "fa-tractor", c: "#43a047" },
    { i: "fa-hat-wizard", c: "#7e57c2" },
    { i: "fa-shield-cat", c: "#ff8fb1" },
    { i: "fa-shield-dog", c: "#c98a5e" },
    { i: "fa-cookie-bite", c: "#a1887f" },
    { i: "fa-lightbulb", c: "#ffca28" },
    { i: "fa-magnet", c: "#ef5350" },
    { i: "fa-compass", c: "#26a69a" },
    { i: "fa-map", c: "#66bb6a" },
    { i: "fa-flask", c: "#26c6da" },
    { i: "fa-palette", c: "#ba68c8" },
    { i: "fa-camera", c: "#5c6bc0" }
  ];

  /* ============================================================
   * State
   * ========================================================== */
  var START_ICONS = 3;   // round 1
  var MAX_ICONS = 20;    // last round (was 12) -> 18 rounds total
  var MAX_ROUND = MAX_ICONS - START_ICONS + 1; // = 18
  var STORE_KEY = "coplay_matchgame_v1";
  var HISTORY_KEY = "coplay_matchgame_history_v1";
  var HISTORY_MAX = 20;  // keep the most recent 20 games
  var WIN_TARGET = 5;    // single-level mode: first to this many points wins

  /* Cute animals assigned to each player at game start (name + icon + color) */
  var ANIMALS = [
    { name: "Ngựa Hồng", i: "fa-horse", c: "#ff8fb1" },
    { name: "Dê Béo", i: "fa-hippo", c: "#b892ff" },
    { name: "Mèo Mập", i: "fa-cat", c: "#ffb300" },
    { name: "Cún Vàng", i: "fa-dog", c: "#c98a5e" },
    { name: "Cá Xanh", i: "fa-fish", c: "#4fc3f7" },
    { name: "Ếch Cốm", i: "fa-frog", c: "#66bb6a" },
    { name: "Chim Bồ Câu", i: "fa-dove", c: "#7ac7ff" },
    { name: "Rái Cá", i: "fa-otter", c: "#a1887f" },
    { name: "Rồng Con", i: "fa-dragon", c: "#43a047" },
    { name: "Kỳ Lân", i: "fa-kiwi-bird", c: "#ba68c8" },
    { name: "Tôm Nhí", i: "fa-shrimp", c: "#ff7043" },
    { name: "Cú Mèo", i: "fa-crow", c: "#5c6bc0" },
    { name: "Bọ Rùa", i: "fa-bugs", c: "#ef5350" },
    { name: "Nhím Xù", i: "fa-paw", c: "#8d6e63" },
    { name: "Ngựa Vằn", i: "fa-horse", c: "#5a4a6a" },
    { name: "Sao Biển", i: "fa-star", c: "#ffd166" }
  ];

  var state = {
    round: 1,
    startLevel: 1,          // force-level chosen on the start screen
    lockLevel: false,       // keep same difficulty (single-level mode)
    playing: false,
    locked: false,          // global lock during win / round transition
    scores: { 1: 0, 2: 0 },
    matchIcon: null,
    startTime: 0,           // when the current game began (ms)
    pausedTotal: 0,         // total paused time this game (ms), excluded from duration
    pauseStartedAt: 0,      // when the current pause began (ms)
    paused: false,          // pause dialog open
    avatars: { 1: null, 2: null },  // {name, i, c} per player
    history: [],            // finished games, newest first
    // per-player penalty tracking (reset every round)
    wrongCount: { 1: 0, 2: 0 },   // number of wrong taps this round
    disabled: { 1: false, 2: false },
    penaltyTimer: { 1: null, 2: null },
    tickTimer: { 1: null, 2: null }
  };

  /* ============================================================
   * DOM refs
   * ========================================================== */
  var el = {
    overlay: document.getElementById("overlay"),
    overlayText: document.getElementById("overlay-text"),
    startBtn: document.getElementById("start-btn"),
    resetBtn: document.getElementById("reset-btn"),
    stopBtn: document.getElementById("stop-btn"),
    circle1: document.getElementById("circle-1"),
    circle2: document.getElementById("circle-2"),
    flash1: document.getElementById("flash-1"),
    flash2: document.getElementById("flash-2"),
    penalty1: document.getElementById("penalty-1"),
    penalty2: document.getElementById("penalty-2"),
    penaltyNum1: document.getElementById("penalty-num-1"),
    penaltyNum2: document.getElementById("penalty-num-2"),
    score1: document.getElementById("score-1"),
    score2: document.getElementById("score-2"),
    roundBadge: document.getElementById("round-badge"),
    roundNum: document.getElementById("round-num"),
    countdown: document.getElementById("countdown"),
    // level picker
    levelValue: document.getElementById("level-value"),
    levelIcons: document.getElementById("level-icons"),
    levelDown: document.getElementById("level-down"),
    levelUp: document.getElementById("level-up"),
    lockLevel: document.getElementById("lock-level"),
    lockHint: document.getElementById("lock-hint"),
    // avatars
    avatar1: document.getElementById("avatar-1"),
    avatar2: document.getElementById("avatar-2"),
    avatarIcon1: document.getElementById("avatar-icon-1"),
    avatarIcon2: document.getElementById("avatar-icon-2"),
    avatarName1: document.getElementById("avatar-name-1"),
    avatarName2: document.getElementById("avatar-name-2"),
    // history
    historyList: document.getElementById("history-list"),
    historyEmpty: document.getElementById("history-empty"),
    historyClear: document.getElementById("history-clear"),
    // pause dialog
    pause: document.getElementById("pause"),
    pauseScore: document.getElementById("pause-score"),
    resumeBtn: document.getElementById("resume-btn"),
    finishBtn: document.getElementById("finish-btn")
  };

  /* ============================================================
   * Persistence
   * ========================================================== */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && data.scores) {
        state.scores[1] = data.scores[1] || 0;
        state.scores[2] = data.scores[2] || 0;
      }
      if (data && data.round) state.round = clampRound(data.round);
    } catch (e) { /* ignore corrupt storage */ }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        scores: state.scores,
        round: state.round
      }));
    } catch (e) { /* storage may be unavailable */ }
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (Array.isArray(data)) state.history = data;
    } catch (e) { /* ignore corrupt storage */ }
  }

  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
    } catch (e) { /* storage may be unavailable */ }
  }

  /* ============================================================
   * Helpers
   * ========================================================== */
  function clampRound(r) {
    return Math.max(1, Math.min(MAX_ROUND, r));
  }

  function iconsForRound(r) {
    return Math.min(MAX_ICONS, START_ICONS + (r - 1));
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateScores() {
    el.score1.textContent = state.scores[1];
    el.score2.textContent = state.scores[2];
  }

  /* ============================================================
   * Non-overlapping placement inside a unit circle.
   * Returns array of {x, y} in percentage (0-100) of the circle box.
   * r = icon radius as a fraction of circle radius.
   * ========================================================== */
  function placePositions(count, iconFrac) {
    var positions = [];
    var maxR = 0.5 - iconFrac - 0.02; // keep inside ring, small margin
    var attempts = 0;
    var minGap = iconFrac * 2 * 0.92; // allow a hair of touching

    while (positions.length < count && attempts < 4000) {
      attempts++;
      // random point in disk (uniform)
      var ang = Math.random() * Math.PI * 2;
      var rad = Math.sqrt(Math.random()) * maxR;
      var x = 0.5 + rad * Math.cos(ang);
      var y = 0.5 + rad * Math.sin(ang);

      var ok = true;
      for (var k = 0; k < positions.length; k++) {
        var dx = x - positions[k].x;
        var dy = y - positions[k].y;
        if (Math.sqrt(dx * dx + dy * dy) < minGap) { ok = false; break; }
      }
      if (ok) positions.push({ x: x, y: y });
    }

    // Fallback ring layout if random packing failed (many icons)
    if (positions.length < count) {
      positions = [];
      var ringR = maxR * 0.72;
      for (var n = 0; n < count; n++) {
        var a = (n / count) * Math.PI * 2;
        positions.push({
          x: 0.5 + ringR * Math.cos(a),
          y: 0.5 + ringR * Math.sin(a)
        });
      }
    }
    return positions.map(function (p) {
      return { x: p.x * 100, y: p.y * 100 };
    });
  }

  /* ============================================================
   * Build one icon button element
   * ========================================================== */
  function makeIcon(iconDef, pos, sizePx, player) {
    var btn = document.createElement("button");
    btn.className = "icon-btn";
    btn.style.left = pos.x + "%";
    btn.style.top = pos.y + "%";
    btn.style.width = sizePx + "px";
    btn.style.height = sizePx + "px";
    btn.style.color = iconDef.c;

    var ic = document.createElement("i");
    ic.className = "fa-solid " + iconDef.i;
    ic.style.fontSize = Math.round(sizePx * 0.56) + "px";
    btn.appendChild(ic);

    btn.dataset.icon = iconDef.i;
    btn.dataset.player = player;

    btn.addEventListener("click", onIconTap);
    return btn;
  }

  /* ============================================================
   * Render a round: fill both circles.
   * Guarantee exactly ONE icon appears in BOTH circles.
   * ========================================================== */
  function renderRound() {
    clearAllPenalties(); // fresh start each round: reset wrong counts + timers
    var count = iconsForRound(state.round);
    el.circle1.innerHTML = "";
    el.circle2.innerHTML = "";

    // Pick the shared match icon + fully distinct fillers for each side.
    // We need 1 match + (count-1) fillers for side 1 + (count-1) for side 2,
    // all distinct, so no second icon is ever shared between the sides.
    var pool = shuffle(ICONS);
    var match = pool[0];
    state.matchIcon = match.i;

    var rest = pool.slice(1);                 // 39 distinct icons available
    var side1Fill = rest.slice(0, count - 1); // first block
    var side2Fill = rest.slice(count - 1, (count - 1) * 2); // second, non-overlapping block

    var list1 = shuffle(side1Fill.concat([match]));
    var list2 = shuffle(side2Fill.concat([match]));

    // icon size scales down as count grows
    var iconFrac = sizeFractionFor(count);
    var pos1 = placePositions(count, iconFrac);
    var pos2 = placePositions(count, iconFrac);

    var box1 = el.circle1.getBoundingClientRect();
    var box2 = el.circle2.getBoundingClientRect();
    var sizePx1 = Math.max(28, Math.round(box1.width * iconFrac * 2));
    var sizePx2 = Math.max(28, Math.round(box2.width * iconFrac * 2));

    var i;
    for (i = 0; i < count; i++) {
      el.circle1.appendChild(makeIcon(list1[i], pos1[i], sizePx1, 1));
    }
    for (i = 0; i < count; i++) {
      el.circle2.appendChild(makeIcon(list2[i], pos2[i], sizePx2, 2));
    }

    // staggered pop-in
    var all = document.querySelectorAll(".icon-btn");
    all.forEach(function (n, k) {
      setTimeout(function () { n.classList.add("show"); }, 30 + k * 25);
    });

    el.roundNum.textContent = state.round;
    el.roundBadge.classList.add("show");
  }

  function sizeFractionFor(count) {
    // radius fraction of the circle radius; shrinks as icon count grows
    if (count <= 3) return 0.20;
    if (count <= 5) return 0.16;
    if (count <= 7) return 0.135;
    if (count <= 9) return 0.115;
    if (count <= 11) return 0.10;
    if (count <= 13) return 0.088;
    if (count <= 15) return 0.078;
    if (count <= 17) return 0.070;
    return 0.063; // 18-20 icons
  }

  /* ============================================================
   * Tap handling
   * ========================================================== */
  function onIconTap(e) {
    var btn = e.currentTarget;
    var player = parseInt(btn.dataset.player, 10);

    // Ignore taps when: round is transitioning, or this player is timed out.
    if (!state.playing || state.locked || state.disabled[player]) return;

    var tapped = btn.dataset.icon;

    if (tapped === state.matchIcon) {
      state.locked = true;
      btn.classList.add("correct");
      // highlight the same match on the other side too
      var otherSel = player === 1 ? "#circle-2" : "#circle-1";
      var twin = document.querySelector(otherSel + ' .icon-btn[data-icon="' + cssEscape(tapped) + '"]');
      if (twin) twin.classList.add("correct");

      winRound(player);
    } else {
      btn.classList.add("wrong");
      setTimeout(function () { btn.classList.remove("wrong"); }, 400);
      applyPenalty(player);
    }
  }

  /* ============================================================
   * Wrong-tap penalty: disable that player's side for (n+1) seconds,
   * where n = number of wrong taps this round (1st wrong = 2s,
   * 2nd = 3s, 3rd = 4s, ...). The other player keeps playing.
   * ========================================================== */
  function applyPenalty(player) {
    state.wrongCount[player] += 1;
    var seconds = state.wrongCount[player] + 1; // n + 1

    state.disabled[player] = true;

    var overlay = player === 1 ? el.penalty1 : el.penalty2;
    var numEl = player === 1 ? el.penaltyNum1 : el.penaltyNum2;

    var remaining = seconds;
    numEl.textContent = remaining;
    overlay.classList.add("show");
    bumpTick(numEl);

    // clear any existing timers for this player before starting new ones
    clearPlayerTimers(player);

    state.tickTimer[player] = setInterval(function () {
      remaining -= 1;
      if (remaining > 0) {
        numEl.textContent = remaining;
        bumpTick(numEl);
      }
    }, 1000);

    state.penaltyTimer[player] = setTimeout(function () {
      endPenalty(player);
    }, seconds * 1000);
  }

  function bumpTick(numEl) {
    numEl.classList.remove("tick");
    // force reflow so the animation restarts each second
    void numEl.offsetWidth;
    numEl.classList.add("tick");
  }

  function endPenalty(player) {
    clearPlayerTimers(player);
    state.disabled[player] = false;
    var overlay = player === 1 ? el.penalty1 : el.penalty2;
    overlay.classList.remove("show");
  }

  function clearPlayerTimers(player) {
    if (state.penaltyTimer[player]) {
      clearTimeout(state.penaltyTimer[player]);
      state.penaltyTimer[player] = null;
    }
    if (state.tickTimer[player]) {
      clearInterval(state.tickTimer[player]);
      state.tickTimer[player] = null;
    }
  }

  function clearAllPenalties() {
    [1, 2].forEach(function (p) {
      clearPlayerTimers(p);
      state.disabled[p] = false;
      state.wrongCount[p] = 0;
    });
    el.penalty1.classList.remove("show");
    el.penalty2.classList.remove("show");
  }

  function cssEscape(s) {
    return s.replace(/[^a-zA-Z0-9\-_]/g, "");
  }

  /* ============================================================
   * Win a round
   * ========================================================== */
  function winRound(player) {
    clearAllPenalties(); // stop any active timeout on either side
    state.scores[player] += 1;
    updateScores();
    saveState();

    var flash = player === 1 ? el.flash1 : el.flash2;
    flash.classList.add("win");
    setTimeout(function () { flash.classList.remove("win"); }, 1100);

    setTimeout(function () {
      if (state.lockLevel) {
        // Single-level mode: never advance difficulty. First to WIN_TARGET wins.
        if (state.scores[player] >= WIN_TARGET) {
          endGame("round");
        } else {
          saveState();
          state.locked = false;
          renderRound(); // same level again
        }
      } else if (state.round >= MAX_ROUND) {
        endGame("round");
      } else {
        state.round = clampRound(state.round + 1);
        saveState();
        state.locked = false;
        renderRound();
      }
    }, 1150);
  }

  /* ============================================================
   * Countdown then start
   * ========================================================== */
  function runCountdown(done) {
    var seq = ["3", "2", "1", "🎉"];
    var i = 0;
    el.countdown.classList.add("show");
    function tick() {
      if (i >= seq.length) {
        el.countdown.classList.remove("show");
        el.countdown.innerHTML = "";
        done();
        return;
      }
      el.countdown.innerHTML = "<span>" + seq[i] + "</span>";
      i++;
      setTimeout(tick, 700);
    }
    tick();
  }

  /* ============================================================
   * Game flow
   * ========================================================== */
  function startGame() {
    // fresh scores each new game so WIN_TARGET / results are meaningful
    state.scores = { 1: 0, 2: 0 };
    updateScores();

    // start from the level chosen on the start screen
    state.round = clampRound(state.startLevel);
    state.startTime = Date.now();
    state.pausedTotal = 0;
    state.pauseStartedAt = 0;
    state.paused = false;
    assignAvatars();
    saveState();

    el.overlay.classList.add("hide");
    state.playing = false;
    state.locked = true;
    runCountdown(function () {
      state.playing = true;
      state.locked = false;
      renderRound();
    });
  }

  /* Pick two distinct cute animals, one per player, and show their tags. */
  function assignAvatars() {
    var pick = shuffle(ANIMALS);
    state.avatars[1] = pick[0];
    state.avatars[2] = pick[1];

    el.avatarIcon1.className = "avatar__icon fa-solid " + pick[0].i;
    el.avatarIcon1.style.background = pick[0].c;
    el.avatarName1.textContent = pick[0].name;
    el.avatar1.classList.add("show");

    el.avatarIcon2.className = "avatar__icon fa-solid " + pick[1].i;
    el.avatarIcon2.style.background = pick[1].c;
    el.avatarName2.textContent = pick[1].name;
    el.avatar2.classList.add("show");
  }

  function hideAvatars() {
    el.avatar1.classList.remove("show");
    el.avatar2.classList.remove("show");
  }

  // Stop button: pause the game and show Resume / Finish choices.
  function stopGame() {
    if (!state.playing || state.paused) return;
    state.paused = true;
    state.playing = false;      // freeze taps while paused
    state.pauseStartedAt = Date.now();
    clearAllPenalties();        // clear any running timeout so it doesn't fire while paused

    var a1 = state.avatars[1], a2 = state.avatars[2];
    var n1 = a1 ? a1.name : "Người 1";
    var n2 = a2 ? a2.name : "Người 2";
    el.pauseScore.textContent = n1 + " " + state.scores[1] + " - " + state.scores[2] + " " + n2;
    el.pause.classList.add("show");
  }

  // Resume: close dialog, keep the same board and scores, continue playing.
  function resumeGame() {
    if (!state.paused) return;
    // exclude paused time from the game duration
    if (state.pauseStartedAt) {
      state.pausedTotal += Date.now() - state.pauseStartedAt;
      state.pauseStartedAt = 0;
    }
    state.paused = false;
    el.pause.classList.remove("show");
    state.playing = true;
    state.locked = false;
  }

  // Finish: end the game now, tally score, record history, back to start screen.
  function finishGame() {
    if (!state.paused) return;
    state.paused = false;
    el.pause.classList.remove("show");
    endGame("manual");
  }

  function endGame(reason) {
    state.playing = false;
    state.locked = false;
    state.paused = false;
    clearAllPenalties();
    hideAvatars();
    el.pause.classList.remove("show");
    el.circle1.innerHTML = "";
    el.circle2.innerHTML = "";
    el.roundBadge.classList.remove("show");

    var s1 = state.scores[1], s2 = state.scores[2];
    var winner;
    if (s1 > s2) winner = 1;
    else if (s2 > s1) winner = 2;
    else winner = 0;

    var a1 = state.avatars[1], a2 = state.avatars[2];
    var name1 = a1 ? a1.name : "Người chơi 1";
    var name2 = a2 ? a2.name : "Người chơi 2";

    // duration excludes any time spent paused
    var pausedExtra = state.pauseStartedAt ? (Date.now() - state.pauseStartedAt) : 0;
    var durationMs = state.startTime
      ? (Date.now() - state.startTime - state.pausedTotal - pausedExtra)
      : 0;
    if (durationMs < 0) durationMs = 0;
    state.pauseStartedAt = 0;

    var byManual = (reason === "manual");
    var msg;
    if (winner === 1) {
      msg = "🏆 " + name1 + (byManual ? " đang dẫn, thắng!" : " nhanh hơn, thắng chung cuộc!");
    } else if (winner === 2) {
      msg = "🏆 " + name2 + (byManual ? " đang dẫn, thắng!" : " nhanh hơn, thắng chung cuộc!");
    } else {
      msg = "🤝 Hòa nhau rồi! Cùng giỏi ghê!";
    }
    el.overlayText.textContent = msg;

    // record this finished game into history (newest first)
    recordHistory({
      winner: winner,
      s1: s1,
      s2: s2,
      name1: name1,
      name2: name2,
      icon1: a1 ? a1.i : null,
      icon2: a2 ? a2.i : null,
      color1: a1 ? a1.c : null,
      color2: a2 ? a2.c : null,
      lockLevel: state.lockLevel,
      fromLevel: state.startLevel,
      durationMs: durationMs,
      ended: byManual ? "manual" : "round",
      time: Date.now()
    });

    // reset round for next full game, keep scores visible
    state.round = 1;
    saveState();
    el.overlay.classList.remove("hide");
  }

  function recordHistory(entry) {
    state.history.unshift(entry);
    if (state.history.length > HISTORY_MAX) {
      state.history = state.history.slice(0, HISTORY_MAX);
    }
    saveHistory();
    renderHistory();
  }

  function resetScores() {
    state.scores = { 1: 0, 2: 0 };
    state.round = 1;
    state.startLevel = 1;
    state.lockLevel = false;
    saveState();
    updateScores();
    updateLevelPicker();
    el.overlayText.textContent = "Đã xóa điểm! Bắt đầu lại nào 🎈";
  }

  /* ============================================================
   * Level picker
   * ========================================================== */
  function updateLevelPicker() {
    el.levelValue.textContent = state.startLevel;
    var icons = iconsForRound(state.startLevel);
    el.levelIcons.textContent = icons + " hình";
    el.levelDown.disabled = state.startLevel <= 1;
    el.levelUp.disabled = state.startLevel >= MAX_ROUND;
    el.lockLevel.checked = state.lockLevel;
    if (state.lockLevel) {
      el.lockHint.textContent = "Chỉ chơi ở " + icons +
        " hình. Ai đạt " + WIN_TARGET + " điểm trước là thắng.";
    } else {
      el.lockHint.textContent = "Tăng dần độ khó qua mỗi vòng thắng.";
    }
  }

  function changeLevel(delta) {
    var next = Math.max(1, Math.min(MAX_ROUND, state.startLevel + delta));
    if (next === state.startLevel) return;
    state.startLevel = next;
    updateLevelPicker();
  }

  /* ============================================================
   * History rendering
   * ========================================================== */
  function formatTime(ts) {
    var d = new Date(ts);
    function p(n) { return n < 10 ? "0" + n : "" + n; }
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + " " +
           p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function formatDuration(ms) {
    if (!ms || ms < 0) return "--";
    var totalSec = Math.round(ms / 1000);
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    if (m > 0) return m + " phút " + (s < 10 ? "0" + s : s) + "s";
    return s + "s";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderHistory() {
    el.historyList.innerHTML = "";
    if (!state.history.length) {
      el.historyEmpty.style.display = "block";
      return;
    }
    el.historyEmpty.style.display = "none";

    state.history.forEach(function (g) {
      var name1 = g.name1 || "Người chơi 1";
      var name2 = g.name2 || "Người chơi 2";

      var li = document.createElement("li");
      li.className = "history__item";

      var badge = document.createElement("div");
      var result = document.createElement("div");
      result.className = "info";

      var winnerName;
      if (g.winner === 1) {
        badge.className = "badge badge--p1";
        if (g.icon1) { badge.innerHTML = '<i class="fa-solid ' + cssEscape(g.icon1) + '"></i>'; }
        else { badge.textContent = "1"; }
        winnerName = name1 + " thắng";
      } else if (g.winner === 2) {
        badge.className = "badge badge--p2";
        if (g.icon2) { badge.innerHTML = '<i class="fa-solid ' + cssEscape(g.icon2) + '"></i>'; }
        else { badge.textContent = "2"; }
        winnerName = name2 + " thắng";
      } else {
        badge.className = "badge badge--tie";
        badge.innerHTML = '<i class="fa-solid fa-handshake"></i>';
        winnerName = "Hòa nhau";
      }
      result.innerHTML = '<span class="result">' + escapeHtml(winnerName) + '</span>';

      var mode = g.lockLevel
        ? ("giữ " + (g.fromLevel != null ? iconsForRound(g.fromLevel) : "?") + " hình")
        : ("từ vòng " + (g.fromLevel || 1));
      var endTag = g.ended === "manual" ? " · dừng giữa chừng" : "";

      var meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML =
        '<span>' + escapeHtml(name1) + ' ' + g.s1 + ' - ' + g.s2 + ' ' + escapeHtml(name2) + '</span><br>' +
        '<i class="fa-solid fa-stopwatch"></i> ' + formatDuration(g.durationMs) +
        ' · ' + mode + endTag + ' · ' + formatTime(g.time);
      result.appendChild(meta);

      li.appendChild(badge);
      li.appendChild(result);
      el.historyList.appendChild(li);
    });
  }

  function clearHistory() {
    state.history = [];
    saveHistory();
    renderHistory();
  }

  /* ============================================================
   * Wire up
   * ========================================================== */
  function init() {
    loadState();
    loadHistory();
    updateScores();
    updateLevelPicker();
    renderHistory();

    el.startBtn.addEventListener("click", startGame);
    el.resetBtn.addEventListener("click", resetScores);
    el.stopBtn.addEventListener("click", stopGame);
    el.resumeBtn.addEventListener("click", resumeGame);
    el.finishBtn.addEventListener("click", finishGame);

    el.levelDown.addEventListener("click", function () { changeLevel(-1); });
    el.levelUp.addEventListener("click", function () { changeLevel(1); });
    el.lockLevel.addEventListener("change", function () {
      state.lockLevel = el.lockLevel.checked;
      updateLevelPicker();
    });
    el.historyClear.addEventListener("click", clearHistory);

    // Re-render on resize/orientation to keep icons sized correctly
    var rt;
    window.addEventListener("resize", function () {
      if (!state.playing) return;
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (state.playing) renderRound();
      }, 250);
    });

    // Prevent double-tap zoom / accidental scrolling on the play area
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });
    document.addEventListener("dblclick", function (e) { e.preventDefault(); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
