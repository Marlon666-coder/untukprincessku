/**
 * LOVE PIXEL WORLD — 2.5D voxel world (plain Three.js)
 * =====================================================
 *
 * One factory `createLoveWorld(canvas, options)` builds the entire scene and
 * returns a small controller the React layer drives:
 *
 *   { focusTreasure, closeTreasure, revealReward, unlockPortal,
 *     enterEnding, returnToGarden, playOpening, dispose, ... }
 *
 * Design notes
 * ------------
 * • Everything is built from simple BoxGeometry "voxels" (merged per object
 *   into a few meshes) + a handful of instanced particle systems → low draw
 *   calls, mobile friendly.
 * • A single orthographic-feeling PerspectiveCamera flies between named
 *   "shots" with eased interpolation (no camera fights: one tween at a time).
 * • Hover / click use a raycaster against the four chest hit-boxes and the
 *   portal; the React HUD also drives selection so touch + keyboard work.
 * • The world never assumes audio/motion; `reducedMotion` renders calmer.
 */

import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  DirectionalLight,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const UNIT = new BoxGeometry(1, 1, 1);
const _m = new Matrix4();
const _o = new Object3D();

/** Deterministic PRNG so the island looks identical on every visit. */
function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A reusable voxel-box helper: one shared cube geometry, scaled per mesh. */
function voxel(material, x, y, z, sx = 1, sy = 1, sz = 1) {
  const mesh = new Mesh(UNIT, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  return mesh;
}

function mat(color, opts = {}) {
  return new MeshStandardMaterial({
    color: new Color(color),
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0,
    emissive: opts.emissive ? new Color(opts.emissive) : new Color('#000000'),
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    flatShading: true,
  });
}

/** Soft radial sprite used for glow / particles. */
function softTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.4, inner.replace('1)', '0.6)'));
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Vertical gradient sky as a big inverted box with a canvas texture. */
function skyBackground(scene, colors) {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, colors.top);
  g.addColorStop(0.55, colors.middle);
  g.addColorStop(1, colors.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new CanvasTexture(canvas);
  scene.background = tex;
  return tex;
}

// ---------------------------------------------------------------------------
// Builders for world objects
// ---------------------------------------------------------------------------

/** A floating block island with grass top + soil + tapered underside. */
function buildIsland(materials, { radius = 7, cx = 0, cz = 0 } = {}) {
  const group = new Group();
  const r = rng(42);
  const grass = materials.grass;
  const grass2 = materials.grass2;
  const soil = materials.soil;
  const rock = materials.rock;

  // Grass surface: a disc of 1x1 tiles with slight height variation.
  for (let x = -radius; x <= radius; x += 1) {
    for (let z = -radius; z <= radius; z += 1) {
      const d = Math.hypot(x, z);
      if (d > radius) continue;
      const h = 0.6 + (r() < 0.12 ? 0.25 : 0);
      const m = r() < 0.3 ? grass2 : grass;
      group.add(voxel(m, cx + x, h / 2, cz + z, 1, h, 1));
      // soil underneath
      const depth = MathUtils.lerp(2.4, 0.6, d / radius);
      group.add(voxel(soil, cx + x, -depth / 2, cz + z, 1, depth, 1));
    }
  }
  // Rocky tapered base (fewer, bigger blocks).
  for (let layer = 1; layer <= 4; layer += 1) {
    const rr = Math.max(1, radius - layer * 1.6);
    const y = -2.2 - layer * 0.9;
    for (let x = -rr; x <= rr; x += 1.4) {
      for (let z = -rr; z <= rr; z += 1.4) {
        if (Math.hypot(x, z) > rr) continue;
        group.add(voxel(rock, cx + x, y, cz + z, 1.4, 1, 1.4));
      }
    }
  }
  return group;
}

/** Heart-shaped pixel tree: brown trunk + a blocky heart canopy of leaves. */
function buildHeartTree(materials, { x = 0, z = 0, scale = 1 } = {}) {
  const group = new Group();
  const trunk = materials.trunk;
  const leaf = materials.leaf;
  const leaf2 = materials.leaf2;

  // Trunk
  for (let i = 0; i < 4; i += 1) {
    group.add(voxel(trunk, 0, 1 + i, 0, 0.7, 1, 0.7));
  }
  // Heart canopy — map a small heart bitmap into voxels.
  const heart = [
    '0110110',
    '1111111',
    '1111111',
    '0111110',
    '0011100',
    '0001000',
  ];
  const base = 5.2;
  heart.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx += 1) {
      if (row[rx] === '0') continue;
      const px = rx - (row.length - 1) / 2;
      const py = base + (heart.length - 1 - ry);
      const m = (rx + ry) % 2 ? leaf : leaf2;
      group.add(voxel(m, px, py, 0, 1, 1, 1.1));
      group.add(voxel(m, px, py, 0.9, 1, 1, 0.9));
      group.add(voxel(m, px, py, -0.9, 1, 1, 0.9));
    }
  });
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  return group;
}

