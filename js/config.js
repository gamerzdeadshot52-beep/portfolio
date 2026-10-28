/* ==========================================================================
   Horizon Designs — Centralized configuration
   Single source of truth for brand details, colors, fonts and project data.
   The homepage markup mirrors this data as static HTML so the site works
   without JavaScript; keep both in sync when editing (see README.md).
   ========================================================================== */

export const BRAND = {
  name: 'Horizon Designs',
  founder: 'Vishal',
  founderRole: 'Founder & Developer',
  tagline: 'Beyond websites. Into experiences.',
  altTagline: 'Digital experiences, designed to stand apart.',
  description:
    'Horizon Designs creates distinctive digital experiences through premium web design, modern development and thoughtful interaction.',
  email: 'gamerzdeadshot52@gmail.com',
  instagram: 'https://www.instagram.com/horizon___designs/',
  /* Availability indicator shown in the hero — flip to false to hide it. */
  availability: {
    show: true,
    label: 'Available for select projects',
  },
  colors: {
    obsidian: '#0A0A0C',
    graphite: '#151519',
    elevated: '#1D1C21',
    ivory: '#F1EDE5',
    stone: '#85838A',
    bronze: '#C6A675',
    bronzeDeep: '#35271D',
    border: 'rgba(241,237,229,0.12)',
  },
  fonts: {
    display: 'Space Grotesk',
    body: 'Manrope',
  },
};

/* Featured projects — live URLs verified at build time. */
export const PROJECTS = [
  {
    id: 'royal-clinic-connect',
    index: '01',
    title: 'Royal Clinic Connect',
    category: 'Healthcare',
    url: 'https://royal-clinic-connect.lovable.app/',
    image: 'assets/images/royal-clinic-connect.webp',
    imageAlt:
      'Screenshot of the Royal Clinic Connect website: the Royal Clinic homepage with bilingual heading and appointment buttons',
    width: 1090,
    height: 830,
    platform: 'Lovable · Vite build',
    languages: 'English · हिन्दी',
    summary:
      'A calm, trustworthy website for a medical clinic in Lucknow — bilingual headings, clearly organised medical services, and prominent appointment and contact pathways that keep patient information easy to scan.',
    designDirection:
      'Trustworthy, clean, professional healthcare presentation with soft blue tones, generous spacing and reassurance-first hierarchy.',
    caseStudy: 'projects/royal-clinic-connect.html',
  },
  {
    id: 'dhruva-infra',
    index: '02',
    title: 'Dhruva Infra and Energy Solutions',
    category: 'Energy & Infrastructure',
    url: 'https://vermillion-crepe-007be0.netlify.app/',
    image: 'assets/images/dhruva-infra.webp',
    imageAlt:
      'Screenshot of the Dhruva Infra and Energy Solutions website homepage showing a solar panel field hero image',
    width: 1090,
    height: 830,
    platform: 'Netlify · Static',
    focus: 'Solar services',
    summary:
      'A bright, confident site for a solar energy company — residential and commercial solar offerings, government subsidy guidance and product highlights, presented with strong photography and a direct enquiry path.',
    designDirection:
      'Bold, optimistic energy-brand presentation built on large photography, strong navy-and-amber contrast and clear service signposting.',
    note: 'Live at the URL above; the hosting account was redeployed with this project.',
    caseStudy: 'projects/dhruva-infra.html',
  },
  {
    id: 'fairdeal-agencies',
    index: '03',
    title: 'Fairdeal Agencies',
    category: 'Business & Retail',
    url: 'https://fairdeal-agencies.ai.studio/',
    image: 'assets/images/fairdeal-agencies.webp',
    imageAlt:
      'Screenshot of the Fairdeal Agencies website homepage with the headline Smart Appliances. Better Living.',
    width: 1101,
    height: 819,
    platform: 'React · Vite',
    summary:
      'A polished retail identity for a multi-brand appliances and electronics showroom — category-first browsing, offer highlights and a confident blue system that guides shoppers from discovery to enquiry.',
    designDirection:
      'Professional business identity with a confident blue palette, clear information hierarchy and a category-first browsing structure.',
    caseStudy: 'projects/fairdeal-agencies.html',
  },
  {
    id: 'star-electronics',
    index: '04',
    title: 'Star Electronics',
    category: 'Electronics & Retail',
    url: 'https://gamerzdeadshot52-beep.github.io/Star-electronics-4/',
    image: 'assets/images/star-electronics.webp',
    imageAlt:
      'Screenshot of the Star Electronics website homepage with the headline Mobiles. Electronics. Furniture. All Brands, One Store.',
    width: 1090,
    height: 830,
    platform: 'GitHub Pages · Static',
    languages: 'English · हिन्दी',
    summary:
      'A bilingual, product-first site for a local electronics and furniture store — three departments, featured weekly products, sale moments and store details in a dark, high-contrast interface with an English / हिन्दी switch.',
    designDirection:
      'Modern technology aesthetic with a dark high-contrast canvas, yellow accent system and product-forward browsing hierarchy.',
    caseStudy: 'projects/star-electronics.html',
  },
];

/* Primary navigation — real pages (the site is multi-page).
   The active page is marked statically in each page's markup with
   class "is-active" + aria-current="page"; keep both in sync when editing. */
export const NAV_LINKS = [
  { label: 'Work', href: 'work.html' },
  { label: 'Services', href: 'services.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Process', href: 'process.html' },
  { label: 'Contact', href: 'contact.html' },
];

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;
