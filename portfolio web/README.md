# Horizon Designs — Portfolio Website

The production website for **Horizon Designs**, the independent digital creative
studio of **Vishal**. Tagline: *Beyond websites. Into experiences.*

A multi-page, hand-built static site — semantic HTML5, modern CSS and vanilla
JavaScript ES modules. No framework, no build step, no backend. Three.js powers
the homepage hero sculpture and is loaded lazily with a CSS 3D fallback.

---

## Pages (10)

| Page | File | What it holds |
|---|---|---|
| Home | `index.html` | Preloader, cinematic 3D hero, capability marquee, selected-work teaser, CTA |
| Work | `work.html` | Full project showcase (large alternating rows) + case-study index |
| Services | `services.html` | The five capabilities in detail |
| About | `about.html` | Studio story, design philosophy, founder panel |
| Process | `process.html` | The four-step process (discover → design → develop → launch) |
| Contact | `contact.html` | Inquiry form + direct email/Instagram channels |
| Case studies | `projects/royal-clinic-connect.html`, `projects/dhruva-infra.html`, `projects/fairdeal-agencies.html`, `projects/star-electronics.html` | One page per live project |

Every interior page carries the same header, footer and closing CTA band; the
preloader and Three.js hero are homepage-only.

## Project data

The four featured projects are real, deployed websites — all URLs verified:

1. **Royal Clinic Connect** — https://royal-clinic-connect.lovable.app/
2. **Dhruva Infra and Energy Solutions** — https://vermillion-crepe-007be0.netlify.app/
   > Note: this project was originally titled "Vermillion Crepe" (the Netlify
   > subdomain still reflects the old name). The hosting account was redeployed
   > with the current live site, so the case study file is
   > `projects/dhruva-infra.html`.
3. **Fairdeal Agencies** — https://fairdeal-agencies.ai.studio/
4. **Star Electronics** — https://gamerzdeadshot52-beep.github.io/Star-electronics-4/

Project screenshots in `assets/images/` are genuine browser captures of these
live sites. No fabricated testimonials, awards, phone numbers or results appear
anywhere on the site.

## Contact & forms

There is no backend. The inquiry form on `contact.html` validates input, then
composes a fully populated `mailto:` draft in the visitor's own email app —
it never pretends to "send" anything. A copy-to-clipboard fallback appears if
the mail client doesn't open. Spam protection is a honeypot field plus a
minimum-completion-time trap.

Direct channels: **gamerzdeadshot52@gmail.com** · Instagram
**https://www.instagram.com/horizon___designs/**

## Running locally

Any static file server works. A ready-made PowerShell server is included:

```powershell
pwsh -File tools/serve.ps1     # serves the folder root on http://localhost:8080
```

Then open http://localhost:8080/

## File structure

```
├── index.html                 # Home (3D hero)
├── work.html                  # Work — full showcase + case-study index
├── services.html              # Services
├── about.html                 # About
├── process.html               # Process
├── contact.html               # Contact + inquiry form
├── projects/                  # Four case-study pages
├── css/                       # variables, reset, typography, layout,
│                              # components, animations, responsive
├── js/                        # main, config, navigation, animations,
│                              # projects, contact, hero-3d
├── assets/
│   ├── fonts/                 # Self-hosted Space Grotesk + Manrope (woff2)
│   ├── icons/favicon.svg
│   ├── images/                # Real project screenshots (webp)
│   └── vendor/                # three.module.min.js + RoomEnvironment (MIT)
├── tools/                     # Dev-only helpers (excluded via robots.txt)
│   ├── serve.ps1              # local static server
│   ├── responsive-probe.html  # multi-width overflow test harness
│   ├── shot.html              # true-mobile-width capture harness (390px iframe)
│   ├── og-card.html           # OG image generator (screenshot → og-cover.png)
│   ├── get-fonts.ps1          # font downloader (already run)
│   └── get-vendor.ps1         # three.js downloader (already run)
├── robots.txt
├── sitemap.xml
└── README.md
```

## Configuration sync

`js/config.js` is the single source of truth for brand details, colors, fonts
and project data. The HTML mirrors this data statically so the site works
without JavaScript — **keep both in sync when editing**. Navigation links are
real pages; the active page is marked in markup with `class="is-active"` +
`aria-current="page"`.

## Deploying

This is a plain static site — deploy the folder as-is to Netlify, GitHub Pages,
Vercel, Cloudflare Pages or any static host. Before going live:

1. Replace `https://your-domain.com` in `sitemap.xml` with the production domain.
2. Add `<link rel="canonical">` to each page (comments mark the spot in `<head>`).
3. Add absolute `og:url` values once the domain is known (OG images are currently
   relative paths).
4. `assets/images/og-cover.png` (1200×630 social-sharing image) is already
   generated. To regenerate it after copy changes, screenshot
   `tools/og-card.html` at 1200×630 — headless Chrome works well:
   `chrome --headless=new --window-size=1200,630 --virtual-time-budget=8000
   --screenshot=og-cover.png http://localhost:8080/tools/og-card.html`

## Accessibility & performance notes

- Skip link, landmarks, single H1 per page, labelled form fields, `aria-live`
  form status, focus-managed mobile menu (ESC closes, focus returns).
- `prefers-reduced-motion` respected everywhere; content never depends on JS
  (a `no-js` fallback shows everything, with a 4s watchdog that reverts if the
  bundle fails to boot).
- Self-hosted variable fonts preloaded; images are WebP with explicit
  dimensions; Three.js is lazy-loaded after first paint.
- Verified viewports: 360 / 390 / 768 / 1024 / 1440 / 1920 — no horizontal
  overflow (`tools/responsive-probe.html`).

## Credits

- Type: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) &
  [Manrope](https://fonts.google.com/specimen/Manrope) (SIL Open Font License),
  self-hosted.
- 3D: [Three.js](https://threejs.org) (MIT License), vendored in
  `assets/vendor/`.
- Everything else built by Horizon Designs.
