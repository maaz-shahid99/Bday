/* ==========================================================
   EDIT THIS BLOCK ONLY. Everything below it just works.
   ========================================================== */
const CONFIG = {
  name: "Sharmistha",
  birthday: "2026-08-19T00:00:00",   // next birthday, local time
  song: "assets/song.mp3",           // drop your mp3 here

  photos: [
    { src: "assets/p1.jpg", caption: "2019. The haircut era." },
    { src: "assets/p2.jpg", caption: "Cried at a dog advert." },
    { src: "assets/p3.jpg", caption: "Peak form, allegedly." }
  ],

  notes: [
    { text: "You still owe me \u20B9400 from 2021. Happy birthday.", from: "Arjun" },
    { text: "Best friend a person could rent. Love you.",           from: "Meera" },
    { text: "Happy bday!! Sorry about the cake thing.",             from: "Dev"   },
    { text: "Thirteen years. Not one boring day.",                  from: "Sana"  }
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
  // ?preview on any page opens the gates early so this can be checked before
  // the day. It sticks for the tab, so the whole site can be walked through.
  try {
    if (location.search.indexOf("preview") > -1) sessionStorage.setItem("bday-preview", "1");
    if (sessionStorage.getItem("bday-preview") === "1") return true;
  } catch {}
  // An unreadable birthday should not lock her out of her own present.
  return isNaN(OPENS.getTime()) || Date.now() >= OPENS.getTime();
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

/* --- the games all fold. this is the last resort, for whoever just sits there --- */
function mercy(seconds, onRelease) {
  const host = document.getElementById("status") || document.querySelector(".hint");
  if (!host) return () => {};

  const timer = setTimeout(() => {
    const b = document.createElement("button");
    b.className = "give-up";
    b.textContent = "Fine, let you through";
    b.onclick = () => { b.remove(); onRelease(); };
    host.after(b);
  }, seconds * 1000);

  return () => clearTimeout(timer);   // call this once she actually wins
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
