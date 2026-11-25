import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface DeskPropGroup {
  group: THREE.Group;
  clickable: THREE.Object3D;
}

export interface BobbleheadProp extends DeskPropGroup {
  head: THREE.Group;
}

export interface TurntableProp extends DeskPropGroup {
  record: THREE.Group;
  tonearmGroup: THREE.Group;
  ledMaterial: THREE.MeshBasicMaterial;
  labelTexture: THREE.CanvasTexture;
  drawLabel: (accentHex?: string, isPlaying?: boolean) => void;
}

/** Deterministic light oak grain for the work desk surface. */
export function createOakTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext('2d');
  if (!context) return new THREE.CanvasTexture(canvas);

  let seed = 7;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  context.fillStyle = '#E3D9C7';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 26; index += 1) {
    const y = random() * canvas.height;
    const band = context.createLinearGradient(0, y - 60, 0, y + 60);
    const tone = random() > 0.5 ? '255,245,225' : '150,115,75';
    band.addColorStop(0, `rgba(${tone},0)`);
    band.addColorStop(0.5, `rgba(${tone},${0.05 + random() * 0.07})`);
    band.addColorStop(1, `rgba(${tone},0)`);
    context.fillStyle = band;
    context.fillRect(0, y - 60, canvas.width, 120);
  }

  for (let index = 0; index < 340; index += 1) {
    const y0 = random() * canvas.height;
    const amplitude = 2 + random() * 9;
    const frequency = 0.0015 + random() * 0.003;
    const phase = random() * 10;
    context.strokeStyle = `rgba(${110 + random() * 40},${80 + random() * 30},${50 + random() * 20},${0.035 + random() * 0.09})`;
    context.lineWidth = 0.6 + random() * 2.4;
    context.beginPath();
    for (let x = 0; x <= canvas.width; x += 12) {
      const y = y0 + Math.sin(x * frequency + phase) * amplitude;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function cylinderBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
): THREE.Mesh {
  const delta = new THREE.Vector3().subVectors(end, start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, delta.length(), 8),
    material,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
  return mesh;
}

export function createBlueSpeaker(): DeskPropGroup {
  const group = new THREE.Group();
  group.position.set(-0.59, 0.169, 0.245);

  const blue = new THREE.MeshStandardMaterial({ color: 0x183b62, roughness: 0.33, metalness: 0.12 });
  const seam = new THREE.MeshStandardMaterial({ color: 0x10283f, roughness: 0.42, metalness: 0.22 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf7f7f3, roughness: 0.28, metalness: 0.04 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.062, 32, 24), blue);
  body.position.y = 0.061;
  body.scale.set(1, 0.92, 1);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const baseBand = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.003, 8, 32), seam);
  baseBand.rotation.x = Math.PI / 2;
  baseBand.position.y = 0.035;
  group.add(baseBand);

  const topPad = new THREE.Mesh(new THREE.SphereGeometry(0.032, 24, 16), white);
  topPad.position.y = 0.113;
  topPad.scale.set(1, 0.22, 1);
  group.add(topPad);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.003, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0x54e1d4 }),
  );
  led.position.set(0.045, 0.077, 0.04);
  group.add(led);

  return { group, clickable: group };
}

