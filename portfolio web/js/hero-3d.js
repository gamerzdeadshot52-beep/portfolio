/* ==========================================================================
   Horizon Designs — Cinematic 3D hero (Three.js)
   An art-directed sculpture: brushed metal, bronze rings, translucent glass
   and a dark faceted core under soft studio lighting.
   - Lazy: imported after first paint by main.js
   - Paused whenever the hero scrolls out of view or the tab is hidden
   - Renders a single static frame for prefers-reduced-motion
   - Falls back to the CSS sculpture if WebGL is unavailable
   ========================================================================== */

import * as THREE from 'three';
import { RoomEnvironment } from '../assets/vendor/RoomEnvironment.js';
import { prefersReducedMotion } from './config.js';

export function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  const stage = document.querySelector('.hero__visual');
  if (!canvas || !stage) return null;

  const reducedMotion = prefersReducedMotion();

  /* --------------------------------------------------------------------
     Renderer — created inside try/catch: failure = CSS fallback
     -------------------------------------------------------------------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    document.body.classList.add('webgl-failed');
    console.warn('[Horizon] WebGL unavailable — CSS fallback active.', error);
    return null;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.35, 6.6);

  /* --------------------------------------------------------------------
     Environment — RoomEnvironment PMREM gives believable metal/glass
     reflections without shipping an HDR file.
     -------------------------------------------------------------------- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  /* --------------------------------------------------------------------
     Lights — soft studio: warm key, cool rim, bronze fill
     -------------------------------------------------------------------- */
  const ambient = new THREE.AmbientLight(0xffffff, 0.16);
  const key = new THREE.DirectionalLight(0xffe9cf, 2.3);
  key.position.set(3.6, 4.6, 3.2);
  const rim = new THREE.DirectionalLight(0x9fb6ff, 1.15);
  rim.position.set(-4.2, 1.4, -3.4);
  const fill = new THREE.PointLight(0xc6a675, 9, 14, 2);
  fill.position.set(-2.6, -2.2, 2.4);
  scene.add(ambient, key, rim, fill);

  /* --------------------------------------------------------------------
     Materials
     -------------------------------------------------------------------- */
  const materials = {
    bronze: new THREE.MeshStandardMaterial({
      color: 0xc6a675, metalness: 1, roughness: 0.24, envMapIntensity: 1.25,
    }),
    bronzeDark: new THREE.MeshStandardMaterial({
      color: 0xa9884f, metalness: 1, roughness: 0.34, envMapIntensity: 1.1,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0xa8a8ad, metalness: 0.96, roughness: 0.4, envMapIntensity: 1.15,
    }),
    obsidian: new THREE.MeshPhysicalMaterial({
      color: 0x17171c, metalness: 0.4, roughness: 0.3,
      clearcoat: 1, clearcoatRoughness: 0.3, flatShading: true, envMapIntensity: 1.2,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0, roughness: 0.06,
      transmission: 1, thickness: 0.55, ior: 1.45,
      clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5,
      transparent: true, opacity: 1,
    }),
  };

  /* --------------------------------------------------------------------
     Sculpture
     -------------------------------------------------------------------- */
  const geometries = [];
  const geo = (g) => { geometries.push(g); return g; };

  const root = new THREE.Group();       // scroll tilt / entrance scale
  const parallax = new THREE.Group();   // pointer-driven tilt
  const idle = new THREE.Group();       // slow idle rotation
  root.add(parallax);
  parallax.add(idle);
  scene.add(root);

  // 1 — dark faceted core (polished stone)
  const core = new THREE.Mesh(geo(new THREE.IcosahedronGeometry(0.94, 1)), materials.obsidian);
  core.rotation.set(0.4, 0.6, 0.15);
  idle.add(core);

  // 2 — large bronze horizon ring
  const ringA = new THREE.Mesh(geo(new THREE.TorusGeometry(1.62, 0.052, 26, 180)), materials.bronze);
  ringA.rotation.set(1.12, 0.15, 0);
  idle.add(ringA);

  // 3 — counter-tilted thin ring (steel)
  const ringB = new THREE.Mesh(geo(new THREE.TorusGeometry(1.3, 0.02, 18, 160)), materials.steel);
  ringB.rotation.set(0.5, 0.75, 0.3);
  idle.add(ringB);

  // 4 — wide flat "horizon" line encircling the composition
  const horizon = new THREE.Mesh(geo(new THREE.TorusGeometry(2.06, 0.0085, 10, 220)), materials.bronzeDark);
  horizon.rotation.x = Math.PI / 2;
  horizon.position.y = -0.12;
  idle.add(horizon);

  // 5 — translucent glass slab
  const slab = new THREE.Mesh(geo(new THREE.BoxGeometry(0.6, 1.06, 0.15)), materials.glass);
  slab.position.set(0.98, -0.12, 0.42);
  slab.rotation.set(0.12, -0.42, 0.3);
  idle.add(slab);

  // 6 — brushed metal coin
  const disc = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 72, 1)), materials.steel);
  disc.position.set(-1.08, 0.6, -0.15);
  disc.rotation.set(1.15, 0.1, 0.35);
  idle.add(disc);

  // 7 — small bronze satellites orbiting the core
  const orbit = new THREE.Group();
  const sats = [];
  [
    { r: 1.62, speed: 0.22, phase: 0, y: 0.42, size: 0.115 },
    { r: 1.62, speed: 0.22, phase: Math.PI, y: -0.38, size: 0.09 },
    { r: 1.3, speed: -0.3, phase: 1.9, y: 0.05, size: 0.07 },
  ].forEach((s) => {
    const m = new THREE.Mesh(geo(new THREE.SphereGeometry(s.size, 32, 20)), materials.bronze);
    m.userData = s;
    sats.push(m);
    orbit.add(m);
  });
  idle.add(orbit);

  /* --------------------------------------------------------------------
     Soft fake contact shadow (cheap canvas radial gradient)
     -------------------------------------------------------------------- */
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex, transparent: true, depthWrite: false, opacity: 0.85,
  });
  const shadowGeo = new THREE.PlaneGeometry(4.6, 2.1);
  geometries.push(shadowGeo);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.62;
  root.add(shadow);

  /* --------------------------------------------------------------------
     Sizing (DPR-capped, mobile-aware)
     -------------------------------------------------------------------- */
  let width = 0;
  let height = 0;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.4 : 1.8);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderer.render(scene, camera);
  };

  /* --------------------------------------------------------------------
     Entrance state
     -------------------------------------------------------------------- */
  const entrance = { t: reducedMotion ? 1 : 0 };
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  /* Pointer parallax targets */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (event) => {
    const rect = stage.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.ty = ((event.clientY - rect.top) / rect.height) * 2 - 1;
  };

  /* Scroll-linked subtle rotation */
  let scrollProgress = 0;
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    scrollProgress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
  };

  /* --------------------------------------------------------------------
     Render loop — only runs while the hero is on screen
     -------------------------------------------------------------------- */
  let rafId = 0;
  let running = false;
  let heroVisible = true;
  const clock = new THREE.Clock();
  let elapsed = 0;

  const update = (dt) => {
    elapsed += dt;

    // entrance (scale + rise + settle rotation)
    if (entrance.t < 1) {
      entrance.t = Math.min(1, entrance.t + dt / 1.25);
      const e = easeOutExpo(entrance.t);
      root.scale.setScalar(0.74 + 0.26 * e);
      root.position.y = -0.55 + 0.55 * e;
      idle.rotation.y = -0.62 * (1 - e);
    }

    // slow idle spin + gentle bob
    if (entrance.t >= 1) idle.rotation.y += dt * 0.16;
    idle.position.y = Math.sin(elapsed * 0.55) * 0.045;

    // rings roll in opposite directions
    ringA.rotation.z += dt * 0.16;
    ringB.rotation.z -= dt * 0.24;
    disc.rotation.y += dt * 0.5;

    // faceted core breathes its orientation
    core.rotation.y += dt * 0.1;

    // satellites orbit
    sats.forEach((m) => {
      const s = m.userData;
      const a = elapsed * s.speed + s.phase;
      m.position.set(Math.cos(a) * s.r, s.y + Math.sin(elapsed * 0.8 + s.phase) * 0.06, Math.sin(a) * s.r);
    });

    // pointer parallax (eased)
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    parallax.rotation.y = pointer.x * 0.2;
    parallax.rotation.x = pointer.y * 0.13;

    // subtle scroll response (kept off root.position.y, which the entrance owns)
    root.rotation.x = scrollProgress * 0.14;
    parallax.position.y = scrollProgress * 0.32;
  };

  const frame = () => {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    renderer.render(scene, camera);
  };

  const start = () => {
    if (running || reducedMotion) return;
    running = true;
    clock.start();
    rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  /* --------------------------------------------------------------------
     Visibility gating — pause when the hero leaves the viewport
     -------------------------------------------------------------------- */
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0]?.isIntersecting ?? true;
        if (heroVisible && !document.hidden) start();
        else stop();
      },
      { threshold: 0.02 }
    );
    observer.observe(stage);
  }

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (heroVisible) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  /* Pointer listeners only on fine pointers */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const attachPointer = () => {
    if (finePointer.matches && !reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }
  };
  attachPointer();
  finePointer.addEventListener?.('change', attachPointer);

  window.addEventListener('scroll', onScroll, { passive: true });

  /* Resize handling */
  const ro = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  ro?.observe(stage);
  const onWindowResize = () => resize();
  window.addEventListener('resize', onWindowResize);

  /* Context loss → graceful CSS fallback */
  const onContextLost = (event) => {
    event.preventDefault();
    stop();
    teardown();
    document.body.classList.add('webgl-failed');
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  /* --------------------------------------------------------------------
     Boot: size, first render, mark ready, start loop
     -------------------------------------------------------------------- */
  resize();
  onScroll();
  renderer.render(scene, camera);
  canvas.classList.add('is-ready');
  if (reducedMotion) {
    // Single static frame only — fully composed, zero ongoing cost
    stop();
    root.scale.setScalar(1);
    root.position.y = 0;
    idle.rotation.y = 0.35;
    renderer.render(scene, camera);
  } else {
    start();
  }

  /* --------------------------------------------------------------------
     Cleanup
     -------------------------------------------------------------------- */
  function teardown() {
    stop();
    observer?.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    ro?.disconnect();

    geometries.forEach((g) => g.dispose());
    Object.values(materials).forEach((m) => m.dispose());
    shadowMat.dispose();
    shadowTex.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  window.addEventListener('pagehide', teardown, { once: true });

  return teardown;
}
