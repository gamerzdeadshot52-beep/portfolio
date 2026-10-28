/* ==========================================================================
   Horizon Designs — Animation utilities
   Reusable, self-cleaning scroll reveals + hero entrance choreography.
   Policy: opacity/transform only, IntersectionObserver, reduced-motion safe,
   everything stays accessible if observers never fire.
   ========================================================================== */

import { prefersReducedMotion } from './config.js';

const observers = new Set();

/**
 * Mark an element as revealed (adds .is-visible / .is-revealed).
 */
export function revealNow(el) {
  if (!el) return;
  if (el.classList.contains('hero')) el.classList.add('is-revealed');
  el.classList.add('is-visible');
}

/**
 * Observe all [data-reveal] elements in a root and reveal them on scroll.
 * Reveals immediately when IntersectionObserver is unavailable or the user
 * prefers reduced motion.
 */
export function initReveals(root = document) {
  const targets = Array.from(root.querySelectorAll('[data-reveal], .process'));
  if (!targets.length) return () => {};

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    targets.forEach(revealNow);
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          io.unobserve(entry.target); // one-shot: keep it cheap
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );

  targets.forEach((el) => io.observe(el));
  observers.add(io);

  return () => {
    io.disconnect();
    observers.delete(io);
  };
}

/**
 * Kick off the hero entrance once the preloader curtain starts lifting.
 */
export function revealHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // Double rAF so the transition reliably plays after paint.
  requestAnimationFrame(() => requestAnimationFrame(() => revealNow(hero)));
}

/**
 * Subtle hero parallax + fade on scroll (transform/opacity only, rAF-throttled).
 * Disabled for reduced motion and on coarse pointers.
 */
export function initHeroParallax() {
  if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) {
    return () => {};
  }

  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero__copy');
  const visual = document.querySelector('.hero__visual');
  if (!hero || !copy) return () => {};

  let ticking = false;
  let stopped = false;

  const update = () => {
    ticking = false;
    if (stopped) return;
    const rect = hero.getBoundingClientRect();
    const h = rect.height || 1;
    // progress: 0 at top, 1 when hero has fully scrolled past
    const progress = Math.min(1, Math.max(0, -rect.top / h));
    if (rect.bottom <= 0) return;
    copy.style.transform = `translate3d(0, ${progress * -46}px, 0)`;
    copy.style.opacity = String(1 - progress * 1.15);
    if (visual) visual.style.transform = `translate3d(0, ${progress * -78}px, 0)`;
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  return () => {
    stopped = true;
    window.removeEventListener('scroll', onScroll);
    if (copy) {
      copy.style.transform = '';
      copy.style.opacity = '';
    }
    if (visual) visual.style.transform = '';
  };
}

/** Disconnect every observer this module created (pagehide cleanup). */
export function destroyReveals() {
  observers.forEach((io) => io.disconnect());
  observers.clear();
}
