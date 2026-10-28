/* ==========================================================================
   Horizon Designs — Main orchestrator
   Boots every module, runs the preloader choreography, lazily loads the
   Three.js hero, and guarantees the page becomes fully usable even if
   something in here throws.
   ========================================================================== */

import { BRAND, prefersReducedMotion } from './config.js';
import { initReveals, revealHero, initHeroParallax, destroyReveals } from './animations.js';
import { initNavigation } from './navigation.js';
import { initProjectTilt } from './projects.js';
import { initContactForm } from './contact.js';

/* The inline head watchdog watches for this flag — set it first. */
window.__hdBooted = true;

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/* --------------------------------------------------------------------------
   Emergency path: make every piece of content visible if init fails.
   -------------------------------------------------------------------------- */
function emergencyShow() {
  try {
    document.querySelectorAll('[data-reveal], .process').forEach((el) => {
      el.classList.add('is-visible');
    });
    const hero = document.querySelector('.hero');
    if (hero) hero.classList.add('is-revealed');
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('is-done', 'is-removed');
    document.body.style.overflow = '';
  } catch {
    /* last resort — the no-js CSS remains the ultimate fallback */
  }
}

/* --------------------------------------------------------------------------
   Preloader: brief brand reveal, never blocks the page.
   Hides on window load (min 480ms brand beat) or 1.6s absolute cap.
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) {
    revealHero();
    return;
  }

  const startedAt = performance.now();
  let done = false;

  const hide = (instant = false) => {
    if (done) return;
    done = true;
    const wait =
      instant || prefersReducedMotion()
        ? 0
        : Math.max(0, 480 - (performance.now() - startedAt));

    window.setTimeout(() => {
      preloader.classList.add('is-done');
      window.setTimeout(revealHero, 140); // hero lines rise as the curtain lifts
      window.setTimeout(() => preloader.classList.add('is-removed'), 840);
    }, wait);
  };

  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', () => hide(), { once: true });

  // Absolute cap: never hold the visitor longer than 1.6s
  window.setTimeout(() => hide(true), 1600);
}

/* --------------------------------------------------------------------------
   Lazy-load the 3D hero after first paint (idle callback when available).
   -------------------------------------------------------------------------- */
function loadHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  import('./hero-3d.js')
    .then((module) => {
      if (typeof module.initHero3D === 'function') module.initHero3D();
    })
    .catch((error) => {
      // Dependency missing or WebGL unavailable → CSS sculpture fallback
      console.warn('[Horizon] 3D hero unavailable, using CSS fallback.', error);
      document.body.classList.add('webgl-failed');
    });
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
function boot() {
  initPreloader();

  try {
    initNavigation();
  } catch (error) {
    console.error('[Horizon] navigation failed:', error);
  }

  try {
    initReveals(document);
    initHeroParallax();
  } catch (error) {
    console.error('[Horizon] animations failed:', error);
    emergencyShow();
  }

  try {
    initProjectTilt();
  } catch (error) {
    console.error('[Horizon] tilt failed:', error);
  }

  try {
    initContactForm();
  } catch (error) {
    console.error('[Horizon] contact form failed:', error);
  }

  /* 3D is enhancement-only: page is already fully usable without it */
  const idle =
    'requestIdleCallback' in window
      ? (cb) => window.requestIdleCallback(cb, { timeout: 2400 })
      : (cb) => window.setTimeout(cb, 500);
  idle(loadHero3D);

  /* Belt & braces: if the preloader is somehow still up, force it away */
  window.setTimeout(() => {
    const pre = document.getElementById('preloader');
    if (pre && !pre.classList.contains('is-removed')) {
      pre.classList.add('is-done', 'is-removed');
    }
  }, 4200);
}

try {
  boot();
} catch (error) {
  console.error('[Horizon] boot failed:', error);
  emergencyShow();
}

/* Cleanup on page exit (bfcache-safe) */
window.addEventListener(
  'pagehide',
  () => {
    destroyReveals();
    document.body.style.overflow = '';
  },
  { once: true }
);

/* Expose brand for debugging (no secrets in here — public info only) */
window.HORIZON = { BRAND };
