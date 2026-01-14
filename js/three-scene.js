import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const MODEL_URL = "./assets/img/3D_logo.glb";
const MOBILE_BREAKPOINT = 900;

export function initThreeScene() {
  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  const canvas = document.getElementById("c");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 1000);

  let model = null;
  let orbitRadius = 4;

  const BASE_ROT_X = THREE.MathUtils.degToRad(-18);
  const BASE_ROT_Y = THREE.MathUtils.degToRad(28);
  const BASE_ROT_Z = THREE.MathUtils.degToRad(-6);

  function getHostRect() {
    const host = document.querySelector(".hero-3d") || document.querySelector(".hero3d") || document.body;
    return host.getBoundingClientRect();
  }

  function setSize() {
    const rect = getHostRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);

    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    if (model) fitCameraToObject(model);
  }

  window.addEventListener("resize", setSize);
  setSize();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 1.0).texture;

  function makeSoftboxTexture(w = 512, h = 256) {
    const cvs = document.createElement("canvas");
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext("2d");

    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.97)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  function makeSoftboxPanel(width, height, intensity) {
    const geo = new THREE.PlaneGeometry(width, height);
    const map = makeSoftboxTexture(1024, 512);
    const mat = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      opacity: intensity,
      depthWrite: false,
      toneMapped: false,
    });
    return new THREE.Mesh(geo, mat);
  }

  const lightRig = new THREE.Group();
  scene.add(lightRig);

  const boxKey = makeSoftboxPanel(14, 8, 0.8);
  const boxBottomFront = makeSoftboxPanel(18, 10, 1.15);
  const boxTop = makeSoftboxPanel(24, 5, 0.22);
  const boxLeft = makeSoftboxPanel(16, 9, 0.34);
  const boxRight = makeSoftboxPanel(16, 9, 0.26);
  const boxRimTop = makeSoftboxPanel(8, 3, 0.9);
  const boxRimBottom = makeSoftboxPanel(8, 3, 0.95);

  lightRig.add(boxKey, boxBottomFront, boxTop, boxLeft, boxRight, boxRimTop, boxRimBottom);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.18);
  dirLight.position.set(-1.5, -2.5, 4.5);
  scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x070707, 0.08);
  scene.add(hemiLight);

  function positionSoftboxes() {
    lightRig.position.copy(camera.position);
    lightRig.quaternion.copy(camera.quaternion);

    const d = orbitRadius;
    const frontZ = -d * 0.75;

    boxKey.position.set(-0.5, -0.15, frontZ * 0.8);
    boxKey.lookAt(0, -0.05, 0);

    boxBottomFront.position.set(0.1, -d * 0.48, frontZ * 0.7);
    boxBottomFront.lookAt(0, -0.15, 0);

    boxTop.position.set(0.1, d * 0.9, frontZ * 0.95);
    boxTop.lookAt(0, 0.3, 0);

    boxLeft.position.set(-d * 0.9, 0.05, frontZ * 0.9);
    boxLeft.lookAt(0, 0.05, 0);
    boxLeft.rotation.y = THREE.MathUtils.degToRad(20);

    boxRight.position.set(d * 0.85, 0.15, frontZ * 0.9);
    boxRight.lookAt(0, 0.0, 0);
    boxRight.rotation.y = THREE.MathUtils.degToRad(-16);

    boxRimTop.position.set(d * 0.25, d * 0.8, frontZ - d * 0.3);
    boxRimTop.lookAt(0, 0.35, 0);

    boxRimBottom.position.set(-d * 0.3, -d * 0.85, frontZ - d * 0.25);
    boxRimBottom.lookAt(0, -0.1, 0);
  }

  function fitCameraToObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);

    const center = new THREE.Vector3();
    box.getCenter(center);

    if (!obj.userData._centered) {
      obj.position.sub(center);
      obj.userData._centered = true;
    }

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);

    const zoomOut = isMobile() ? 2.15 : 1.15;
    const dist = (maxDim / 2 / Math.tan(fov / 2)) * zoomOut;

    orbitRadius = dist;

    const camY = isMobile() ? 0.25 : 0.55;

    camera.position.set(0, camY, dist);
    camera.lookAt(0, 0, 0);

    camera.near = dist / 100;
    camera.far = dist * 100;
    camera.updateProjectionMatrix();

    positionSoftboxes();
  }

  new GLTFLoader().load(MODEL_URL, (gltf) => {
    model = gltf.scene;

    const logoMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff5a1a,
      metalness: 0.55,
      roughness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      specularIntensity: 1.45,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.25,
      side: THREE.FrontSide,
    });

    model.traverse((o) => {
      if (o.isMesh) o.material = logoMaterial;
    });

    model.rotation.set(BASE_ROT_X, BASE_ROT_Y, BASE_ROT_Z);
    scene.add(model);
    setSize();
    fitCameraToObject(model);
  });

  let tgtX = 0,
    tgtY = 0,
    curX = 0,
    curY = 0;

  // Smoother easing for more fluid rotation
  const EASE = 0.12; // Reduced for smoother motion
  const MAX_X = THREE.MathUtils.degToRad(22); // Slightly reduced range
  const MAX_Y = THREE.MathUtils.degToRad(32);

  // Scroll-based rotation control
  let isScrolling = false;
  let scrollTimeout = null;
  let lastScrollY = window.scrollY;
  const SCROLL_RESET_DELAY = 150; // ms to wait before re-enabling mouse rotation

  function setStaticRotation() {
    tgtX = 0;
    tgtY = 0;
  }

  // Smooth reset rotation during scroll
  function handleScroll() {
    isScrolling = true;

    // Reset target rotation towards base when scrolling
    tgtX = 0;
    tgtY = 0;

    // Clear previous timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Set timeout to re-enable mouse-based rotation after scrolling stops
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      lastScrollY = window.scrollY;
    }, SCROLL_RESET_DELAY);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  function canHoverRotate() {
    return !isMobile() && !isScrolling && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function onPointerMove(e) {
    // Don't update rotation if scrolling or on mobile
    if (isScrolling || isMobile()) return;

    const rect = getHostRect();

    // Only respond to pointer if it's within or near the hero area
    const isNearHero = e.clientY < rect.bottom + 100;
    if (!isNearHero) {
      tgtX = 0;
      tgtY = 0;
      return;
    }

    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    const nx = x * 2 - 1;
    const ny = y * 2 - 1;
    tgtY = nx * MAX_Y;
    tgtX = ny * MAX_X;
  }

  function syncPointerListener() {
    if (canHoverRotate()) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    } else {
      window.removeEventListener("pointermove", onPointerMove);
      setStaticRotation();
    }
  }

  syncPointerListener();
  window.addEventListener("resize", syncPointerListener);

  renderer.setAnimationLoop(() => {
    if (model) {
      // Smooth interpolation with even smoother easing
      curX += (tgtX - curX) * EASE;
      curY += (tgtY - curY) * EASE;

      // Apply rotation with base values
      model.rotation.x = BASE_ROT_X + curX;
      model.rotation.y = BASE_ROT_Y + curY;
      model.rotation.z = BASE_ROT_Z;
    }
    positionSoftboxes();
    renderer.render(scene, camera);
  });
}
