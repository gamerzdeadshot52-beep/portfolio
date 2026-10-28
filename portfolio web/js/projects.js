/* ==========================================================================
   Horizon Designs — Project cards
   Restrained pointer-driven perspective tilt. Desktop / fine-pointer only,
   disabled for touch devices and reduced motion, fully cleaned up on exit.
   ========================================================================== */

import { prefersReducedMotion, isFinePointer } from './config.js';

export function initProjectTilt() {
  if (prefersReducedMotion() || !isFinePointer()) return () => {};

  const cards = Array.from(document.querySelectorAll('[data-tilt]'));
  if (!cards.length) return () => {};

  const MAX_DEG = 4.2; // restraint: enough depth, never gimmicky
  const cleanups = [];

  cards.forEach((card) => {
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let active = false;

    const apply = () => {
      raf = 0;
      // eased follow for a soft, physical feel
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      card.style.setProperty('--rx', `${-currentY * MAX_DEG}deg`);
      card.style.setProperty('--ry', `${currentX * MAX_DEG}deg`);
      if (
        active ||
        Math.abs(targetX - currentX) > 0.001 ||
        Math.abs(targetY - currentY) > 0.001
      ) {
        raf = requestAnimationFrame(apply);
      }
    };

    const onMove = (event) => {
      const rect = card.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      if (!active) {
        active = true;
        card.style.willChange = 'transform';
      }
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      active = false;
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(apply);
      // stop the loop once settled
      setTimeout(() => {
        if (!active && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          card.style.removeProperty('--rx');
          card.style.removeProperty('--ry');
          card.style.removeProperty('will-change');
        }
      }, 700);
    };

    card.addEventListener('pointerenter', (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
    });
    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', onLeave, { passive: true });

    cleanups.push(() => {
      if (raf) cancelAnimationFrame(raf);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
      card.style.removeProperty('will-change');
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