export function createBobblehead(): BobbleheadProp {
  const group = new THREE.Group();
  group.position.set(-0.405, 0.169, -0.19);
  group.rotation.y = -0.18;

  const skin = new THREE.MeshStandardMaterial({ color: 0xe8bd8f, roughness: 0.74 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x9b3340, roughness: 0.75 });
  const sash = new THREE.MeshStandardMaterial({ color: 0x315f42, roughness: 0.7 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x4e7844, roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x27231f, roughness: 0.7 });

  const base = new THREE.Mesh(new RoundedBoxGeometry(0.062, 0.009, 0.055, 2, 0.004), dark);
  base.position.y = 0.005;
  base.castShadow = true;
  group.add(base);

  const torso = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.053, 0.036, 3, 0.01), shirt);
  torso.position.y = 0.041;
  torso.castShadow = true;
  group.add(torso);

  const sashBand = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.009, 0.038), sash);
  sashBand.position.set(0, 0.044, 0.001);
  sashBand.rotation.z = -0.12;
  group.add(sashBand);

  const feet = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.012, 0.034), dark);
  feet.position.set(0, 0.014, 0.002);
  group.add(feet);

  const neckSpringCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 29 }, (_, index) => {
      const t = index / 28;
      const angle = t * Math.PI * 10;
      const radius = 0.004;
      return new THREE.Vector3(Math.cos(angle) * radius, 0.068 + t * 0.025, Math.sin(angle) * radius);
    }),
  );
  const neckSpring = new THREE.Mesh(new THREE.TubeGeometry(neckSpringCurve, 64, 0.0013, 5, false), dark);
  group.add(neckSpring);

  const head = new THREE.Group();
  head.position.set(0, 0.094, 0);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.031, 24, 18), skin);
  face.scale.set(0.95, 1.02, 0.9);
  face.position.y = 0.027;
  face.castShadow = true;
  head.add(face);

  const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 24, 16), hair);
  fringe.scale.set(1.03, 0.48, 0.92);
  fringe.position.set(0, 0.047, -0.003);
  head.add(fringe);

  for (let spike = 0; spike < 7; spike += 1) {
    const angle = (spike / 7) * Math.PI * 2;
    const hairSpike = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.027, 5), hair);
    hairSpike.position.set(Math.cos(angle) * 0.021, 0.061 + (spike % 2) * 0.004, Math.sin(angle) * 0.018 - 0.002);
    hairSpike.rotation.z = -Math.cos(angle) * 0.58;
    hairSpike.rotation.x = Math.sin(angle) * 0.5;
    head.add(hairSpike);
  }

  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1b1a18 });
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0024, 8, 8), eyeMaterial);
    eye.position.set(side * 0.01, 0.028, 0.0275);
    head.add(eye);
  });

  group.add(head);

  const armMaterial = new THREE.MeshStandardMaterial({ color: 0xd8ad83, roughness: 0.75 });
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), armMaterial);
    arm.scale.set(1, 0.65, 0.72);
    arm.position.set(side * 0.027, 0.047, 0.001);
    group.add(arm);
  });

  return { group, head, clickable: group };
}

