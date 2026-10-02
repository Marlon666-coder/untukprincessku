import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
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
  Quaternion,
  Scene,
  Shape,
  ShapeGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

/**
 * 3D sakura landing scene built with plain Three.js.
 *
 * Performance notes:
 * - All blossoms and falling petals are InstancedMesh → only a handful of draw calls.
 * - Pixel ratio is capped, antialias is off on phones, petal count scales with screen.
 * - The loop pauses when the tab is hidden; with reduced motion we render one still frame.
 */

const PALETTE = {
  petalBase: new Color('#f27fa9'),
  petalTip: new Color('#fff3f8'),
  petalFallBase: new Color('#f7a6c6'),
  center: new Color('#d94f80'),
  bud: new Color('#f58db5'),
  branch: new Color('#6e3a4c'),
  fog: new Color('#ffeef5'),
};

// Deterministic random so the tree looks the same on every visit.
function createRandom(seed = 7) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Heart-ish sakura petal with the characteristic notch, slightly cupped. */
function createPetalGeometry() {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.42, 0.12, 0.6, 0.66, 0.3, 1.0);
  shape.lineTo(0, 0.86);
  shape.lineTo(-0.3, 1.0);
  shape.bezierCurveTo(-0.6, 0.66, -0.42, 0.12, 0, 0);

  const geometry = new ShapeGeometry(shape, 10);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const color = new Color();

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    // Cup the petal: edges and tip curl up a little.
    position.setZ(i, 0.55 * x * x + 0.18 * y * y);
    color.copy(PALETTE.petalBase).lerp(PALETTE.petalTip, Math.min(1, Math.pow(y, 0.7)));
    colors.set([color.r, color.g, color.b], i * 3);
  }

  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** Tube that gets thinner towards the end, like a real branch. */
