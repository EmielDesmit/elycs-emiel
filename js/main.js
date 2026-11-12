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
