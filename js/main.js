// Drag-to-scroll for the "swipe" carousels (touch already scrolls natively).
document.querySelectorAll('.carousel').forEach((el) => {
  let down = false, startX = 0, startScroll = 0, moved = false;

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false;
    startX = e.clientX; startScroll = el.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) { moved = true; el.classList.add('dragging'); }
    el.scrollLeft = startScroll - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    el.classList.remove('dragging');
  });
  el.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);
});

// Only play videos while they are on screen (saves data and battery).
const vids = document.querySelectorAll('video[autoplay]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { rootMargin: '200px' });
  vids.forEach((v) => { v.removeAttribute('autoplay'); v.pause(); io.observe(v); });
}

// Slow auto-scroll for carousels marked data-autoscroll.
// Loops seamlessly, pauses while someone drags/touches it, resumes after a few seconds.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.carousel[data-autoscroll]').forEach((el) => {
  if (reduceMotion) return;
  const SPEED = 35; // pixels per second
  // Duplicate the slides so the loop has no visible jump.
  Array.from(el.children).forEach((c) => {
    const clone = c.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.alt = '';
    el.appendChild(clone);
  });
  el.classList.add('auto');

  let pos = el.scrollLeft, last = null, paused = false, resumeTimer = null, visible = false;
  const loopWidth = () => el.scrollWidth / 2;

  const pause = () => { paused = true; clearTimeout(resumeTimer); };
  const resumeLater = (ms = 2500) => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { pos = el.scrollLeft; paused = false; }, ms);
  };
  // Pause only when someone actually interacts (drag, touch, horizontal scroll),
  // not when the mouse just rests on it while scrolling the page.
  el.addEventListener('pointerdown', pause);
  window.addEventListener('pointerup', () => { if (paused) resumeLater(); });
  el.addEventListener('touchstart', pause, { passive: true });
  el.addEventListener('touchend', () => resumeLater(), { passive: true });
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { pause(); resumeLater(); }
  }, { passive: true });
  // Keep manual scrolling inside the loop too.
  el.addEventListener('scroll', () => {
    if (!paused) return;
    const w = loopWidth();
    if (el.scrollLeft >= w) el.scrollLeft -= w;
  }, { passive: true });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);

  const step = (t) => {
    if (last !== null && !paused && visible) {
      pos += SPEED * (t - last) / 1000;
      const w = loopWidth();
      if (pos >= w) pos -= w;
      el.scrollLeft = pos;
    }
    last = t;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
});