function createTaperedTube(points, startRadius, endRadius, tubularSegments = 40, radialSegments = 7) {
  const curve = new CatmullRomCurve3(points);
  const geometry = new TubeGeometry(curve, tubularSegments, 1, radialSegments, false);
  const position = geometry.attributes.position;
  const center = new Vector3();
  const vertex = new Vector3();

  for (let i = 0; i <= tubularSegments; i += 1) {
    const t = i / tubularSegments;
    curve.getPointAt(t, center);
    const radius = MathUtils.lerp(startRadius, endRadius, Math.pow(t, 0.8));
    for (let j = 0; j <= radialSegments; j += 1) {
      const index = i * (radialSegments + 1) + j;
      vertex.fromBufferAttribute(position, index).sub(center).multiplyScalar(radius).add(center);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  geometry.computeVertexNormals();
  return { geometry, curve };
}

function createSparkleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(255,214,231,0.9)');
  gradient.addColorStop(1, 'rgba(255,182,213,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

/** Branch layout in local space: grows from the origin towards -x / -y. */
const BRANCH_LAYOUT = {
  main: {
    points: [
      [0, 0, 0],
      [-1.4, -0.45, 0.2],
      [-2.9, -0.55, 0.45],
      [-4.4, -1.25, 0.3],
      [-5.9, -1.5, 0.6],
      [-7.1, -2.3, 0.5],
    ],
    radius: [0.24, 0.035],
  },
  twigs: [
    { from: 0.22, points: [[0, 0, 0], [-0.4, -0.9, 0.3], [-0.5, -1.9, 0.4], [-1.1, -2.6, 0.5]], radius: [0.09, 0.02] },
    { from: 0.45, points: [[0, 0, 0], [-0.7, 0.6, 0.2], [-1.5, 0.9, 0.1], [-2.2, 1.5, 0.3]], radius: [0.08, 0.02] },
    { from: 0.62, points: [[0, 0, 0], [-0.3, -0.8, -0.2], [-0.9, -1.5, 0], [-1.2, -2.1, 0.2]], radius: [0.07, 0.018] },
    { from: 0.82, points: [[0, 0, 0], [-0.6, 0.5, 0.3], [-1.3, 0.6, 0.5]], radius: [0.05, 0.015] },
  ],
};

function buildBranch({ random, branchMaterial, flowerSlots, budSlots, density, flowerScale = 1 }) {
  const group = new Group();
  const curves = [];

  const mainPoints = BRANCH_LAYOUT.main.points.map((p) => new Vector3(...p));
  const main = createTaperedTube(mainPoints, ...BRANCH_LAYOUT.main.radius, 60, 8);
  group.add(new Mesh(main.geometry, branchMaterial));
  curves.push({ curve: main.curve, start: 0.25, flowers: Math.round(16 * density) });

  BRANCH_LAYOUT.twigs.forEach((twig) => {
    const origin = main.curve.getPointAt(twig.from);
    const points = twig.points.map((p) => new Vector3(...p).add(origin));
    const tube = createTaperedTube(points, ...twig.radius, 24, 6);
    group.add(new Mesh(tube.geometry, branchMaterial));
    curves.push({ curve: tube.curve, start: 0.2, flowers: Math.round(9 * density) });
  });

  // Place blossoms along each curve, denser towards the tips.
  const point = new Vector3();
  curves.forEach(({ curve, start, flowers }) => {
    for (let i = 0; i < flowers; i += 1) {
      const t = MathUtils.lerp(start, 1, Math.pow(random(), 0.6));
      curve.getPointAt(t, point);
      const offset = new Vector3((random() - 0.5) * 0.7, (random() - 0.5) * 0.7, random() * 0.5);
      flowerSlots.push({
        group,
        position: point.clone().add(offset),
        scale: MathUtils.lerp(0.26, 0.42, random()) * flowerScale,
        tilt: new Vector3((random() - 0.5) * 1.3, (random() - 0.5) * 1.3, random() * Math.PI * 2),
      });
    }
    for (let i = 0; i < Math.round(flowers / 3); i += 1) {
      curve.getPointAt(MathUtils.lerp(start, 1, random()), point);
      budSlots.push({
        group,
        position: point.clone().add(new Vector3((random() - 0.5) * 0.5, (random() - 0.5) * 0.5, random() * 0.3)),
        scale: MathUtils.lerp(0.06, 0.1, random()),
      });
    }
  });

  return group;
}

export function createSakuraWorld(canvas, { reducedMotion = false } = {}) {
  const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const random = createRandom(11);

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isSmallScreen,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.fog = new Fog(PALETTE.fog, 9, 24);

  const camera = new PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 12);

  // Soft lighting: sky/ground fill + warm key light + pink glow near the blossoms.
  scene.add(new HemisphereLight(0xffffff, 0xffc9de, 1.6));
  const keyLight = new DirectionalLight(0xfff4f8, 1.8);
  keyLight.position.set(4, 7, 8);
  scene.add(keyLight);
  const glow = new PointLight(0xff8fbb, 18, 14, 1.4);
  scene.add(glow);

  const branchMaterial = new MeshStandardMaterial({ color: PALETTE.branch, roughness: 0.92, metalness: 0 });
  const petalMaterial = new MeshStandardMaterial({
    vertexColors: true,
    side: DoubleSide,
    roughness: 0.55,
    metalness: 0,
    emissive: new Color('#ff9ec4'),
    emissiveIntensity: 0.18,
  });
  const centerMaterial = new MeshStandardMaterial({ color: PALETTE.center, roughness: 0.5, emissive: PALETTE.center, emissiveIntensity: 0.25 });
  const budMaterial = new MeshStandardMaterial({ color: PALETTE.bud, roughness: 0.5, emissive: PALETTE.bud, emissiveIntensity: 0.2 });
  const fallingMaterial = petalMaterial.clone();
  fallingMaterial.vertexColors = false;
  fallingMaterial.color = PALETTE.petalFallBase.clone();
  fallingMaterial.transparent = true;
  fallingMaterial.opacity = 0.92;

  const petalGeometry = createPetalGeometry();
  const centerGeometry = new IcosahedronGeometry(1, 1);

  // --- Branches -----------------------------------------------------------
  // Phones: fewer but slightly bigger blossoms (the branch itself is scaled down there).
  const density = isSmallScreen ? 0.75 : 1;
  const flowerScale = isSmallScreen ? 1.3 : 1;
  const flowerSlots = [];
  const budSlots = [];
  const topBranch = buildBranch({ random, branchMaterial, flowerSlots, budSlots, density, flowerScale });
  const bottomBranch = buildBranch({ random, branchMaterial, flowerSlots, budSlots, density: density * 0.7, flowerScale });
  bottomBranch.rotation.z = Math.PI;
  scene.add(topBranch, bottomBranch);

  // Blossoms: 5 petals per flower, all in a single InstancedMesh per branch.
  const PETALS_PER_FLOWER = 5;
  const dummy = new Object3D();
  const flowerMatrix = new Matrix4();
  const petalMatrix = new Matrix4();
  const rotation = new Quaternion();

  [topBranch, bottomBranch].forEach((branch) => {
    const flowers = flowerSlots.filter((slot) => slot.group === branch);
    const buds = budSlots.filter((slot) => slot.group === branch);

    const petals = new InstancedMesh(petalGeometry, petalMaterial, flowers.length * PETALS_PER_FLOWER);
    const centers = new InstancedMesh(centerGeometry, centerMaterial, flowers.length);
    const budMesh = new InstancedMesh(centerGeometry, budMaterial, buds.length);

    flowers.forEach((flower, f) => {
      dummy.position.copy(flower.position);
      dummy.rotation.set(flower.tilt.x, flower.tilt.y, flower.tilt.z);
      dummy.scale.setScalar(flower.scale);
      dummy.updateMatrix();
      flowerMatrix.copy(dummy.matrix);

      for (let p = 0; p < PETALS_PER_FLOWER; p += 1) {
        // Fan the petals around the centre and tilt them forward to form a cup.
        dummy.position.set(0, 0, 0);
        dummy.rotation.set(0, 0, 0);
        rotation.setFromAxisAngle(new Vector3(0, 0, 1), (p / PETALS_PER_FLOWER) * Math.PI * 2);
        dummy.quaternion.copy(rotation).multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), 0.42));
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        petalMatrix.multiplyMatrices(flowerMatrix, dummy.matrix);
        petals.setMatrixAt(f * PETALS_PER_FLOWER + p, petalMatrix);
      }

      dummy.position.copy(flower.position);
      dummy.quaternion.identity();
      dummy.scale.setScalar(flower.scale * 0.16);
      dummy.updateMatrix();
      centers.setMatrixAt(f, dummy.matrix);
    });

    buds.forEach((bud, b) => {
      dummy.position.copy(bud.position);
      dummy.scale.set(bud.scale, bud.scale * 1.3, bud.scale);
      dummy.updateMatrix();
      budMesh.setMatrixAt(b, dummy.matrix);
    });

    [petals, centers, budMesh].forEach((mesh) => {
      mesh.frustumCulled = false;
    });
    branch.add(petals, centers, budMesh);
  });

  // --- Falling petals ------------------------------------------------------
  const fallingCount = reducedMotion ? 18 : isSmallScreen ? 38 : 80;
  const falling = new InstancedMesh(petalGeometry, fallingMaterial, fallingCount);
  const fallState = [];
  // Instances move every frame, so a cached bounding sphere would cull them wrongly.
  falling.frustumCulled = false;
  scene.add(falling);

  // --- Sparkles ------------------------------------------------------------
  const sparkleCount = isSmallScreen ? 60 : 120;
  const sparklePositions = new Float32Array(sparkleCount * 3);
  // Normalised (-1…1) seeds so sparkles keep their place when the viewport resizes
  // (e.g. the mobile address bar showing/hiding).
  const sparkleSeeds = Array.from({ length: sparkleCount }, () => [random() * 2 - 1, random() * 2 - 1, MathUtils.lerp(-5, 3, random())]);
  const sparkleGeometry = new BufferGeometry();
  sparkleGeometry.setAttribute('position', new BufferAttribute(sparklePositions, 3));
  const sparkleTexture = createSparkleTexture();
  const sparkleMaterial = new PointsMaterial({
    size: isSmallScreen ? 0.16 : 0.2,
    map: sparkleTexture,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    color: new Color('#ffd1e3'),
    opacity: 0.9,
  });
  const sparkles = new Points(sparkleGeometry, sparkleMaterial);
  scene.add(sparkles);

  // --- Layout --------------------------------------------------------------
  const view = { halfW: 5, halfH: 4 };

  function resetFallingPetal(state, initial) {
    state.x = (random() * 2 - 1) * (view.halfW + 1.5);
    state.y = initial ? (random() * 2 - 1) * view.halfH : view.halfH + 1 + random() * 2;
    state.z = MathUtils.lerp(-6, 3.5, random());
    state.speed = MathUtils.lerp(0.35, 0.8, random());
    state.sway = MathUtils.lerp(0.3, 0.9, random());
    state.phase = random() * Math.PI * 2;
    state.spinX = MathUtils.lerp(0.4, 1.4, random());
    state.spinY = MathUtils.lerp(0.3, 1.1, random());
    state.scale = MathUtils.lerp(0.12, 0.22, random());
  }

  function layout() {
    const { clientWidth: width, clientHeight: height } = canvas.parentElement ?? canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    view.halfH = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    view.halfW = view.halfH * camera.aspect;

    const portrait = camera.aspect < 0.85;
    const topScale = portrait ? MathUtils.clamp(view.halfW / 4.2, 0.45, 0.7) : MathUtils.clamp(view.halfW / 8.5, 0.6, 0.95);
    topBranch.scale.setScalar(topScale);
    topBranch.position.set(view.halfW + 0.4, view.halfH - (portrait ? 0.15 : 0.35), 0);

    const bottomScale = topScale * (portrait ? 0.62 : 0.7);
    bottomBranch.scale.setScalar(bottomScale);
    bottomBranch.position.set(-view.halfW - 0.4, -view.halfH + (portrait ? 0.1 : 0.3), -0.5);

    glow.position.set(view.halfW * 0.55, view.halfH * 0.55, 2.5);

    sparkleSeeds.forEach(([x, y, z], i) => {
      sparklePositions[i * 3] = x * view.halfW;
      sparklePositions[i * 3 + 1] = y * view.halfH;
      sparklePositions[i * 3 + 2] = z;
    });
    sparkleGeometry.attributes.position.needsUpdate = true;

    if (fallState.length === 0) {
      for (let i = 0; i < fallingCount; i += 1) {
        const state = {};
        resetFallingPetal(state, true);
        fallState.push(state);
      }
    }
  }

  // --- Animation -----------------------------------------------------------
  const clock = new Clock();
  const pointer = { x: 0, y: 0 };
  let frameId = 0;
  let elapsed = 0;

  function updateFalling(delta) {
    for (let i = 0; i < fallingCount; i += 1) {
      const s = fallState[i];
      s.y -= s.speed * delta;
      s.x += (Math.sin(elapsed * s.sway + s.phase) * 0.35 + 0.12) * delta;
      if (s.y < -view.halfH - 1.2 || s.x > view.halfW + 2.5) resetFallingPetal(s, false);

      dummy.position.set(s.x, s.y, s.z);
      dummy.rotation.set(elapsed * s.spinX + s.phase, elapsed * s.spinY, Math.sin(elapsed * 0.6 + s.phase) * 0.8);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      falling.setMatrixAt(i, dummy.matrix);
    }
    falling.instanceMatrix.needsUpdate = true;
  }

  function renderFrame(delta) {
    elapsed += delta;

    // Gentle breeze sway + floating.
    topBranch.rotation.z = Math.sin(elapsed * 0.45) * 0.025;
    topBranch.rotation.x = Math.sin(elapsed * 0.3) * 0.04;
    bottomBranch.rotation.z = Math.PI + Math.sin(elapsed * 0.4 + 1) * 0.02;
    sparkles.rotation.y = Math.sin(elapsed * 0.05) * 0.15;
    sparkles.position.y = Math.sin(elapsed * 0.25) * 0.15;
    sparkleMaterial.opacity = 0.65 + Math.sin(elapsed * 1.3) * 0.25;
    glow.intensity = 16 + Math.sin(elapsed * 0.8) * 4;

    // Subtle parallax (pointer on desktop, slow drift on touch).
    const targetX = isCoarsePointer ? Math.sin(elapsed * 0.15) * 0.35 : pointer.x * 0.7;
    const targetY = isCoarsePointer ? Math.cos(elapsed * 0.12) * 0.2 : pointer.y * 0.45;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    updateFalling(delta);
    renderer.render(scene, camera);
  }

  function loop() {
    frameId = requestAnimationFrame(loop);
    renderFrame(Math.min(clock.getDelta(), 0.05));
  }

  function start() {
    if (frameId || reducedMotion) return;
    clock.getDelta();
    loop();
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  const onVisibility = () => (document.hidden ? stop() : start());
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
  };
  const resizeObserver = new ResizeObserver(() => {
    layout();
    if (reducedMotion) renderFrame(0);
  });

  layout();
  resizeObserver.observe(canvas.parentElement ?? canvas);
  document.addEventListener('visibilitychange', onVisibility);
  if (!isCoarsePointer) window.addEventListener('pointermove', onPointerMove, { passive: true });

  if (reducedMotion) {
    updateFalling(0);
    renderFrame(0);
  } else {
    start();
  }

  return {
    dispose() {
      stop();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
      [branchMaterial, petalMaterial, centerMaterial, budMaterial, fallingMaterial, sparkleMaterial].forEach((m) => m.dispose());
      sparkleTexture.dispose();
      renderer.dispose();
    },
  };
}
