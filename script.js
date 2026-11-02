const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
const orbit = document.querySelector('.faith-orbit');

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  root.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -4% 0px' });

  document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
}

let scrollFrame = 0;
const updateScrollState = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  root.style.setProperty('--scroll-progress', String(progress));
  header.classList.toggle('scrolled', window.scrollY > 24);
  scrollFrame = 0;
};

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
}, { passive: true });
updateScrollState();

if (hero && orbit && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    orbit.style.setProperty('--orbit-x', `${x * -14}px`);
    orbit.style.setProperty('--orbit-y', `${y * -14}px`);
  });
  hero.addEventListener('pointerleave', () => {
    orbit.style.setProperty('--orbit-x', '0px');
    orbit.style.setProperty('--orbit-y', '0px');
  });
}

const canvas = document.querySelector('.starfield');
const context = canvas?.getContext('2d');
if (canvas && context) {
  let stars = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  const colors = ['200,246,220', '236,218,174', '255,255,255'];

  const resizeStarfield = () => {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.min(125, Math.max(42, Math.round(width / 11)));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.35 + 0.25,
      alpha: Math.random() * 0.5 + 0.12,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.012 + 0.003,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    if (reduceMotion.matches) drawStars(0);
  };

  const drawStars = (time) => {
    context.clearRect(0, 0, width, height);
    stars.forEach((star) => {
      const shimmer = reduceMotion.matches ? 0.78 : 0.58 + Math.sin(time * star.speed + star.phase) * 0.3;
      context.beginPath();
      context.fillStyle = `rgba(${star.color},${star.alpha * shimmer})`;
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
    if (!reduceMotion.matches && !document.hidden) animationFrame = requestAnimationFrame(drawStars);
  };

  resizeStarfield();
  if (!reduceMotion.matches) animationFrame = requestAnimationFrame(drawStars);
  window.addEventListener('resize', resizeStarfield, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animationFrame);
    else if (!reduceMotion.matches) animationFrame = requestAnimationFrame(drawStars);
  });
  reduceMotion.addEventListener?.('change', () => {
    cancelAnimationFrame(animationFrame);
    if (reduceMotion.matches) drawStars(0);
    else animationFrame = requestAnimationFrame(drawStars);
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
});