/** A little voxel flower (stem + petals + center). */
function buildFlower(materials, color) {
  const group = new Group();
  const petal = mat(color, { emissive: color, emissiveIntensity: 0.15 });
  group.userData.disposables = [petal];
  group.add(voxel(materials.leaf, 0, 0.35, 0, 0.12, 0.7, 0.12));
  group.add(voxel(petal, 0, 0.75, 0, 0.26, 0.26, 0.26));
  group.add(voxel(petal, 0.22, 0.75, 0, 0.18, 0.18, 0.18));
  group.add(voxel(petal, -0.22, 0.75, 0, 0.18, 0.18, 0.18));
  group.add(voxel(petal, 0, 0.75, 0.22, 0.18, 0.18, 0.18));
  group.add(voxel(petal, 0, 0.75, -0.22, 0.18, 0.18, 0.18));
  group.add(voxel(materials.flowerCenter, 0, 0.78, 0, 0.16, 0.16, 0.16));
  return group;
}

/** A glowing crystal cluster. */
function buildCrystal(color) {
  const group = new Group();
  const m = mat(color, { emissive: color, emissiveIntensity: 0.55, roughness: 0.3, opacity: 0.9, transparent: true });
  group.userData.disposables = [m];
  group.add(voxel(m, 0, 0.6, 0, 0.3, 1.2, 0.3));
  group.add(voxel(m, 0.28, 0.35, 0.1, 0.2, 0.7, 0.2));
  group.add(voxel(m, -0.26, 0.3, -0.1, 0.18, 0.6, 0.18));
  return group;
}

/**
 * A treasure chest. Returns { group, lid, hit, open(t), colors } so the
 * controller can animate the lid and raycast against `hit`.
 */
function buildChest(def) {
  const group = new Group();
  const body = mat(def.chestColor, { roughness: 0.7 });
  const lidMat = mat(def.chestColor, { roughness: 0.6 });
  const trim = mat(def.ribbonColor, { emissive: def.ribbonColor, emissiveIntensity: 0.2 });
  const disposables = [body, lidMat, trim];

  // Base box
  group.add(voxel(body, 0, 0.6, 0, 1.6, 1.2, 1.1));
  // Front ribbon band
  group.add(voxel(trim, 0, 0.6, 0.56, 0.3, 1.2, 0.06));
  group.add(voxel(trim, 0, 0.6, -0.56, 0.3, 1.2, 0.06));
  // Lid (pivots around back-top edge)
  const lid = new Group();
  lid.add(voxel(lidMat, 0, 0.0, 0, 1.65, 0.5, 1.15));
  lid.add(voxel(trim, 0, 0.0, 0.58, 0.3, 0.5, 0.06));
  // small heart knob
  lid.add(voxel(trim, 0, 0.28, 0, 0.26, 0.18, 0.18));
  lid.position.set(0, 1.25, -0.55);
  group.add(lid);

  // Invisible, slightly larger hit box for easy clicking/tapping.
  const hit = new Mesh(UNIT, new MeshStandardMaterial({ visible: false }));
  hit.scale.set(2.0, 2.4, 1.8);
  hit.position.set(0, 1.0, 0);
  group.add(hit);
  group.userData.disposables = disposables;

  return {
    group,
    lid,
    hit,
    /** open amount 0..1 → lid rotates up to ~110°. */
    setOpen(t) {
      lid.rotation.x = -MathUtils.degToRad(112) * MathUtils.clamp(t, 0, 1);
    },
  };
}

