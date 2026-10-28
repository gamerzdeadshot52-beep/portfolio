/* ==========================================================================
   Horizon Designs — Contact / inquiry form
   Real, honest submission path with no backend configured:
   validates input, then composes a fully populated mailto: draft in the
   visitor's own email app. Never claims a message was "sent".
   Spam protection: honeypot field + minimum-completion-time trap.
   ========================================================================== */

import { BRAND } from './config.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return () => {};

  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit');
  const loadedAt = Date.now();

  const fields = {
    name: { el: document.getElementById('f-name'), error: document.getElementById('e-name') },
    email: { el: document.getElementById('f-email'), error: document.getElementById('e-email') },
    type: { el: document.getElementById('f-type'), error: document.getElementById('e-type') },
    desc: { el: document.getElementById('f-desc'), error: document.getElementById('e-desc') },
  };

  const setStatus = (message, kind = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${kind ? ` is-${kind}` : ''}`;
  };

  const setFieldError = (field, message) => {
    const wrapper = field.el.closest('[data-field]');
    if (!wrapper) return;
    wrapper.classList.toggle('is-invalid', Boolean(message));
    field.el.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (field.error) field.error.textContent = message || '';
  };

  const validate = () => {
    let ok = true;
    let firstInvalid = null;

    const nameVal = fields.name.el.value.trim();
    if (nameVal.length < 2) {
      setFieldError(fields.name, 'Please enter your name.');
      ok = false;
      firstInvalid = firstInvalid || fields.name.el;
    } else setFieldError(fields.name, '');

    const emailVal = fields.email.el.value.trim();
    if (!emailVal) {
      setFieldError(fields.email, 'Please enter your email so I can reply.');
      ok = false;
      firstInvalid = firstInvalid || fields.email.el;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(fields.email, 'That email address doesn’t look right.');
      ok = false;
      firstInvalid = firstInvalid || fields.email.el;
    } else setFieldError(fields.email, '');

    if (!fields.type.el.value) {
      setFieldError(fields.type, 'Choose the type of project.');
      ok = false;
      firstInvalid = firstInvalid || fields.type.el;
    } else setFieldError(fields.type, '');

    const descVal = fields.desc.el.value.trim();
    if (descVal.length < 20) {
      setFieldError(
        fields.desc,
        `Please describe the project in at least 20 characters (${descVal.length} so far).`
      );
      ok = false;
      firstInvalid = firstInvalid || fields.desc.el;
    } else setFieldError(fields.desc, '');

    if (!ok && firstInvalid) firstInvalid.focus({ preventScroll: false });
    return ok;
  };

  // Clear a field's error as soon as the visitor edits it
  Object.values(fields).forEach((field) => {
    if (!field.el) return;
    const clear = () => {
      const wrapper = field.el.closest('[data-field]');
      if (wrapper && wrapper.classList.contains('is-invalid')) setFieldError(field, '');
    };
    field.el.addEventListener('input', clear);
    field.el.addEventListener('change', clear);
  });

  const buildMailto = () => {
    const name = fields.name.el.value.trim();
    const email = fields.email.el.value.trim();
    const type = fields.type.el.value;
    const budget = document.getElementById('f-budget')?.value || '';
    const timeline = document.getElementById('f-timeline')?.value || '';
    const description = fields.desc.el.value.trim();

    const subject = `Project inquiry — ${type} — ${name}`;
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${type}`,
      budget ? `Budget: ${budget}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      '',
      'Project description:',
      description,
      '',
      '— Sent from the Horizon Designs inquiry form',
    ].filter((line) => line !== null);

    return `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    // --- Spam traps ---------------------------------------------------------
    const honeypot = document.getElementById('f-website');
    if (honeypot && honeypot.value) {
      // Silent success for bots: do not open anything, do not error for humans
      setStatus('Thanks — your request is being processed.', 'success');
      return;
    }
    if (Date.now() - loadedAt < 2500) {
      setStatus('That was quick! Please take a moment to describe the project.', 'error');
      return;
    }

    if (!validate()) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      return;
    }

    const mailto = buildMailto();

    if (submitBtn) submitBtn.disabled = true;
    setStatus('Opening your email app with your project details pre-filled…', 'info');

    // Real hand-off: the visitor's mail client opens with the message ready.
    window.location.href = mailto;

    window.setTimeout(() => {
      if (submitBtn) submitBtn.disabled = false;
      setStatus(
        `If your email app didn’t open, email ${BRAND.email} directly — or use the copy button below.`,
        'info'
      );
      showCopyFallback(mailto);
    }, 1400);
  };

  /* --- Copy-to-clipboard fallback (real, verifiable action) --------------- */
  let copyWrap = null;
  const showCopyFallback = (mailto) => {
    if (copyWrap || !status || !status.parentNode) return;
    copyWrap = document.createElement('div');
    copyWrap.style.display = 'flex';
    copyWrap.style.gap = '12px';
    copyWrap.style.flexWrap = 'wrap';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn btn--ghost btn--sm';
    copyBtn.textContent = 'Copy message';

    const openBtn = document.createElement('a');
    openBtn.className = 'btn btn--ghost btn--sm';
    openBtn.href = mailto;
    openBtn.textContent = 'Open draft again';

    copyBtn.addEventListener('click', async () => {
      const bodyStart = mailto.indexOf('?body=');
      const text =
        bodyStart > -1 ? decodeURIComponent(mailto.slice(bodyStart + 6).replace(/\+/g, ' ')) : mailto;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied ✓';
        setStatus('Message copied to your clipboard — paste it into any email.', 'success');
      } catch {
        // Fallback for browsers without clipboard permission
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          copyBtn.textContent = 'Copied ✓';
          setStatus('Message copied to your clipboard — paste it into any email.', 'success');
        } catch {
          setStatus(`Copy isn’t available here — please email ${BRAND.email} directly.`, 'error');
        }
        ta.remove();
      }
    });

    copyWrap.appendChild(copyBtn);
    copyWrap.appendChild(openBtn);
    status.insertAdjacentElement('afterend', copyWrap);
  };

  form.addEventListener('submit', onSubmit);

  return () => {
    form.removeEventListener('submit', onSubmit);
    if (copyWrap) copyWrap.remove();
  };
}
