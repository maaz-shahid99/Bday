/* ==========================================================
   EDIT THIS BLOCK ONLY. Everything below it just works.
   ========================================================== */
const CONFIG = {
  name: "Sharmistha",
  birthday: "2026-08-19T00:00:00",   // next birthday, local time
  song: "assets/the_mountain-birthday-490600.mp3",   // the tape

  // No photo appears twice on the site. These three are hers to scratch open
  // and are deliberately NOT on the wall - unwrapping something you are about
  // to see again is a wasted reveal.
  photos: [
    { src: "assets/pics/child-bike.jpg",   caption: "Not even her bike." },
    { src: "assets/pics/2019-garden.jpg",  caption: "Camera loves my baby boo." },
    { src: "assets/pics/2025-dinner.jpg",  caption: "Bade acche lagte hain... \u{1F3B5}" }
  ],

  // The wall at the end. Oldest first, so it builds to the last one.
  gallery: [
    { src: "assets/pics/child-mum.jpg",    caption: "Baccha's smallest version." },
    { src: "assets/pics/2019-yellow.jpg",  caption: "The hair had plans." },
    { src: "assets/pics/2023-tokyo.jpg",   caption: "My angrybird in red." },
    { src: "assets/pics/2023-quiet.jpg",   caption: "No caption needed." },
    { src: "assets/pics/2025-cafe.jpg",    caption: "Baccha doing her happiest activity." },
    { src: "assets/pics/us-laughing.jpg",  caption: "Us." }
  ],

  // Unsigned. Add from: "Name" to any of these and it shows as an em dash
  // and the name under the note; leave it off and nothing is shown.
  notes: [
    { text: "You still owe me \u20B9400 from 2021. Happy birthday." },
    { text: "Best friend a person could rent. Love you." },
    { text: "Happy bday!! Sorry if I missed something." },
    { text: "Eight years. Not one boring day." }
  ]
};

/* ========================================================== */

/* This list is the running order. A filename no longer tells you where a gate
   sits — gate2.html is third — so change the order here and nowhere else. */
const GATES = [
  { href: "gate1.html",       label: "Candles"  },
  { href: "game-memory.html", label: "Memory"   },
  { href: "gate2.html",       label: "Balloons" },
  { href: "game-catch.html",  label: "Catch"    },
  { href: "gate3.html",       label: "Unwrap"   },
  { href: "gate4.html",       label: "Quiz"     },
  { href: "game-code.html",   label: "Passcode" },
  { href: "wall.html",        label: "The wall" }
];

/* Which gate is this page? -1 means the home page, which isn't one. */
function currentIndex() {
  const file = location.pathname.split("/").pop() || "index.html";
  return GATES.findIndex(g => g.href === file);
}

/* --- nothing opens before the day itself --- */
const OPENS = new Date(CONFIG.birthday);

function unlocked() {
  // ?preview=1 opens the gates early so this can be checked before the day,
  // and sticks for the tab. ?preview=0 turns it off again.
  try {
    const q = new URLSearchParams(location.search).get("preview");
    if (q === "0" || q === "off") sessionStorage.removeItem("bday-preview");
    else if (q !== null) sessionStorage.setItem("bday-preview", "1");
    if (previewing()) return true;
  } catch {}
  // An unreadable birthday should not lock her out of her own present.
  return isNaN(OPENS.getTime()) || Date.now() >= OPENS.getTime();
}

function previewing() {
  try { return sessionStorage.getItem("bday-preview") === "1"; } catch { return false; }
}

// Preview used to be invisible, which made an unlocked tab look like a broken
// lock. Say so on the page, and give it an off switch.
function previewBanner() {
  if (!previewing() || document.querySelector(".preview-flag")) return;
  const b = document.createElement("div");
  b.className = "preview-flag";
  b.innerHTML = 'Preview mode — the gates are forced open. '
              + 'She will not see this. <a href="?preview=0">turn it off</a>';
  document.body.prepend(b);
}

/* --- progress (survives a phone restart, degrades quietly) --- */
const KEY = "bday-progress-v2";   // v2: the running order changed under old saves

const Prog = {
  get() {
    try { return parseInt(localStorage.getItem(KEY) || "0", 10) || 0; }
    catch { return window.__prog || 0; }
  },
  set(n) {
    if (n <= this.get()) return;
    try { localStorage.setItem(KEY, String(n)); }
    catch { window.__prog = n; }
  },
  reset() {
    try { localStorage.removeItem(KEY); } catch {}
    window.__prog = 0;
  },
  // Send people back if they skip ahead by typing a URL, or if they turn up
  // early. Returns false when it is sending the page somewhere else, so the
  // caller can stop rather than carry on running against a dead page.
  guard(needs = currentIndex()) {
    if (!unlocked()) { location.replace("index.html"); return false; }
    const at = this.get();
    if (at >= GATES.length) return true;   // finished everything; let her wander
    if (at < needs) { location.replace(GATES[at].href); return false; }
    return true;
  }
};

