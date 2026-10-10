/* ═══════════════ CONFIG ═══════════════ */
const EMAILJS_PUBLIC_KEY  = 'qUtnY6KaG_46JKwyD';
const EMAILJS_SERVICE_ID  = 'service_zenith';
const EMAILJS_TEMPLATE_ID = 'template_55wrrjq';

if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══════════════ THEME ═══════════════ */
const root = document.documentElement;
root.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ═══════════════ GAME LOADER ═══════════════ */
(function gameLoader() {
  const loader   = document.getElementById('loader');
  if (!loader) { document.body.classList.remove('loading'); document.body.classList.add('ready'); return; }

  const SEGMENTS = 24;
  const segWrap  = document.getElementById('ldSegments');
  const track    = document.getElementById('ldTrack');
  const percent  = document.getElementById('ldPercent');
  const tipEl    = document.getElementById('ldTip');
  const startBtn = document.getElementById('ldStart');
  const hint     = document.getElementById('ldHint');
  const canvas   = document.getElementById('star-canvas');
  const ctx      = canvas.getContext('2d');

  const TIPS = [
    'Booting up…',
    'Loading pixels…',
    'Aligning flexbox…',
    'Spawning components…',
    'Brewing coffee…',
    'Compiling creativity…',
    'Polishing the UI…',
    'Almost there…',
  ];

  /* segments */
  const segs = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const s = document.createElement('i');
    segWrap.appendChild(s);
    segs.push(s);
  }

  /* ── starfield (side-scroller feel) ── */
  let stars = [], raf = 0, W = 0, H = 0;
  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round(W / 9) }, () => {
      const layer = Math.random();
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        s: layer < .6 ? 2 : layer < .9 ? 3 : 4,
        v: layer < .6 ? .4 : layer < .9 ? 1.1 : 2.2,
        c: Math.random() < .2 ? '#d21319' : Math.random() < .55 ? '#afaea2' : '#ecebe4',
      };
    });
  }
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    for (const st of stars) {
      st.x -= st.v * (running ? 1 : .35);
      if (st.x < -4) { st.x = W + 4; st.y = Math.random() * H; }
      ctx.globalAlpha = .35 + st.v / 4;
      ctx.fillStyle = st.c;
      ctx.fillRect(Math.round(st.x), Math.round(st.y), st.s, st.s);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(drawStars);
  }
  let running = true;
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  if (!reduceMotion) drawStars();

  /* ── tiny chiptune blips ── */
  let audio;
  function blip(freqs, dur = .09) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      let t = audio.currentTime;
      freqs.forEach(f => {
        const o = audio.createOscillator();
        const g = audio.createGain();
        o.type = 'square';
        o.frequency.value = f;
        g.gain.setValueAtTime(.05, t);
        g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(audio.destination);
        o.start(t); o.stop(t + dur);
        t += dur * .9;
      });
    } catch (_) { /* audio unavailable */ }
  }

  /* ── progress ── */
  let progress = 0, shown = 0, pageLoaded = document.readyState === 'complete', ready = false;
  window.addEventListener('load', () => { pageLoaded = true; });

  function render(p) {
    const lit = Math.floor(p / 100 * SEGMENTS);
    segs.forEach((s, i) => {
      const on = i < lit;
      if (on && !s.classList.contains('on')) { s.classList.add('on', 'pop'); }
      else if (!on) s.classList.remove('on', 'pop');
    });
    track.style.setProperty('--p', p);
    percent.textContent = String(Math.floor(p)).padStart(3, '0') + '%';
    tipEl.textContent = TIPS[Math.min(TIPS.length - 1, Math.floor(p / 100 * TIPS.length))];
  }

  function step() {
    // hold at 92% until the page has actually finished loading
    const cap = pageLoaded ? 100 : 92;
    progress = Math.min(cap, progress + 1 + Math.random() * 5);
    if (progress >= 100) { render(100); return finish(); }
    render(progress);
    setTimeout(step, 45 + Math.random() * 95);
  }

  function finish() {
    ready = true;
    loader.classList.add('is-ready');
    tipEl.textContent = 'WORLD LOADED!';
    blip([523, 659, 784, 1047], .1);
    startBtn.hidden = false;
    hint.hidden = false;
    startBtn.focus({ preventScroll: true });
    if (reduceMotion) start();
  }

  /* ── start / exit ── */
  let started = false;
  function start() {
    if (started || !ready) return;
    started = true;
    blip([784, 1047, 1319], .08);
    loader.classList.add('is-exit');

    setTimeout(() => {
      loader.classList.add('is-open');
      document.body.classList.remove('loading');
      document.body.classList.add('ready');
    }, 380);

    setTimeout(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sizeCanvas);
      loader.remove();
    }, 1250);
  }

  startBtn.addEventListener('click', start);
  document.addEventListener('keydown', start);
  loader.addEventListener('pointerdown', start);

  // kick off after the intro text has dropped in
  setTimeout(step, 900);
})();