export function createTurntable(): TurntableProp {
  const group = new THREE.Group();
  // Compact miniature tabletop vinyl deck sized cleanly next to the lamp & phone
  group.position.set(0.53, 0.169, 0.165);
  group.rotation.y = -0.14;

  const walnut = new THREE.MeshStandardMaterial({ color: 0x633a22, roughness: 0.56, metalness: 0.05 });
  const topGrey = new THREE.MeshStandardMaterial({ color: 0x9ea4ab, roughness: 0.44, metalness: 0.18 });
  const black = new THREE.MeshStandardMaterial({ color: 0x050507, roughness: 0.58, metalness: 0.06 });
  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0b0c10, roughness: 0.52, metalness: 0.12 });
  const platterMat = new THREE.MeshStandardMaterial({ color: 0x090a0d, roughness: 0.55, metalness: 0.1 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xe6e6e4, roughness: 0.18, metalness: 0.9 });

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 256;
  const lCtx = labelCanvas.getContext('2d');
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;

  const drawLabel = (accentHex = '#111318', isPlaying = false) => {
    if (!lCtx) return;
    lCtx.clearRect(0, 0, 256, 256);
    lCtx.fillStyle = accentHex;
    lCtx.fillRect(0, 0, 256, 256);

    lCtx.fillStyle = '#090a0d';
    lCtx.beginPath();
    lCtx.arc(128, 128, 108, 0, Math.PI * 2);
    lCtx.fill();

    lCtx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    lCtx.lineWidth = 4;
    lCtx.beginPath();
    lCtx.arc(128, 128, 86, 0, Math.PI * 2);
    lCtx.stroke();

    lCtx.fillStyle = '#181a20';
    lCtx.beginPath();
    lCtx.arc(128, 128, 34, 0, Math.PI * 2);
    lCtx.fill();

    lCtx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    if (isPlaying) {
      lCtx.fillRect(120, 118, 5, 20);
      lCtx.fillRect(131, 118, 5, 20);
    } else {
      lCtx.beginPath();
      lCtx.moveTo(123, 117);
      lCtx.lineTo(138, 128);
      lCtx.lineTo(123, 139);
      lCtx.closePath();
      lCtx.fill();
    }
    labelTexture.needsUpdate = true;
  };
  drawLabel('#090a0d', false);

  const labelMat = new THREE.MeshStandardMaterial({ map: labelTexture, roughness: 0.58, metalness: 0.05 });

  // Slim walnut plinth outer casing (0.138 x 0.020 x 0.114)
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(0.138, 0.020, 0.114, 3, 0.005), walnut);
  plinth.position.y = 0.010;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Matte light-grey top deck plate inset cleanly inside wooden rim
  const topPlate = new THREE.Mesh(new RoundedBoxGeometry(0.128, 0.003, 0.104, 2, 0.003), topGrey);
  topPlate.position.y = 0.0202;
  topPlate.receiveShadow = true;
  group.add(topPlate);

  // Thin platter base rim (deep black)
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.002, 48), platterMat);
  platter.position.set(-0.015, 0.0222, 0.001);
  platter.receiveShadow = true;
  group.add(platter);

  // Spinning miniature black vinyl record group
  const record = new THREE.Group();
  record.position.set(-0.015, 0.0242, 0.001);
  const vinyl = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.043, 0.0025, 56), black);
  vinyl.castShadow = true;
  record.add(vinyl);

  for (let ring = 0; ring < 4; ring += 1) {
    const groove = new THREE.Mesh(new THREE.TorusGeometry(0.020 + ring * 0.0052, 0.0003, 4, 48), grooveMat);
    groove.rotation.x = Math.PI / 2;
    groove.position.y = 0.0015;
    record.add(groove);
  }

  const centerLabel = new THREE.Mesh(new THREE.CircleGeometry(0.0145, 32), labelMat);
  centerLabel.rotation.x = -Math.PI / 2;
  centerLabel.position.y = 0.0016;
  record.add(centerLabel);

  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.0045, 10), chrome);
  spindle.position.y = 0.0032;
  record.add(spindle);
  group.add(record);

  // Compact tonearm rest post on right deck edge
  const armRest = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0026, 0.006, 10), black);
  armRest.position.set(0.047, 0.0245, 0.022);
  group.add(armRest);

  // Articulated Tonearm Group (compact sleek chrome arm on right side)
  const tonearmGroup = new THREE.Group();
  tonearmGroup.position.set(0.047, 0.0235, -0.036);
  tonearmGroup.rotation.y = 0.14;

  const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.0048, 0.0054, 0.006, 18), black);
  pivotCap.position.y = 0.003;
  tonearmGroup.add(pivotCap);

  const armRod = cylinderBetween(
    new THREE.Vector3(0, 0.0062, -0.003),
    new THREE.Vector3(-0.008, 0.0062, 0.056),
    0.0013,
    chrome,
  );
  tonearmGroup.add(armRod);

  const cartridge = new THREE.Mesh(new RoundedBoxGeometry(0.0065, 0.0035, 0.011, 1, 0.001), black);
  cartridge.position.set(-0.008, 0.0048, 0.058);
  cartridge.rotation.y = -0.25;
  tonearmGroup.add(cartridge);
  group.add(tonearmGroup);

  // Signature small glowing status LED dot in bottom-left corner of grey top plate
  const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  const cueLed = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.0015, 16), ledMaterial);
  cueLed.position.set(-0.050, 0.0222, 0.038);
  group.add(cueLed);

  return { group, record, tonearmGroup, ledMaterial, labelTexture, drawLabel, clickable: group };
}