/* --- bunting nav: one flag per gate --- */
function buildNav(current) {
  const el = document.getElementById("flags");
  if (!el) return;
  const done = Prog.get();
  el.innerHTML = GATES.map((g, i) => {
    const state = i < done ? "done" : i === current ? "here" : "locked";
    const mark  = i < done ? "\u2713" : i === current ? "\u25CF" : "\u25CB";
    const inner = `<span class="flag ${state}"><b>${i + 1}</b>${mark}</span>`;
    return state === "locked" ? inner : `<a href="${g.href}">${inner}</a>`;
  }).join("");
}

/* --- cassette player: floats on every page, resumes where it left off --- */
function buildCassette() {
  const wrap = document.createElement("div");
  wrap.className = "cassette";
  wrap.innerHTML = `
    <div class="tape">
      <span class="reel"></span><span class="tape-label">${CONFIG.name}'s mix</span><span class="reel"></span>
    </div>
    <button class="tape-btn" aria-label="Play music">&#9654;</button>`;
  document.body.appendChild(wrap);

  const audio = new Audio(CONFIG.song);
  audio.loop = true;
  const btn = wrap.querySelector(".tape-btn");

  try { audio.currentTime = parseFloat(sessionStorage.getItem("bday-time") || "0"); } catch {}
  setInterval(() => {
    if (!audio.paused) { try { sessionStorage.setItem("bday-time", audio.currentTime); } catch {} }
  }, 1000);

  const paint = () => {
    const on = !audio.paused;
    wrap.classList.toggle("playing", on);
    btn.innerHTML = on ? "&#10073;&#10073;" : "&#9654;";
    btn.setAttribute("aria-label", on ? "Pause music" : "Play music");
  };
  btn.onclick = () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); setTimeout(paint, 50); };
  audio.onplay = paint; audio.onpause = paint;

  // If she already pressed play once this session, keep it going across pages.
  let wanted = false;
  try { wanted = sessionStorage.getItem("bday-playing") === "1"; } catch {}
  btn.addEventListener("click", () => {
    try { sessionStorage.setItem("bday-playing", audio.paused ? "0" : "1"); } catch {}
  });
  if (wanted) audio.play().catch(() => {});
  paint();
  return audio;
}

/* --- confetti: one burst, then it cleans up after itself --- */
function confetti(count = 90) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "confetti";
  document.body.appendChild(c);
  const ctx = c.getContext("2d");
  const size = () => { c.width = innerWidth; c.height = innerHeight; };
  size(); addEventListener("resize", size);

  const colors = ["#FF5FA2", "#FFD93D", "#6FE3C1", "#7B5BFF"];
  const bits = Array.from({ length: count }, () => ({
    x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5,
    r: 4 + Math.random() * 6, vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2,
    rot: Math.random() * 6, vr: -0.1 + Math.random() * 0.2,
    col: colors[(Math.random() * 4) | 0]
  }));

  let frames = 0;
  (function loop() {
    ctx.clearRect(0, 0, c.width, c.height);
    bits.forEach(b => {
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
      ctx.fillStyle = b.col; ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * 1.4);
      ctx.restore();
    });
    if (++frames < 260) requestAnimationFrame(loop); else c.remove();
  })();
}

/* --- last resort, for whoever is genuinely stuck ---
   Counts idle time, not elapsed time. Call bump() whenever she gets somewhere
   and the clock starts again, so the way out only appears if she has actually
   stalled - it used to turn up mid-game while she was doing fine. */
function mercy(seconds, onRelease) {
  const host = document.getElementById("status") || document.querySelector(".hint");
  if (!host) return { bump() {}, stop() {} };

  let timer = null, btn = null;

  const show = () => {
    if (btn) return;
    btn = document.createElement("button");
    btn.className = "give-up";
    btn.textContent = "Fine, let you through";
    btn.onclick = () => { btn.remove(); btn = null; onRelease(); };
    host.after(btn);
  };

  const bump = () => {                 // she got somewhere; put it away again
    clearTimeout(timer);
    if (btn) { btn.remove(); btn = null; }
    timer = setTimeout(show, seconds * 1000);
  };

  bump();
  return { bump, stop() { clearTimeout(timer); if (btn) { btn.remove(); btn = null; } } };
}

/* --- called when a gate is beaten --- */
function clearGate(index, message) {
  // Pages don't name their own number; let them just pass the message.
  if (typeof index === "string") { message = index; index = currentIndex(); }

  Prog.set(index + 1);
  confetti();
  const bar = document.getElementById("cleared");
  if (!bar) return;

  const next = GATES[index + 1];
  bar.querySelector(".cleared-text").textContent = message;
  const link = bar.querySelector("a");
  link.href = next.href;
  link.textContent = index + 2 === GATES.length ? "Open the wall" : "Next gate";
  bar.hidden = false;
  bar.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* --- boot --- */
function start(currentGate = currentIndex()) {
  previewBanner();
  buildNav(currentGate);

  // "Gate 3 of 8", counted from GATES so nothing needs editing by hand.
  const eyebrow = document.querySelector(".eyebrow");
  if (eyebrow && currentGate >= 0) {
    const suffix = eyebrow.dataset.eyebrowSuffix;
    eyebrow.textContent = `Gate ${currentGate + 1} of ${GATES.length}`
      + (suffix ? " " + suffix : "");
  }

  buildCassette();
}