/* ═══════════════ NAV / DRAWER ═══════════════ */
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('navDrawer');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navDrawer.classList.toggle('open');
});
function closeDrawer() {
  hamburger.classList.remove('open');
  navDrawer.classList.remove('open');
}
document.addEventListener('click', e => {
  if (!hamburger.contains(e.target) && !navDrawer.contains(e.target)) closeDrawer();
});

/* active nav link */
const navLinks = document.querySelectorAll('.nav-link');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('section[id]').forEach(s => sectionObs.observe(s));

/* scroll XP bar */
const xpBar = document.getElementById('xp-bar');
function updateXp() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  xpBar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
}
window.addEventListener('scroll', updateXp, { passive: true });
updateXp();

/* cursor glow */
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

/* ═══════════════ HERO PARTICLES ═══════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];

function initParticles() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  particles = Array.from({ length: 40 }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    r:  Math.random() * 2 + 1,
    dx: (Math.random() - .5) * .4,
    dy: (Math.random() - .5) * .4,
    o:  Math.random() * .35 + .1,
    s:  Math.random() < .5,          // true = stone, false = crimson
  }));
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cs     = getComputedStyle(document.documentElement);
  const accent = cs.getPropertyValue('--accent').trim();
  const stone  = cs.getPropertyValue('--stone').trim();
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = (p.s ? stone : accent) + Math.round(p.o * 255).toString(16).padStart(2, '0');
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}
initParticles();
drawParticles();
window.addEventListener('resize', initParticles);

/* ═══════════════ SCROLL REVEAL ═══════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.sp, .sk').forEach(el => revealObs.observe(el));

/* ═══════════════ STAT COUNT-UP ═══════════════ */
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.count, 10);
    const start  = Date.now();
    const tick = () => {
      const p     = Math.min((Date.now() - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + '+';
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-count]').forEach(el => statObs.observe(el));

/* ═══════════════ CONTACT FORM ═══════════════ */
async function handleSend() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const msg      = document.getElementById('msg').value.trim();
  const feedback = document.getElementById('feedback');
  const sendBtn  = document.getElementById('sendBtn');
  const btnText  = document.getElementById('btn-text');
  const spinner  = document.getElementById('btn-spinner');

  feedback.style.display = 'none';
  feedback.className = 'feedback';

  if (!name || !email || !msg) {
    return showFeedback(feedback, 'error', '⚠ Please fill in all fields.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showFeedback(feedback, 'error', '⚠ Please enter a valid email address.');
  }

  sendBtn.disabled      = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:  name,
      from_email: email,
      message:    msg,
      name:       name,
      email:      email,
      to_name:    'Dipson',
    });

    showFeedback(feedback, 'success', `✓ Message sent, ${name}! I'll be in touch soon.`);
    document.getElementById('name').value  = '';
    document.getElementById('email').value = '';
    document.getElementById('msg').value   = '';
    setTimeout(() => { feedback.style.display = 'none'; }, 6000);
  } catch (err) {
    console.error(err);
    showFeedback(feedback, 'error', '⚠ Something went wrong. Please email me directly.');
  } finally {
    sendBtn.disabled      = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

function showFeedback(el, type, text) {
  el.className     = `feedback ${type}`;
  el.textContent   = text;
  el.style.display = 'block';
}