/* ==========================================================================
   Horizon Designs — Navigation
   Scroll-aware header, accessible mobile menu with focus management,
   year stamp, back-to-top. The active page link is marked statically in
   each page's markup (class "is-active" + aria-current="page").
   ========================================================================== */

export function initNavigation() {
  const header = document.getElementById('site-header');
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');
  const yearEl = document.getElementById('year');

  /* --- Auto-generated copyright year ------------------------------------- */
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Header background after scrolling --------------------------------- */
  let headerTicking = false;
  const updateHeader = () => {
    headerTicking = false;
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  const onScroll = () => {
    if (!headerTicking) {
      headerTicking = true;
      requestAnimationFrame(updateHeader);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  updateHeader();

  /* --- Active page highlighting: handled statically in markup ------------- */

  /* --- Mobile menu -------------------------------------------------------- */
  let removeMenuMq = null;
  if (toggle && menu) {
    let menuOpen = false;
    let lastFocused = null;

    const focusableSelector =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const openMenu = () => {
      menuOpen = true;
      lastFocused = document.activeElement;
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
      // Move focus into the menu for keyboard/screen-reader users
      const first = menu.querySelector(focusableSelector);
      if (first) first.focus({ preventScroll: true });
      document.addEventListener('keydown', onKeydown, true);
    };

    const closeMenu = (restoreFocus = true) => {
      menuOpen = false;
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown, true);
      if (restoreFocus) {
        const target = lastFocused && lastFocused !== document.body ? lastFocused : toggle;
        target.focus({ preventScroll: true });
      }
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      // Focus trap while the overlay is open
      const focusables = Array.from(menu.querySelectorAll(focusableSelector)).filter(
        (el) => el.offsetParent !== null
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    toggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

    // Close when a menu link is chosen (smooth scroll happens natively)
    menu.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link) closeMenu(false);
    });

    // Re-entering desktop widths must never leave the overlay stuck open
    const mq = window.matchMedia('(min-width: 901px)');
    const onMq = (event) => {
      if (event.matches && menuOpen) closeMenu(false);
    };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);

    removeMenuMq = () => {
      mq.removeEventListener ? mq.removeEventListener('change', onMq) : mq.removeListener(onMq);
    };
  }

  /* --- Cleanup ------------------------------------------------------------- */
  const cleanup = () => {
    window.removeEventListener('scroll', onScroll);
    if (removeMenuMq) removeMenuMq();
    document.body.style.overflow = '';
  };
  window.addEventListener('pagehide', cleanup, { once: true });
}
