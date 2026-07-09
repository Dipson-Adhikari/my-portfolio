

const EMAILJS_PUBLIC_KEY  = 'qUtnY6KaG_46JKwyD';
const EMAILJS_SERVICE_ID  = 'service_zenith';
const EMAILJS_TEMPLATE_ID = 'template_55wrrjq';

emailjs.init('qUtnY6KaG_46JKwyD');

//Theme
const root = document.documentElement;
root.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

document.getElementById('themeToggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

//hamburger
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
//active nav link
const navLinks = document.querySelectorAll('.nav-link');

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' }).observe
  && (() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting)
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(s => obs.observe(s));
  })();

//cursor glow
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top  = e.clientY + 'px';
});

//particle 
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
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  particles.forEach(p => {
    p.x += p.dx; p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = accent + Math.round(p.o * 255).toString(16).padStart(2, '0');
    ctx.fill();
  });
  requestAnimationFrame(drawParticles);
}

initParticles();
drawParticles();
window.addEventListener('resize', initParticles);

//scroll reveal
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.sp, .sk').forEach(el => revealObs.observe(el));
//stat count up
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.count, 10);
    const start  = Date.now();
    const tick   = () => {
      const p     = Math.min((Date.now() - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + '+';
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + '+';
    };
    requestAnimationFrame(tick);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });


const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.count, 10);
    const start  = Date.now();
    const tick   = () => {
      const p     = Math.min((Date.now() - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + '+';
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + '+';
    };
    requestAnimationFrame(tick);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-count]').forEach(el => statObs.observe(el));

//contact form
async function handleSend() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const msg      = document.getElementById('msg').value.trim();
  const feedback = document.getElementById('feedback');
  const sendBtn  = document.getElementById('sendBtn');
  const btnText  = document.getElementById('btn-text');
  const spinner  = document.getElementById('btn-spinner');

  // hide old feedback
  feedback.style.display = 'none';
  feedback.className = 'feedback';

  // validate
  if (!name || !email || !msg) {
    showFeedback(feedback, 'error', '⚠ Please fill in all fields.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFeedback(feedback, 'error', '⚠ Please enter a valid email address.');
    return;
  }

  // loading state
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
  el.className      = `feedback ${type}`;
  el.textContent    = text;
  el.style.display  = 'block';
}
//loader
setTimeout(() => {
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
}, 2000);