/** Voxel reward builders keyed by reward name. Returns a Group. */
function buildReward(name, def, materials) {
  const g = new Group();
  const disp = [];
  const add = (m) => {
    disp.push(m);
    return m;
  };

  if (name === 'bouquet') {
    const colors = ['#ff6fa5', '#ffd166', '#ff8fb0', '#c084fc', '#fff3f8'];
    g.add(voxel(add(mat('#5a8f4f')), 0, -0.1, 0, 0.5, 1.2, 0.5)); // wrap
    colors.forEach((c, i) => {
      const fx = (i - 2) * 0.42;
      const fy = 0.9 + (i % 2) * 0.25;
      const pm = add(mat(c, { emissive: c, emissiveIntensity: 0.2 }));
      g.add(voxel(add(mat('#4e8f52')), fx, 0.4, 0, 0.12, 1.1, 0.12));
      g.add(voxel(pm, fx, fy, 0, 0.42, 0.42, 0.42));
      g.add(voxel(pm, fx + 0.26, fy, 0, 0.22, 0.22, 0.22));
      g.add(voxel(pm, fx - 0.26, fy, 0, 0.22, 0.22, 0.22));
      g.add(voxel(pm, fx, fy + 0.26, 0, 0.22, 0.22, 0.22));
    });
  } else if (name === 'heart') {
    const heart = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
    const m = add(mat(def.accent, { emissive: def.accent, emissiveIntensity: 0.5, roughness: 0.4 }));
    heart.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx += 1) {
        if (row[rx] === '0') continue;
        const px = (rx - 3) * 0.3;
        const py = (5 - ry) * 0.3 + 0.2;
        g.add(voxel(m, px, py, 0, 0.3, 0.3, 0.32));
      }
    });
  } else if (name === 'chocolate') {
    const choc = add(mat('#5a3418', { roughness: 0.6 }));
    const choc2 = add(mat('#7a4a28', { roughness: 0.6 }));
    const candy = add(mat('#ff8fb0', { emissive: '#ff8fb0', emissiveIntensity: 0.25 }));
    const gold = add(mat('#f2c14e', { emissive: '#f2c14e', emissiveIntensity: 0.3 }));
    const pieces = [
      [-0.5, 0.3, choc],
      [0.1, 0.3, choc2],
      [-0.2, 0.9, candy],
      [0.5, 0.5, gold],
      [0.3, 1.0, choc],
    ];
    pieces.forEach(([x, y, m], i) => {
      g.add(voxel(m, x, y, (i % 2) * 0.2 - 0.1, 0.38, 0.38, 0.38));
    });
    g.userData.pieces = g.children.slice();
  } else if (name === 'star') {
    const star = [
      '0001000',
      '0001000',
      '1111111',
      '0111110',
      '0011100',
      '0100010',
    ];
    const m = add(mat(def.accent, { emissive: def.glow, emissiveIntensity: 0.7, roughness: 0.3 }));
    star.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx += 1) {
        if (row[rx] === '0') continue;
        const px = (rx - 3) * 0.28;
        const py = (5 - ry) * 0.28 + 0.3;
        g.add(voxel(m, px, py, 0, 0.28, 0.28, 0.3));
      }
    });
  }

  g.userData.disposables = disp;
  g.visible = false;
  g.scale.setScalar(0.001);
  return g;
}

/** The portal: a ring/arch of blocks with a glowing center plane. */
function buildPortal(materials) {
  const group = new Group();
  const frame = mat('#caa65a', { roughness: 0.5, metalness: 0.2 });
  const frameDark = mat('#6b5a2e', { roughness: 0.7 });
  const core = mat('#1a1430', { emissive: '#2a1f4a', emissiveIntensity: 0.3, transparent: true, opacity: 0.92 });
  const disp = [frame, frameDark, core];

  // Arched frame from blocks.
  const ringR = 2.1;
  for (let a = 0; a < 360; a += 20) {
    const rad = MathUtils.degToRad(a);
    const px = Math.cos(rad) * ringR;
    const py = Math.sin(rad) * ringR + ringR + 0.4;
    if (py < 0.4) continue;
    const m = a % 40 ? frame : frameDark;
    group.add(voxel(m, px, py, 0, 0.6, 0.6, 0.5));
  }
  // Core plane (glow swirl painted on canvas, animated via rotation).
  const coreMesh = voxel(core, 0, ringR + 0.4, -0.05, ringR * 1.7, ringR * 1.7, 0.1);
  group.add(coreMesh);

  group.userData.disposables = disp;
  return { group, core, coreMesh, center: new Vector3(0, ringR + 0.4, 0) };
}

/** A simple voxel character (head, body, arms, legs) with idle animation. */
function buildCharacter(colors) {
  const group = new Group();
  const skin = mat(colors.skin, { roughness: 0.8 });
  const body = mat(colors.body, { roughness: 0.8 });
  const hair = mat(colors.hair, { roughness: 0.85 });
  const disp = [skin, body, hair];

  const head = voxel(skin, 0, 2.1, 0, 0.7, 0.7, 0.7);
  const hairTop = voxel(hair, 0, 2.45, 0, 0.78, 0.3, 0.78);
  group.add(head, hairTop);
  group.add(voxel(body, 0, 1.3, 0, 0.7, 1.0, 0.45)); // torso
  const armL = voxel(skin, -0.5, 1.35, 0, 0.22, 0.9, 0.22);
  const armR = voxel(skin, 0.5, 1.35, 0, 0.22, 0.9, 0.22);
  group.add(armL, armR);
  group.add(voxel(body, -0.2, 0.55, 0, 0.26, 0.9, 0.3)); // legs
  group.add(voxel(body, 0.2, 0.55, 0, 0.26, 0.9, 0.3));

  group.userData.disposables = disp;
  group.userData.head = head;
  return group;
}

// ---------------------------------------------------------------------------
// Camera shots
// ---------------------------------------------------------------------------

const SHOTS = {
  opening: { pos: new Vector3(6, 6, 12), target: new Vector3(0, 2.5, 0) },
  garden: { pos: new Vector3(0, 9, 15), target: new Vector3(0, 1.5, -1) },
  portal: { pos: new Vector3(0, 6, 7), target: new Vector3(0, 3, -9) },
  ending: { pos: new Vector3(0, 5, 12), target: new Vector3(0, 2.5, 0) },
};

// Chest placements on the garden island (x, z) around the centre path.
const CHEST_SLOTS = [
  { x: -4.5, z: 1.5 },
  { x: 4.5, z: 1.5 },
  { x: -3, z: -3.5 },
  { x: 3, z: -3.5 },
];

// ---------------------------------------------------------------------------
// Main factory
// ---------------------------------------------------------------------------

export function createLoveWorld(canvas, options = {}) {
  const {
    treasures = [],
    visual = {},
    reducedMotion = false,
    onHoverChest = () => {},
    onSelectChest = () => {},
    onPortalClick = () => {},
  } = options;

  const isSmall = window.matchMedia('(max-width: 767px)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // --- Renderer ----------------------------------------------------------
  const renderer = new WebGLRenderer({ canvas, antialias: !isSmall, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.4 : 2));

  const scene = new Scene();
  const skyTex = skyBackground(scene, {
    top: visual.sky?.top || '#cfe4ff',
    middle: visual.sky?.middle || '#f7d7ec',
    bottom: visual.sky?.bottom || '#ffe9f3',
  });

  const camera = new PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.copy(SHOTS.garden.pos);

  // --- Lighting ----------------------------------------------------------
  scene.add(new AmbientLight(0xffffff, 0.85));
  const sun = new DirectionalLight(0xfff2f8, 1.5);
  sun.position.set(6, 12, 8);
  scene.add(sun);
  const fill = new DirectionalLight(0xbcd4ff, 0.5);
  fill.position.set(-6, 4, -6);
  scene.add(fill);
  const portalLight = new PointLight(0xffd27f, 0, 18, 1.5);
  scene.add(portalLight);

  // --- Shared materials --------------------------------------------------
  const materials = {
    grass: mat('#8fd47a'),
    grass2: mat('#79c468'),
    soil: mat('#9a6b4a'),
    rock: mat('#8c8a99'),
    trunk: mat('#7a4a30'),
    leaf: mat('#ff9ec4', { emissive: '#ff9ec4', emissiveIntensity: 0.12 }),
    leaf2: mat('#ff7fae', { emissive: '#ff7fae', emissiveIntensity: 0.12 }),
    flowerCenter: mat('#fff3b0', { emissive: '#fff3b0', emissiveIntensity: 0.3 }),
    water: mat('#9ad7ff', { emissive: '#bfe8ff', emissiveIntensity: 0.2, transparent: true, opacity: 0.85 }),
    stone: mat('#cfd3dd'),
  };

  // --- World groups ------------------------------------------------------
  const worldRoot = new Group();
  scene.add(worldRoot);

  // Garden island
  const gardenIsland = buildIsland(materials, { radius: 7 });
  worldRoot.add(gardenIsland);

  // Central heart tree + decoration
  gardenIsland.add(buildHeartTree(materials, { x: 0, z: 2.5, scale: 0.8 }));

  const decoRandom = rng(99);
  const flowerColors = ['#ff6fa5', '#ffd166', '#c084fc', '#ff8fb0', '#7ee0d9'];
  for (let i = 0; i < (isSmall ? 10 : 18); i += 1) {
    const ang = decoRandom() * Math.PI * 2;
    const rad = 1.5 + decoRandom() * 5;
    const f = buildFlower(materials, flowerColors[i % flowerColors.length]);
    f.position.set(Math.cos(ang) * rad, 0.6, Math.sin(ang) * rad - 0.5);
    gardenIsland.add(f);
  }
  [[-5.5, -1.5], [5.5, -1], [0, 5.5]].forEach(([x, z]) => {
    const c = buildCrystal('#9ad7ff');
    c.position.set(x, 0.6, z);
    gardenIsland.add(c);
  });

  // Little stream (strip of water voxels)
  for (let z = -2; z <= 4; z += 1) {
    gardenIsland.add(voxel(materials.water, -0.5 + Math.sin(z) * 0.3, 0.45, z, 1.2, 0.1, 1));
  }
  // Stepping stones toward the portal side
  for (let z = -4; z >= -7; z -= 1) {
    gardenIsland.add(voxel(materials.stone, (z % 2) * 0.4, 0.5, z, 0.8, 0.2, 0.8));
  }

  // --- Chests ------------------------------------------------------------
  const chests = treasures.slice(0, 4).map((def, i) => {
    const slot = CHEST_SLOTS[i];
    const built = buildChest(def);
    built.group.position.set(slot.x, 0.6, slot.z);
    built.def = def;
    built.index = i;
    built.hit.userData = { chestIndex: i };
    gardenIsland.add(built.group);

    // Glow sprite under each chest
    const glowMat = new PointsMaterial({
      size: 3.2,
      map: softTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      color: new Color(def.glow),
      opacity: 0.0,
    });
    const glowGeo = new BufferGeometry();
    glowGeo.setAttribute('position', new BufferAttribute(new Float32Array([0, 1.2, 0]), 3));
    const glow = new Points(glowGeo, glowMat);
    built.group.add(glow);
    built.glow = glow;
    built.glowMat = glowMat;

    // Reward (hidden until revealed), sits above the chest
    const reward = buildReward(def.reward, def, materials);
    reward.position.set(0, 2.1, 0);
    built.group.add(reward);
    built.reward = reward;

    return built;
  });

  // --- Portal (far end of the island) ------------------------------------
  const portal = buildPortal(materials);
  portal.group.position.set(0, 0.6, -9);
  gardenIsland.add(portal.group);
  portal.group.getWorldPosition(portal.center);
  portal.unlocked = false;

  // --- Final island (hidden until ending) --------------------------------
  const finalRoot = new Group();
  finalRoot.visible = false;
  finalRoot.position.set(0, -40, 0); // tucked below; camera flies here on ending
  scene.add(finalRoot);
  const finalIsland = buildIsland(materials, { radius: 6 });
  finalRoot.add(finalIsland);
  finalIsland.add(buildHeartTree(materials, { x: 0, z: -2, scale: 1 }));
  const charCreator = buildCharacter(visual.characters?.creator || { body: '#6aa9ff', hair: '#2b3a67', skin: '#ffd9b8' });
  const charPartner = buildCharacter(visual.characters?.partner || { body: '#ff8fc0', hair: '#5a2e3e', skin: '#ffe0c4' });
  charCreator.position.set(-0.9, 0.6, 1.5);
  charPartner.position.set(0.9, 0.6, 1.5);
  charCreator.rotation.y = 0.25;
  charPartner.rotation.y = -0.25;
  finalIsland.add(charCreator, charPartner);
  for (let i = 0; i < 6; i += 1) {
    const f = buildFlower(materials, flowerColors[i % flowerColors.length]);
    const ang = (i / 6) * Math.PI * 2;
    f.position.set(Math.cos(ang) * 3, 0.6, Math.sin(ang) * 3);
    finalIsland.add(f);
  }
  // night sky stars for the final island are added as a particle field below.

  // --- Ambient particles (floating hearts + petals) ----------------------
  const partCount = reducedMotion ? 20 : isSmall ? 45 : 90;
  const partGeo = new BufferGeometry();
  const partPos = new Float32Array(partCount * 3);
  const partState = [];
  for (let i = 0; i < partCount; i += 1) {
    const s = {
      x: (decoRandom() * 2 - 1) * 12,
      y: decoRandom() * 10,
      z: (decoRandom() * 2 - 1) * 10 - 2,
      speed: 0.3 + decoRandom() * 0.5,
      sway: 0.4 + decoRandom() * 0.8,
      phase: decoRandom() * Math.PI * 2,
    };
    partState.push(s);
    partPos[i * 3] = s.x;
    partPos[i * 3 + 1] = s.y;
    partPos[i * 3 + 2] = s.z;
  }
  partGeo.setAttribute('position', new BufferAttribute(partPos, 3));
  const partMat = new PointsMaterial({
    size: 0.5,
    map: softTexture('rgba(255,180,214,1)', 'rgba(255,180,214,0)'),
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    color: new Color('#ffc2dd'),
    opacity: 0.85,
  });
  const particles = new Points(partGeo, partMat);
  scene.add(particles);

  // --- Burst particles (reused for reveal / portal / discover) -----------
  const BURST_MAX = isSmall ? 60 : 120;
  const burstGeo = new BufferGeometry();
  const burstPos = new Float32Array(BURST_MAX * 3);
  burstGeo.setAttribute('position', new BufferAttribute(burstPos, 3));
  const burstMat = new PointsMaterial({
    size: 0.4,
    map: softTexture(),
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    color: new Color('#fff3b0'),
    opacity: 0,
  });
  const burst = new Points(burstGeo, burstMat);
  burst.frustumCulled = false;
  scene.add(burst);
  const burstState = [];
  let burstActive = 0;
  function spawnBurst(origin, color, count = BURST_MAX) {
    burstMat.color.set(color);
    burstMat.opacity = 1;
    burstActive = Math.min(count, BURST_MAX);
    for (let i = 0; i < burstActive; i += 1) {
      const dir = new Vector3(decoRandom() * 2 - 1, decoRandom() * 1.5 + 0.3, decoRandom() * 2 - 1).normalize();
      burstState[i] = {
        x: origin.x,
        y: origin.y,
        z: origin.z,
        vx: dir.x * (1.5 + decoRandom() * 2),
        vy: dir.y * (1.5 + decoRandom() * 2),
        vz: dir.z * (1.5 + decoRandom() * 2),
        life: 1,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Camera tweening (one shot at a time)
  // ---------------------------------------------------------------------------
  const camTarget = SHOTS.garden.target.clone();
  const tween = {
    active: false,
    fromPos: new Vector3(),
    toPos: new Vector3(),
    fromTgt: new Vector3(),
    toTgt: new Vector3(),
    t: 0,
    dur: 1.2,
    onDone: null,
  };
  function flyTo(shot, dur = 1.4, onDone = null) {
    tween.fromPos.copy(camera.position);
    tween.toPos.copy(shot.pos);
    tween.fromTgt.copy(camTarget);
    tween.toTgt.copy(shot.target);
    tween.t = 0;
    tween.dur = reducedMotion ? Math.min(0.35, dur) : dur;
    tween.active = true;
    tween.onDone = onDone;
  }
  function flyToVec(pos, target, dur = 1.4, onDone = null) {
    flyTo({ pos, target }, dur, onDone);
  }
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ---------------------------------------------------------------------------
  // Chest open / reward reveal animation state
  // ---------------------------------------------------------------------------
  const anim = {
    focusedChest: -1,
    lidT: 0,
    lidTarget: 0,
    rewardT: 0,
    rewardTarget: 0,
  };

  // Hover state (desktop)
  let hoveredChest = -1;
  const raycaster = new Raycaster();
  const pointerNDC = new Vector2();

  function pickChest(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNDC, camera);
    const hits = raycaster.intersectObjects(chests.map((c) => c.hit), false);
    if (hits.length) return hits[0].object.userData.chestIndex;
    // portal check
    const ph = raycaster.intersectObject(portal.coreMesh, false);
    if (ph.length) return 'portal';
    return -1;
  }

  // ---------------------------------------------------------------------------
  // Public controller actions
  // ---------------------------------------------------------------------------

  let mode = 'garden'; // 'opening' | 'garden' | 'focus' | 'portal' | 'ending'

  function playOpening() {
    mode = 'opening';
    camera.position.set(10, 8, 16);
    camTarget.set(0, 3, -3);
    flyTo(SHOTS.opening, reducedMotion ? 0.4 : 2.4);
  }

  function goGarden() {
    mode = 'garden';
    anim.focusedChest = -1;
    anim.lidTarget = 0;
    anim.rewardTarget = 0;
    flyTo(SHOTS.garden, 1.3);
  }

  function focusTreasure(index) {
    if (index < 0 || index >= chests.length) return;
    mode = 'focus';
    anim.focusedChest = index;
    const c = chests[index];
    const wp = new Vector3();
    c.group.getWorldPosition(wp);
    const camPos = wp.clone().add(new Vector3(0, 3.2, 6));
    const tgt = wp.clone().add(new Vector3(0, 1.5, 0));
    flyToVec(camPos, tgt, 1.1, () => {
      anim.lidTarget = 1; // open the lid once camera arrives
    });
  }

  function revealReward(index) {
    if (index !== anim.focusedChest) return;
    anim.rewardTarget = 1;
    const c = chests[index];
    const wp = new Vector3();
    c.group.getWorldPosition(wp);
    spawnBurst(wp.clone().add(new Vector3(0, 1.5, 0)), c.def.glow, BURST_MAX);
  }

  function closeTreasure() {
    anim.lidTarget = 0;
    anim.rewardTarget = 0;
    goGarden();
  }

  function pulseReward(index) {
    const c = chests[index];
    if (!c) return;
    c.reward.userData.pulse = 1;
    const wp = new Vector3();
    c.group.getWorldPosition(wp);
    spawnBurst(wp.clone().add(new Vector3(0, 2.2, 0)), c.def.glow, Math.floor(BURST_MAX / 3));
  }

  function unlockPortal(onDone) {
    mode = 'portal';
    portal.unlocked = true;
    flyTo(SHOTS.portal, 1.6, () => {
      spawnBurst(portal.center.clone(), '#ffd27f', BURST_MAX);
      if (onDone) window.setTimeout(onDone, reducedMotion ? 200 : 900);
    });
  }

  function enterEnding(onDone) {
    mode = 'ending';
    // Reparent camera to look at the final island by moving the world instead:
    finalRoot.visible = true;
    worldRoot.visible = false;
    particles.visible = true;
    // place final island at origin, fly a gentle intro
    finalRoot.position.set(0, 0, 0);
    // darken sky toward twilight
    scene.background = twilightSky();
    camera.position.set(0, 6, 16);
    camTarget.set(0, 2.5, 0);
    flyTo(SHOTS.ending, reducedMotion ? 0.4 : 2.0, onDone);
    spawnBurst(new Vector3(0, 3, 0), '#ffe08a', BURST_MAX);
  }

  function returnToOpening(onDone) {
    // from ending → opening island
    finalRoot.visible = false;
    worldRoot.visible = true;
    scene.background = skyTex;
    camera.position.set(10, 8, 16);
    camTarget.set(0, 3, -3);
    flyTo(SHOTS.opening, reducedMotion ? 0.4 : 1.8, onDone);
    mode = 'opening';
  }

  function twilightSky() {
    const canvas2 = document.createElement('canvas');
    canvas2.width = 2;
    canvas2.height = 256;
    const ctx = canvas2.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#1b1b3a');
    g.addColorStop(0.5, '#4a3a6a');
    g.addColorStop(1, '#f6b5c8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 256);
    return new CanvasTexture(canvas2);
  }

  // Expose pointer-based picking for desktop; React drives selection otherwise.
  function handlePointerMove(clientX, clientY) {
    if (mode !== 'garden' || isCoarse) return;
    const idx = pickChest(clientX, clientY);
    const newHover = typeof idx === 'number' && idx >= 0 ? idx : -1;
    if (newHover !== hoveredChest) {
      hoveredChest = newHover;
      canvas.style.cursor = idx === 'portal' || newHover >= 0 ? 'pointer' : 'default';
      onHoverChest(newHover);
    }
  }
  function handleClick(clientX, clientY) {
    if (mode !== 'garden') return;
    const idx = pickChest(clientX, clientY);
    if (idx === 'portal') onPortalClick();
    else if (typeof idx === 'number' && idx >= 0) onSelectChest(idx);
  }

  // ---------------------------------------------------------------------------
  // Resize + render loop
  // ---------------------------------------------------------------------------
  function layout() {
    const parent = canvas.parentElement ?? canvas;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On portrait phones pull the camera back a touch so all chests fit.
    camera.fov = w / h < 0.8 ? 52 : 42;
    camera.updateProjectionMatrix();
  }

  const clock = new Clock();
  let elapsed = 0;
  let frameId = 0;

  function update(delta) {
    elapsed += delta;

    // Camera tween
    if (tween.active) {
      tween.t += delta / tween.dur;
      const k = easeInOut(Math.min(1, tween.t));
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
      camTarget.lerpVectors(tween.fromTgt, tween.toTgt, k);
      if (tween.t >= 1) {
        tween.active = false;
        const cb = tween.onDone;
        tween.onDone = null;
        cb && cb();
      }
    }
    camera.lookAt(camTarget);

    // Gentle world float
    const bob = reducedMotion ? 0 : Math.sin(elapsed * 0.6) * 0.12;
    worldRoot.position.y = bob;
    finalRoot.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.5) * 0.1;

    // Chest hover/float + glow
    chests.forEach((c, i) => {
      const focused = i === anim.focusedChest;
      const hovered = i === hoveredChest;
      const targetLift = focused ? 0 : hovered ? 0.25 : 0;
      c.group.position.y = 0.6 + targetLift + (reducedMotion ? 0 : Math.sin(elapsed * 1.2 + i) * 0.05);
      const targetGlow = focused ? 0.9 : hovered ? 0.7 : 0.25;
      c.glowMat.opacity += (targetGlow - c.glowMat.opacity) * Math.min(1, delta * 6);

      // lid open amount only for focused chest
      if (focused) {
        anim.lidT += (anim.lidTarget - anim.lidT) * Math.min(1, delta * 5);
        c.setOpen(anim.lidT);
        // reward grow + float
        anim.rewardT += (anim.rewardTarget - anim.rewardT) * Math.min(1, delta * 4);
        if (anim.rewardT > 0.01) {
          c.reward.visible = true;
          const pulse = c.reward.userData.pulse || 0;
          const s = anim.rewardT * (1 + (c.def.reward === 'heart' ? Math.sin(elapsed * 3) * 0.06 : 0)) * (1 + pulse * 0.2);
          c.reward.scale.setScalar(Math.max(0.001, s));
          c.reward.position.y = 2.1 + (reducedMotion ? 0 : Math.sin(elapsed * 1.5) * 0.12);
          c.reward.rotation.y += delta * (c.def.reward === 'star' ? 0.8 : 0.4);
          if (pulse > 0) c.reward.userData.pulse = Math.max(0, pulse - delta * 2);
        } else {
          c.reward.visible = false;
        }
      } else {
        c.setOpen(0);
        c.reward.visible = false;
      }
    });

    // Portal animation
    portal.coreMesh.rotation.z += delta * (portal.unlocked ? 0.8 : 0.15);
    const portalGlow = portal.unlocked ? 0.9 : 0.1;
    portal.core.emissiveIntensity += (portalGlow - portal.core.emissiveIntensity) * Math.min(1, delta * 2);
    portal.core.color.lerp(new Color(portal.unlocked ? '#ffe3a0' : '#1a1430'), Math.min(1, delta * 2));
    portalLight.position.copy(portal.center);
    portalLight.intensity += ((portal.unlocked ? 16 : 0) - portalLight.intensity) * Math.min(1, delta * 2);

    // Ambient particles
    for (let i = 0; i < partCount; i += 1) {
      const s = partState[i];
      s.y += s.speed * delta * (reducedMotion ? 0.3 : 1);
      s.x += Math.sin(elapsed * s.sway + s.phase) * delta * 0.3;
      if (s.y > 11) {
        s.y = -1;
        s.x = (decoRandom() * 2 - 1) * 12;
      }
      partPos[i * 3] = s.x;
      partPos[i * 3 + 1] = s.y;
      partPos[i * 3 + 2] = s.z;
    }
    partGeo.attributes.position.needsUpdate = true;
    partMat.opacity = 0.6 + Math.sin(elapsed * 1.2) * 0.2;

    // Burst particles
    if (burstActive > 0) {
      let anyAlive = false;
      for (let i = 0; i < burstActive; i += 1) {
        const b = burstState[i];
        b.life -= delta * 0.8;
        if (b.life <= 0) {
          burstPos[i * 3 + 1] = -999;
          continue;
        }
        anyAlive = true;
        b.vy -= delta * 1.2;
        b.x += b.vx * delta;
        b.y += b.vy * delta;
        b.z += b.vz * delta;
        burstPos[i * 3] = b.x;
        burstPos[i * 3 + 1] = b.y;
        burstPos[i * 3 + 2] = b.z;
      }
      burstGeo.attributes.position.needsUpdate = true;
      burstMat.opacity = Math.max(0, burstMat.opacity - delta * 0.6);
      if (!anyAlive || burstMat.opacity <= 0.01) {
        burstActive = 0;
        burstMat.opacity = 0;
      }
    }

    // Final island character idle
    if (finalRoot.visible) {
      [charCreator, charPartner].forEach((ch, i) => {
        ch.position.y = 0.6 + (reducedMotion ? 0 : Math.sin(elapsed * 1.5 + i) * 0.04);
      });
    }

    renderer.render(scene, camera);
  }

  function loop() {
    frameId = requestAnimationFrame(loop);
    update(Math.min(clock.getDelta(), 0.05));
  }
  function start() {
    if (frameId) return;
    clock.getDelta();
    loop();
  }
  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  // --- Events ------------------------------------------------------------
  const onVisibility = () => (document.hidden ? stop() : start());
  const onPointerMoveEv = (e) => handlePointerMove(e.clientX, e.clientY);
  const onPointerDownEv = (e) => handleClick(e.clientX, e.clientY);
  const resizeObserver = new ResizeObserver(() => layout());

  layout();
  resizeObserver.observe(canvas.parentElement ?? canvas);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('pointermove', onPointerMoveEv, { passive: true });
  canvas.addEventListener('pointerdown', onPointerDownEv);

  start();

  // ---------------------------------------------------------------------------
  return {
    // scene control
    playOpening,
    goGarden,
    focusTreasure,
    revealReward,
    closeTreasure,
    pulseReward,
    unlockPortal,
    enterEnding,
    returnToOpening,
    setHoveredChest(i) {
      hoveredChest = i;
    },
    getMode: () => mode,

    dispose() {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointermove', onPointerMoveEv);
      canvas.removeEventListener('pointerdown', onPointerDownEv);
      // dispose geometries + materials
      scene.traverse((obj) => {
        if (obj.geometry && obj.geometry !== UNIT) obj.geometry.dispose();
        if (obj.userData?.disposables) obj.userData.disposables.forEach((m) => m.dispose());
      });
      Object.values(materials).forEach((m) => m.dispose());
      [partMat, burstMat].forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      chests.forEach((c) => c.glowMat?.map?.dispose());
      skyTex.dispose();
      UNIT.dispose();
      renderer.dispose();
    },
  };
}

export default createLoveWorld;
