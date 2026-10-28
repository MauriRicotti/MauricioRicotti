/**
 * Lanyard (credencial 3D colgante) — de React Bits, por David Haz
 * https://reactbits.dev/components/lanyard · Licencia MIT + Commons Clause
 * Física sin cambios. Perfil liviano automático en móviles/GPUs por software. Cambios del portfolio (marcados con "(Portfolio)"): resolución nítida hasta 2x,
 * rango de profundidad de la cámara (evita parpadeos en celulares),
 * props anchorX / cardTop (posición exacta) y passThrough (el lienzo deja pasar los clics). Solo depende de "three".
 * Se usa desde HeroBadge.tsx (prepara la GPU oculta antes de soltar la caída).
 */

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import * as THREE from 'three';

type Orientation = 'portrait' | 'landscape';
type Finish = 'glossy' | 'matte' | 'holographic' | 'metallic';
type Metal = 'graphite' | 'silver' | 'gold';
type Anchor = 'left' | 'center' | 'right';
type ImageFit = 'cover' | 'contain';
type Rgb = [number, number, number];
type Point = { clientX: number; clientY: number };
type ArtSource = string | HTMLCanvasElement;
type ArtImage = HTMLImageElement | HTMLCanvasElement;

interface PathLike {
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): unknown;
}

export interface LanyardProps {
  frontImage?: ArtSource;
  backImage?: ArtSource;
  imageFit?: ImageFit;
  cardColor?: string;
  orientation?: Orientation;
  finish?: Finish;
  cornerRadius?: number;
  size?: number;
  anchor?: Anchor;
  strapLength?: number;
  strapImage?: ArtSource;
  strapColor?: string;
  strapWidth?: number;
  metal?: Metal;
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  /** (Portfolio) instante mínimo de entrada (performance.now), tras preparar la GPU. */
  revealAt?: number;
  /** (Portfolio) posición horizontal del enganche, 0–1 del ancho (reemplaza `anchor`) */
  anchorX?: number;
  /** (Portfolio) borde superior de la tarjeta en reposo, 0–1 del alto (reemplaza el cálculo con `strapLength`) */
  cardTop?: number;
  /** (Portfolio) el lienzo deja pasar los clics: solo atrapa el puntero cuando está sobre la tarjeta */
  passThrough?: boolean;
  /** (Portfolio) se llama al agarrar/tocar la tarjeta (para el sonido metálico) */
  onGrab?: () => void;
  className?: string;
  style?: CSSProperties;
}

interface Settings {
  frontImage?: ArtSource;
  backImage?: ArtSource;
  imageFit: ImageFit;
  cardColor: string;
  orientation: Orientation;
  finish: Finish;
  cornerRadius: number;
  size: number;
  anchor: Anchor;
  strapLength: number;
  strapImage?: ArtSource;
  strapColor: string;
  strapWidth: number;
  metal: Metal;
  gravity: number;
  damping: number;
  elasticity: number;
  breeze: number;
  interactive: boolean;
  anchorX?: number;
  cardTop?: number;
  passThrough: boolean;
  intro: boolean;
}

interface Images {
  front: ArtImage | null;
  back: ArtImage | null;
  strap: ArtImage | null;
}

interface CardLayout {
  width: number;
  height: number;
  radius: number;
  slot: { width: number; height: number; y: number };
  ringY: number;
  hangY: number;
}

interface FinishLook {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  foil: number;
  anisotropy: number;
}

interface Body {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  velocity: THREE.Vector3;
  quaternion: THREE.Quaternion;
  previousQuaternion: THREE.Quaternion;
  angular: THREE.Vector3;
  mass: number;
  inverseInertia: THREE.Vector3;
  hang: THREE.Vector3;
}

interface Grab {
  local: THREE.Vector3;
  rotation: THREE.Quaternion;
  reach: number;
  from: THREE.Vector3;
  target: THREE.Vector3;
}

interface Simulation {
  nodes: THREE.Vector3[];
  previous: THREE.Vector3[];
  velocities: THREE.Vector3[];
  lengths: Float64Array;
  impulses: Float64Array;
  rest: number;
  anchor: THREE.Vector3;
  body: Body;
  grab: Grab | null;
  turn: number;
  twist: number;
  twistRaw: number;
  calm: number;
}

interface Physics {
  gravity: number;
  hold: number;
  stiffness: number;
  spring: number;
  bandDamping: number;
  linearDrag: number;
  angularDrag: number;
  air: number;
  broadside: number;
  spinAir: number;
  nodeDrag: number;
  nodeAir: number;
  twist: number;
  twistDamping: number;
  grip: number;
  gripDamping: number;
  breeze: number;
}

interface Applied {
  layoutKey?: string;
  framingKey?: string;
  imageSources?: (ArtSource | undefined)[];
  faceKey?: string;
  strapColor?: string;
  strapScale?: number;
}

interface Press {
  x: number;
  y: number;
  time: number;
  point: THREE.Vector3;
}

const CARD_SIZES: Record<string, [number, number]> = {
  portrait: [1.6, 2.25],
  landscape: [2.25, 1.6]
};
const ANCHORS: Record<string, number> = { left: 0.27, center: 0.5, right: 0.73 };
const THICKNESS = 0.018;
const BEVEL = 0.007;
const JOINTS = 4;
const NODE_WEIGHT = 1 / 0.05;
const MAX_STEP = 1 / 960;
const ITERATIONS = 2;
const SAMPLES = 72;
const FOV = 24;
const STRAP_WIDTH = 0.36;
const RING_RADIUS = 0.095;
const RING_TUBE = 0.0135;
const EYELET_RADIUS = 0.036;
const CLAMP_BODY = 0.15;
const FACE_WIDTH = 1024;

const FINISHES: Record<string, FinishLook> = {
  glossy: { roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, foil: 0, anisotropy: 0 },
  matte: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, foil: 0, anisotropy: 0 },
  holographic: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, foil: 1, anisotropy: 0 },
  metallic: { roughness: 0.36, metalness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.18, foil: 0, anisotropy: 0.7 }
};

const BAND_COLUMNS = [0, 0.07, 0.93, 1];
const BAND_BEND = [-0.95, -0.28, 0.28, 0.95];
const FLIP_SPIN = 9;

const FOIL_VERTEX_HEAD = `
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`;

const FOIL_VERTEX_BODY = `
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
`;

const FOIL_FRAGMENT_HEAD = `
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;

float foilHash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float foilBump(float t, float center, float width) {
  float x = (t - center) / width;
  return max(0.0, 1.0 - x * x);
}

vec3 foilSpectrum(float t) {
  return vec3(
    foilBump(t, 0.82, 0.32) + 0.4 * foilBump(t, 0.02, 0.12),
    foilBump(t, 0.5, 0.26),
    foilBump(t, 0.18, 0.24)
  );
}

vec3 foilGrating(float u, float spacing) {
  vec3 color = vec3(0.0);
  for (int m = 1; m <= 2; m++) {
    float order = float(m);
    float t = (spacing * abs(u) / order - 0.38) / 0.32;
    color += foilSpectrum(t) / order;
  }
  return color;
}

vec3 foilShard(vec2 p) {
  vec2 base = floor(p);
  float best = 9.0;
  float edge = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 site = cell + vec2(foilHash(cell), foilHash(cell + 7.31)) * 0.9 + 0.05;
      float d = length(site - p);
      if (d < best) {
        edge = best;
        best = d;
        id = cell;
      } else if (d < edge) {
        edge = d;
      }
    }
  }
  return vec3(foilHash(id + 3.17), foilHash(id + 11.73), edge - best);
}
`;

const FOIL_FRAGMENT_BODY = `
if (foilStrength > 0.0) {
  vec3 foilView = normalize(vViewPosition);
  vec3 foilNormal = normalize(normal);
  vec2 foilP = vec2(vFoilUv.x, vFoilUv.y * foilAspect);
  vec3 shard = foilShard(foilP * 26.0);
  vec2 ray = foilP - vec2(-1.6, 2.6 * foilAspect);
  float angle = atan(ray.y, ray.x) + (shard.x - 0.5) * 0.16;
  vec3 grating = normalize(vFoilX * cos(angle) + vFoilY * sin(angle));
  float spacing = 1.7 * (0.95 + shard.y * 0.1);
  vec3 rainbow = foilGrating(dot(foilKey + foilView, grating), spacing);
  rainbow += 0.6 * foilGrating(dot(foilTop + foilView, grating), spacing);
  rainbow *= 0.8 + 0.2 * smoothstep(0.0, 0.04, shard.z);
  rainbow = max(rainbow - 0.35 * min(rainbow.r, min(rainbow.g, rainbow.b)), 0.0);
  vec2 grid = foilP * 64.0;
  vec2 cell = floor(grid);
  vec2 jitter = vec2(foilHash(cell + 1.7), foilHash(cell + 9.2));
  float flake = smoothstep(0.32, 0.06, length(fract(grid) - jitter * 0.6 - 0.2)) * step(0.45, foilHash(cell + 4.4));
  vec3 facet = normalize(foilNormal + (vFoilX * (jitter.x - 0.5) + vFoilY * (jitter.y - 0.5)) * 0.8);
  float glint = pow(max(dot(reflect(-foilKey, facet), foilView), 0.0), 28.0);
  glint += 0.7 * pow(max(dot(reflect(-foilTop, facet), foilView), 0.0), 28.0);
  float fine = 1.0 - smoothstep(0.35, 0.9, max(fwidth(grid.x), fwidth(grid.y)));
  vec3 sparkle = flake * glint * fine * (vec3(0.7) + foilGrating(dot(foilKey + foilView, grating) + jitter.x * 0.4, spacing));
  float ink = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float foil = foilStrength * (0.08 + 0.92 * smoothstep(0.04, 0.7, ink));
  float facing = clamp(dot(foilNormal, foilView), 0.0, 1.0);
  float tint = clamp(dot(rainbow, vec3(0.4)), 0.0, 1.0);
  outgoingLight = outgoingLight * (1.0 - foil * (0.3 + 0.32 * tint)) + (rainbow * 0.62 * (0.4 + 0.6 * facing) + sparkle * 1.6) * foil;
}
`;

const METALS: Record<string, { color: string; roughness: number }> = {
  silver: { color: '#d9dce2', roughness: 0.16 },
  gold: { color: '#e4b965', roughness: 0.2 },
  graphite: { color: '#4d4f55', roughness: 0.28 }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const parseColor = (value: string, fallback: Rgb): Rgb => {
  try {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return fallback;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = value;
    const resolved = ctx.fillStyle;
    if (resolved.startsWith('#')) {
      const n = parseInt(resolved.slice(1), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    const parts = resolved.match(/[\d.]+/g);
    if (!parts || parts.length < 3) return fallback;
    return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
  } catch {
    return fallback;
  }
};

const luminance = (rgb: Rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
const toCss = (rgb: Rgb, alpha = 1) =>
  `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${alpha})`;

const seeded = (start: number) => {
  let state = start >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const traceRoundedRect = (path: PathLike, x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const k = r * 0.4477;
  path.moveTo(x + r, y);
  path.lineTo(x + width - r, y);
  path.bezierCurveTo(x + width - k, y, x + width, y + k, x + width, y + r);
  path.lineTo(x + width, y + height - r);
  path.bezierCurveTo(x + width, y + height - k, x + width - k, y + height, x + width - r, y + height);
  path.lineTo(x + r, y + height);
  path.bezierCurveTo(x + k, y + height, x, y + height - k, x, y + height - r);
  path.lineTo(x, y + r);
  path.bezierCurveTo(x, y + k, x + k, y, x + r, y);
};

// (Portfolio) sombra de la tarjeta: corrimiento (en unidades de la escena), opacidad y
// margen del dibujo (el plano es un poco más grande que la tarjeta para que entre el difuminado)
const SHADOW = { x: 0.2, y: -0.28, z: -0.5, opacity: 0.52 };
const SHADOW_SIZE = { w: 256, h: 360, pad: 56, blur: 20 };
const SHADOW_PAD = {
  x: (SHADOW_SIZE.w + SHADOW_SIZE.pad * 2) / SHADOW_SIZE.w,
  y: (SHADOW_SIZE.h + SHADOW_SIZE.pad * 2) / SHADOW_SIZE.h
};

const buildShadowTexture = () => {
  const { w, h, pad, blur } = SHADOW_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Truco compatible con todos los navegadores: se dibuja la forma fuera del lienzo y
    // solo su sombra (desplazada) cae adentro, ya difuminada.
    const off = 10000;
    ctx.shadowColor = '#fff'; // blanco: el color final lo pone el material
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = off;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pad - off, pad, w, h, 26);
    else ctx.rect(pad - off, pad, w, h);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const loadImage = (
  cache: Map<string, Promise<HTMLImageElement | null>>,
  url?: ArtSource
): Promise<ArtImage | null> => {
  if (!url) return Promise.resolve(null);
  if (typeof url !== 'string') return Promise.resolve(url);
  const cached = cache.get(url);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement | null>(resolve => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = async () => {
      // No dejar la decodificación PNG/WebP para el primer cuadro de la caída.
      try { await image.decode(); } catch { /* onload ya confirmó la imagen */ }
      resolve(image);
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
  cache.set(url, promise);
  return promise;
};

const cardLayout = (orientation: Orientation, cornerRadius: number): CardLayout => {
  const [width, height] = CARD_SIZES[orientation] || CARD_SIZES.portrait;
  const radius = mix(0.03, Math.min(width, height) * 0.2, clamp(cornerRadius, 0, 1));
  const slot = { width: 0.34, height: 0.07, y: height / 2 - 0.13 };
  const ringY = height / 2 - 0.055;
  return { width, height, radius, slot, ringY, hangY: ringY + RING_RADIUS };
};

const buildCardGeometry = (layout: CardLayout) => {
  const { width, height, radius, slot } = layout;
  const outline = new THREE.Shape();
  traceRoundedRect(
    outline,
    -width / 2 + BEVEL,
    -height / 2 + BEVEL,
    width - BEVEL * 2,
    height - BEVEL * 2,
    Math.max(radius - BEVEL, 0.005)
  );
  const hole = new THREE.Path();
  traceRoundedRect(
    hole,
    -slot.width / 2 - BEVEL,
    slot.y - slot.height / 2 - BEVEL,
    slot.width + BEVEL * 2,
    slot.height + BEVEL * 2,
    slot.height / 2 + BEVEL
  );
  outline.holes.push(hole);
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: THICKNESS,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 5,
    curveSegments: 24
  });
  body.translate(0, 0, -THICKNESS / 2);
  const face = new THREE.ShapeGeometry(outline, 24);
  const position = face.getAttribute('position');
  const uv = face.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height);
  }
  uv.needsUpdate = true;
  return { body, face };
};

const buildClampGeometry = (width: number) => {
  const shape = new THREE.Shape();
  const w = width * 1.16;
  traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 6,
    curveSegments: 10
  });
  geometry.translate(0, 0, -0.01);
  return geometry;
};

const buildBandGeometry = (count: number) => {
  const columns = BAND_COLUMNS.length;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * columns * 2), 2));
  const index: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    for (let c = 0; c < columns - 1; c++) {
      const a = i * columns + c;
      index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
    }
  }
  geometry.setIndex(index);
  return geometry;
};

const buildEnvironment = (renderer: THREE.WebGLRenderer) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0.035, 0.035, 0.04);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  const panel = (intensity: number, position: [number, number, number], scale: [number, number], rotation = 0) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    mesh.rotateZ(rotation);
    scene.add(mesh);
  };
  panel(2.6, [0, 4.5, 8], [9, 4]);
  panel(6, [-5.5, 0.5, 7], [0.9, 14]);
  panel(4, [5, -0.5, 8], [0.6, 14]);
  panel(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
  panel(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
  panel(1.4, [0, 6, -6], [12, 4]);
  panel(0.5, [0, -7, 1], [16, 6]);
  panel(0.9, [8, 0, -2], [4, 10]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  geometry.dispose();
  materials.forEach(material => material.dispose());
  return target;
};

/** Reflejos de estudio livianos: seis imágenes de 64px, sin generar PMREM en el teléfono. */
const buildBalancedEnvironment = () => {
  const faces = Array.from({ length: 6 }, (_, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, i === 2 ? '#bfc3c9' : '#33363c');
    gradient.addColorStop(0.5, '#15171c');
    gradient.addColorStop(1, '#08090c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = i < 2 ? '#f2ede4' : '#9d9fa3';
    ctx.fillRect(i % 2 ? 46 : 8, 4, i < 2 ? 7 : 4, 56);
    if (i === 4) { ctx.fillStyle = '#f2ede4'; ctx.fillRect(3, 9, 58, 8); }
    return canvas;
  });
  const texture = new THREE.CubeTexture(faces);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, dispose: () => texture.dispose() };
};

const makeCanvasTexture = (canvas: HTMLCanvasElement, anisotropy: number) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  return texture;
};

const buildGrainTexture = () => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const random = seeded(7);
  const field = Float32Array.from({ length: size * size }, () => random());
  const height = (x: number, y: number) => {
    let sum = 0;
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) sum += field[((y + j + size) % size) * size + ((x + i + size) % size)];
    }
    return (sum / 9) * 1.6;
  };
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = height((x - 1 + size) % size, y) - height((x + 1) % size, y);
      const ny = height(x, (y - 1 + size) % size) - height(x, (y + 1) % size);
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      image.data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      image.data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 7);
  return texture;
};

const buildWeaveTexture = () => {
  const size = 128;
  const threads = 8;
  const random = seeded(19);
  const fiber = Float32Array.from({ length: size * size }, () => random());
  const profile = (f: number) => Math.sqrt(Math.max(0, 1 - 4 * f * f));
  const height = (x: number, y: number) => {
    const px = ((x % size) + size) % size;
    const py = ((y % size) + size) % size;
    const u = (px / size) * threads;
    const v = (py / size) * threads;
    const cu = Math.floor(u);
    const cv = Math.floor(v);
    const fu = u - cu - 0.5;
    const fv = v - cv - 0.5;
    const lift = (cu + cv) % 2 === 0;
    const warp = profile(fu) * (0.55 + 0.45 * Math.cos(fv * Math.PI * (lift ? 1 : 0.6)));
    const weft = profile(fv) * (0.55 + 0.45 * Math.cos(fu * Math.PI * (lift ? 0.6 : 1)));
    return (lift ? Math.max(warp, weft * 0.7) : Math.max(weft, warp * 0.7)) + fiber[py * size + px] * 0.08;
  };
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (height(x - 1, y) - height(x + 1, y)) * 1.6;
      const ny = (height(x, y - 1) - height(x, y + 1)) * 1.6;
      const length = Math.hypot(nx, ny, 1);
      const i = (y * size + x) * 4;
      data[i] = ((nx / length) * 0.5 + 0.5) * 255;
      data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
};

const drawFitted = (
  ctx: CanvasRenderingContext2D,
  image: ArtImage,
  width: number,
  height: number,
  fit: ImageFit
) => {
  const scale = (fit === 'contain' ? Math.min : Math.max)(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
};

const paintFace = (canvas: HTMLCanvasElement, image: ArtImage | null, color: Rgb, fit: ImageFit) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (image) drawFitted(ctx, image, canvas.width, canvas.height, fit);
};

const paintStrap = (canvas: HTMLCanvasElement, image: ArtImage | null, color: Rgb, across = 192) => {
  const along = image ? Math.max(64, Math.round((image.width / image.height) * across)) : across * 2;
  canvas.width = across;
  canvas.height = along;
  const ctx = canvas.getContext('2d');
  if (!ctx) return along / across;
  ctx.fillStyle = toCss(color);
  ctx.fillRect(0, 0, across, along);
  if (image) {
    ctx.save();
    ctx.translate(across, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(image, 0, 0, along, across);
    ctx.restore();
    return along / across;
  }
  const ink: Rgb = luminance(color) > 0.5 ? [0, 0, 0] : [1, 1, 1];
  ctx.fillStyle = toCss(ink, 0.05);
  for (let y = 0; y < along; y += 4) ctx.fillRect(0, y, across, 1);
  ctx.fillStyle = toCss(ink, 0.2);
  for (let y = 0; y < along; y += 14) {
    ctx.fillRect(across * 0.075, y, 2, 8);
    ctx.fillRect(across * 0.925 - 2, y, 2, 8);
  }
  return along / across;
};

const createSimulation = (): Simulation => {
  const vectors = () => Array.from({ length: JOINTS + 1 }, () => new THREE.Vector3());
  return {
    nodes: vectors(),
    previous: vectors(),
    velocities: vectors(),
    lengths: new Float64Array(JOINTS),
    impulses: new Float64Array(JOINTS),
    rest: 1,
    anchor: new THREE.Vector3(),
    body: {
      position: new THREE.Vector3(),
      previous: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      previousQuaternion: new THREE.Quaternion(),
      angular: new THREE.Vector3(),
      mass: 1,
      inverseInertia: new THREE.Vector3(1, 1, 1),
      hang: new THREE.Vector3()
    },
    grab: null,
    turn: 0,
    twist: 0,
    twistRaw: 0,
    calm: 0
  };
};

const scratch = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  c: new THREE.Vector3(),
  d: new THREE.Vector3(),
  e: new THREE.Vector3(),
  f: new THREE.Vector3(),
  g: new THREE.Vector3(),
  pin: new THREE.Vector3(),
  q: new THREE.Quaternion(),
  r: new THREE.Quaternion()
};

const applyInverseInertia = (body: Body, vector: THREE.Vector3, out: THREE.Vector3) => {
  scratch.r.copy(body.quaternion).invert();
  out.copy(vector).applyQuaternion(scratch.r);
  out.set(out.x * body.inverseInertia.x, out.y * body.inverseInertia.y, out.z * body.inverseInertia.z);
  return out.applyQuaternion(body.quaternion);
};

const rotateBody = (q: THREE.Quaternion, w: THREE.Vector3) => {
  const { x: qx, y: qy, z: qz, w: qw } = q;
  q.x += 0.5 * (w.x * qw + w.y * qz - w.z * qy);
  q.y += 0.5 * (w.y * qw + w.z * qx - w.x * qz);
  q.z += 0.5 * (w.z * qw + w.x * qy - w.y * qx);
  q.w += 0.5 * (-w.x * qx - w.y * qy - w.z * qz);
  q.normalize();
};

const bodyWeight = (body: Body, r: THREE.Vector3, normal: THREE.Vector3) => {
  const rn = scratch.c.crossVectors(r, normal);
  return 1 / body.mass + rn.dot(applyInverseInertia(body, rn, scratch.d));
};

const pushBody = (body: Body, r: THREE.Vector3, impulse: THREE.Vector3) => {
  body.position.addScaledVector(impulse, 1 / body.mass);
  rotateBody(body.quaternion, applyInverseInertia(body, scratch.e.crossVectors(r, impulse), scratch.f));
};

const solveSegment = (sim: Simulation, i: number, h: number, physics: Physics) => {
  const { nodes, body } = sim;
  const a = nodes[i];
  const wa = i === 0 ? 0 : NODE_WEIGHT;
  const last = i === JOINTS - 1;
  const r = scratch.g;
  let b = nodes[i + 1];
  if (last) {
    r.copy(body.hang).applyQuaternion(body.quaternion);
    b = scratch.b.copy(body.position).add(r);
  }
  const delta = scratch.a.subVectors(b, a);
  const length = delta.length();
  const stretch = length - sim.rest;
  if (stretch <= 0 || length < 1e-9) return;
  const normal = delta.divideScalar(length);
  const wb = last ? bodyWeight(body, r, normal) : NODE_WEIGHT;
  const rate = (length - sim.lengths[i]) / h;
  const tension =
    physics.hold * Math.tanh((physics.stiffness * stretch) / physics.hold) +
    physics.spring * stretch +
    physics.bandDamping * Math.max(0, rate);
  const room = tension * h * h - sim.impulses[i];
  if (room <= 0) return;
  const lambda = Math.min(stretch / (wa + wb), room);
  sim.impulses[i] += lambda;
  if (wa) a.addScaledVector(normal, lambda * wa);
  if (last) pushBody(body, r, normal.multiplyScalar(-lambda));
  else b.addScaledVector(normal, -lambda * wb);
};

const solvePin = (body: Body, grab: Grab, target: THREE.Vector3) => {
  const r = scratch.g.copy(grab.local).applyQuaternion(body.quaternion);
  const delta = scratch.a.copy(target).sub(body.position).sub(r);
  const distance = delta.length();
  if (distance < 1e-9) return;
  const normal = delta.divideScalar(distance);
  const lambda = distance / bodyWeight(body, r, normal);
  pushBody(body, r, normal.multiplyScalar(lambda));
};

const placeHanging = (sim: Simulation, layout: CardLayout, intro: boolean) => {
  const { nodes, previous, velocities, body, anchor } = sim;
  nodes[0].copy(anchor);
  for (let i = 1; i <= JOINTS; i++) {
    nodes[i].copy(nodes[i - 1]);
    if (intro) nodes[i].x += sim.rest;
    else nodes[i].y -= sim.rest;
  }
  body.quaternion.identity();
  if (intro) body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  body.hang.set(0, layout.hangY, 0);
  const offset = scratch.a.copy(body.hang).applyQuaternion(body.quaternion);
  body.position.copy(nodes[JOINTS]).sub(offset);
  body.previous.copy(body.position);
  body.previousQuaternion.copy(body.quaternion);
  body.velocity.set(0, 0, 0);
  body.angular.set(0, 0, 0);
  for (let i = 0; i <= JOINTS; i++) {
    previous[i].copy(nodes[i]);
    velocities[i].set(0, 0, 0);
  }
  sim.lengths.fill(sim.rest);
  sim.turn = 0;
  sim.twist = 0;
  sim.twistRaw = 0;
  sim.calm = 0;
};

const configureSimulation = (sim: Simulation, layout: CardLayout, length: number) => {
  sim.rest = length / JOINTS;
  const { width, height } = layout;
  const body = sim.body;
  const t = THICKNESS + BEVEL * 2;
  body.mass = 1;
  body.inverseInertia.set(
    12 / (height * height + t * t),
    12 / (width * width + t * t),
    12 / (width * width + height * height)
  );
  body.hang.set(0, layout.hangY, 0);
};

const stepSimulation = (sim: Simulation, dt: number, physics: Physics, time: number) => {
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-6));
  const h = dt / steps;
  const { nodes, previous, velocities, body } = sim;
  const windX = physics.breeze * (Math.sin(time * 0.53) * 0.7 + Math.sin(time * 1.31 + 1.7) * 0.3) * 3;
  const windZ = physics.breeze * Math.sin(time * 0.37 + 0.6) * 2;
  const grab = sim.grab;
  const pin = scratch.pin;
  const nodeDrag = Math.exp(-physics.nodeDrag * h);
  const linearDrag = Math.exp(-physics.linearDrag * h);
  const angularDrag = Math.exp(-physics.angularDrag * h);

  for (let s = 0; s < steps; s++) {
    for (let i = 1; i < JOINTS; i++) {
      const v = velocities[i];
      v.y -= physics.gravity * h;
      v.x += windX * h;
      v.z += windZ * h;
      previous[i].copy(nodes[i]);
      nodes[i].addScaledVector(v, h);
    }

    body.previous.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    const q = body.quaternion;
    if (grab) {
      const turn = scratch.q.copy(grab.rotation).multiply(scratch.r.copy(q).invert());
      if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
      const torque = scratch.a.set(turn.x, turn.y, turn.z).multiplyScalar(2 * physics.grip);
      torque.addScaledVector(body.angular, -physics.gripDamping);
      body.angular.addScaledVector(applyInverseInertia(body, torque, scratch.b), h);
    }
    const up = scratch.a.set(0, 1, 0).applyQuaternion(q);
    const front = scratch.b.set(-up.x * up.z, -up.y * up.z, 1 - up.z * up.z);
    if (front.lengthSq() > 1e-3) {
      const facing = scratch.d.set(0, 0, 1).applyQuaternion(q);
      const raw = Math.atan2(scratch.e.crossVectors(front, facing).dot(up), front.dot(facing));
      let turned = raw - sim.twistRaw;
      if (turned > Math.PI) turned -= Math.PI * 2;
      else if (turned < -Math.PI) turned += Math.PI * 2;
      sim.twist += turned;
      sim.twistRaw = raw;
    }
    if (!grab) {
      const spin = body.angular.dot(up);
      body.angular.addScaledVector(up, (physics.twist * (sim.turn - sim.twist) - physics.twistDamping * spin) * h);
    }
    body.velocity.y -= physics.gravity * h;
    body.velocity.x += windX * 0.35 * h;
    body.velocity.z += windZ * 0.35 * h;
    body.position.addScaledVector(body.velocity, h);
    rotateBody(body.quaternion, scratch.f.copy(body.angular).multiplyScalar(h));

    sim.impulses.fill(0);
    if (grab) pin.lerpVectors(grab.from, grab.target, (s + 1) / steps);
    for (let iteration = 0; iteration < ITERATIONS; iteration++) {
      for (let i = 0; i < JOINTS; i++) solveSegment(sim, i, h, physics);
      if (grab) solvePin(body, grab, pin);
    }

    for (let i = 1; i < JOINTS; i++) {
      const v = velocities[i].subVectors(nodes[i], previous[i]).divideScalar(h).multiplyScalar(nodeDrag);
      v.multiplyScalar(1 / (1 + physics.nodeAir * v.length() * h));
    }
    body.velocity.subVectors(body.position, body.previous).divideScalar(h);
    const dq = scratch.q.copy(body.previousQuaternion).invert().premultiply(body.quaternion);
    body.angular.set(dq.x, dq.y, dq.z).multiplyScalar((2 / h) * (dq.w < 0 ? -1 : 1));

    const normal = scratch.a.set(0, 0, 1).applyQuaternion(body.quaternion);
    const across = body.velocity.dot(normal);
    const along = scratch.b.copy(body.velocity).addScaledVector(normal, -across);
    along.multiplyScalar(1 / (1 + physics.air * along.length() * h));
    body.velocity
      .copy(along)
      .addScaledVector(normal, across / (1 + physics.broadside * Math.abs(across) * h))
      .multiplyScalar(linearDrag);
    body.angular.multiplyScalar(angularDrag / (1 + physics.spinAir * body.angular.length() * h));
    if (body.velocity.lengthSq() > 3600) body.velocity.setLength(60);
    if (body.angular.lengthSq() > 1600) body.angular.setLength(40);

    nodes[JOINTS].copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
    for (let i = 0; i < JOINTS; i++) sim.lengths[i] = nodes[i].distanceTo(nodes[i + 1]);
  }

  if (grab) grab.from.copy(grab.target);

  let energy = body.velocity.lengthSq() + body.angular.lengthSq() * 0.3;
  for (let i = 1; i < JOINTS; i++) energy += velocities[i].lengthSq() * 0.05;
  sim.calm = energy < 2e-4 ? sim.calm + dt : 0;
};

const Lanyard = ({
  frontImage,
  backImage,
  imageFit = 'cover',
  cardColor = '#ffffff',
  orientation = 'portrait',
  finish = 'glossy',
  cornerRadius = 0.3,
  size = 0.6,
  anchor = 'center',
  strapLength = 0.5,
  strapImage,
  strapColor = '#111111',
  strapWidth = 0.65,
  metal = 'silver',
  gravity = 1,
  damping = 0.5,
  elasticity = 0.5,
  breeze = 0.5,
  interactive = true,
  intro = true,
  revealAt = 0,
  anchorX,
  cardTop,
  passThrough = false,
  onGrab,
  className = '',
  style
}: LanyardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<Settings | null>(null);
  const applyRef = useRef<(() => void) | null>(null);
  const revealAtRef = useRef(revealAt);
  revealAtRef.current = revealAt;
  const onGrabRef = useRef(onGrab);
  onGrabRef.current = onGrab;

  settingsRef.current = {
    frontImage,
    backImage,
    imageFit: imageFit === 'contain' ? 'contain' : 'cover',
    cardColor,
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    finish,
    cornerRadius,
    size,
    anchor,
    strapLength,
    strapImage,
    strapColor,
    strapWidth,
    metal,
    gravity,
    damping,
    elasticity,
    breeze,
    interactive,
    intro,
    anchorX,
    cardTop,
    passThrough
  };

  useEffect(() => {
    applyRef.current?.();
  });

  // Los acabados especiales mantienen su shader completo. Glossy/matte se adaptan a la GPU.
  const detailedFinish = finish === 'holographic' || finish === 'metallic';
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return undefined;
    }
    const smallScreen = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
    // Adaptación real a móviles/GPUs por software; no se detecta Lighthouse ni el user-agent.
    const balanced = !detailedFinish && (smallScreen || /swiftshader|llvmpipe|software rasterizer/i.test(gpuName));
    const samples = balanced ? 36 : SAMPLES;
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full';
    // (Portfolio) estilos en línea: si el CSS no carga, el canvas no se dibuja gigante
    canvas.style.cssText = 'display:block;width:100%;height:100%;visibility:hidden';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.dataset.graphics = balanced ? 'balanced' : 'full';
    container.appendChild(canvas);

    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const scene = new THREE.Scene();
    const environment = balanced ? buildBalancedEnvironment() : buildEnvironment(renderer);
    if (!balanced) scene.environment = environment.texture;
    else scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(-2.5, 4, 6);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(3, -1, 4);
    scene.add(keyLight, fillLight);

    const imageCache = new Map<string, Promise<HTMLImageElement | null>>();
    const images: Images = { front: null, back: null, strap: null };
    const frontCanvas = document.createElement('canvas');
    const backCanvas = document.createElement('canvas');
    const strapCanvas = document.createElement('canvas');
    const frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
    const backTexture = makeCanvasTexture(backCanvas, anisotropy);
    const strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
    strapTexture.wrapS = THREE.ClampToEdgeWrapping;
    strapTexture.wrapT = THREE.RepeatWrapping;
    const grain = balanced ? null : buildGrainTexture();
    const weave = balanced ? null : buildWeaveTexture();
    const foilUniforms = {
      foilStrength: { value: 0 },
      foilAspect: { value: 1.4 },
      foilKey: { value: new THREE.Vector3() },
      foilFill: { value: new THREE.Vector3() },
      foilTop: { value: new THREE.Vector3() }
    };
    const injectFoil = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, foilUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${FOIL_VERTEX_HEAD}`)
        .replace('#include <project_vertex>', `#include <project_vertex>\n${FOIL_VERTEX_BODY}`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\n${FOIL_FRAGMENT_HEAD}`)
        .replace('#include <opaque_fragment>', `${FOIL_FRAGMENT_BODY}\n#include <opaque_fragment>`);
    };

    // En el perfil liviano el brillo sigue siendo 3D (Phong + reflejos de estudio),
    // sin clearcoat, normales microscópicas ni shaders de foil que no se usan.
    const faceMaterial = (map: THREE.Texture) => balanced
      ? new THREE.MeshPhongMaterial({ map, specular: '#555555', shininess: 85,
          envMap: environment.texture, combine: THREE.MixOperation, reflectivity: 0.08 })
      : new THREE.MeshPhysicalMaterial({ map, normalMap: grain, normalScale: new THREE.Vector2(0.06, 0.06) });
    const frontMaterial = faceMaterial(frontTexture);
    const backMaterial = faceMaterial(backTexture);
    const edgeMaterial = balanced
      ? new THREE.MeshPhongMaterial({ specular: '#333333', shininess: 60 })
      : new THREE.MeshPhysicalMaterial();
    const metalMaterial = balanced
      ? new THREE.MeshPhongMaterial({ specular: '#ffffff', shininess: 100,
          envMap: environment.texture, combine: THREE.MixOperation, reflectivity: 0.55 })
      : new THREE.MeshStandardMaterial({ metalness: 1 });
    const bandMaterial = balanced
      ? new THREE.MeshLambertMaterial({ map: strapTexture, side: THREE.DoubleSide })
      : new THREE.MeshPhysicalMaterial({ map: strapTexture, normalMap: weave,
          normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.68, sheen: 1,
          sheenRoughness: 0.42, sheenColor: new THREE.Color(0.32, 0.32, 0.34), side: THREE.DoubleSide });

    const cardGroup = new THREE.Group();
    const bodyMesh = new THREE.Mesh(undefined, edgeMaterial);
    const frontMesh = new THREE.Mesh(undefined, frontMaterial);
    const backMesh = new THREE.Mesh(undefined, backMaterial);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, balanced ? 10 : 18, balanced ? 32 : 72), metalMaterial);
    ring.rotation.y = Math.PI / 2 - 0.7;
    cardGroup.add(bodyMesh, frontMesh, backMesh, ring);
    scene.add(cardGroup);

    // (Portfolio) sombra suave de la tarjeta: un plano con una sombra difuminada (dibujada una
    // sola vez en un canvas) que va detrás de la tarjeta, corrido hacia abajo y a la derecha,
    // y que copia su inclinación. Es casi gratis: no usa el sistema de sombras de three.js.
    const shadowTexture = buildShadowTexture();
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      color: 0x000000,
      transparent: true,
      opacity: SHADOW.opacity,
      depthWrite: false,
      toneMapped: false
    });
    const shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial);
    shadowMesh.renderOrder = -1;
    scene.add(shadowMesh);

    const bandGeometry = buildBandGeometry(samples);
    const band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    const clampGroup = new THREE.Group();
    const clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.0105, balanced ? 8 : 14, balanced ? 24 : 40), metalMaterial);
    clampGroup.add(clampMesh, eyelet);
    scene.add(clampGroup);

    const sim = createSimulation();
    const controls: THREE.Vector3[] = [];
    const mouth = new THREE.Vector3();
    const tuck = new THREE.Vector3();
    const curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');
    curve.arcLengthDivisions = balanced ? 64 : 200;
    const view = { width: 1, height: 1 };
    let layout = cardLayout('portrait', 0.3);
    let applied: Applied = {};
    let strapScale = STRAP_WIDTH;
    let tileRatio = 2;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let visible = true;
    let alive = true;
    let ready = false;
    let warming = false;
    let preparation = 0;
    let revealTimer = 0;
    let revealFrame = 0;
    // (Portfolio) mientras se hace scroll la tarjeta se congela (no se simula ni se redibuja):
    // así el navegador solo desplaza la página y el scroll va fluido. Retoma al parar.
    let scrolling = false;
    let scrollTimer = 0;
    let placed = false;
    let hovering = false;
    let press: Press | null = null;
    let imageToken = 0;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const paintFaces = () => {
      const s = settingsRef.current!;
      const color = parseColor(s.cardColor, [1, 1, 1]);
      const width = FACE_WIDTH;
      const height = Math.round((width * layout.height) / layout.width);
      if (frontCanvas.width !== width || frontCanvas.height !== height) {
        frontCanvas.width = width;
        frontCanvas.height = height;
        backCanvas.width = width;
        backCanvas.height = height;
        frontTexture.dispose();
        backTexture.dispose();
      }
      paintFace(frontCanvas, images.front, color, s.imageFit);
      paintFace(backCanvas, images.back || images.front, color, s.imageFit);
      frontTexture.needsUpdate = true;
      backTexture.needsUpdate = true;
      start();
    };

    const repaintStrap = () => {
      const s = settingsRef.current!;
      tileRatio = paintStrap(strapCanvas, images.strap, parseColor(s.strapColor, [0.07, 0.07, 0.07]), 192);
      weave?.repeat.set(2, 2 * tileRatio);
      strapTexture.dispose();
      strapTexture.needsUpdate = true;
      start();
    };

    const frameView = () => {
      const s = settingsRef.current!;
      const aspect = view.width / view.height;
      let viewHeight = layout.height / clamp(s.size, 0.05, 0.9); // (Portfolio) mín. 0.05 (antes 0.15) para lienzos altos
      const minimumWidth = layout.width / 0.72;
      if (viewHeight * aspect < minimumWidth) viewHeight = minimumWidth / aspect;
      const viewWidth = viewHeight * aspect;
      camera.aspect = aspect;
      const distance = viewHeight / 2 / Math.tan((FOV * Math.PI) / 360);
      camera.position.set(0, 0, distance);
      // (Portfolio) rango de profundidad ajustado a la distancia: con un lienzo alto la
      // cámara queda lejos y, con near = 0.1 fijo, en celulares la cara de la tarjeta
      // "parpadeaba" (z-fighting por poca precisión de profundidad).
      camera.near = Math.max(0.1, distance * 0.35);
      camera.far = distance * 2.5 + 10;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      foilUniforms.foilKey.value.set(-2.5, 4, 6).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilFill.value.set(3, -1, 4).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilTop.value.set(0.5, 4.5, 8).normalize().transformDirection(camera.matrixWorldInverse);
      const anchorX = ((s.anchorX ?? ANCHORS[s.anchor] ?? 0.5) - 0.5) * viewWidth;
      const anchorY = viewHeight / 2 + 0.2;
      const cardTop =
        viewHeight / 2 -
        viewHeight * (s.cardTop !== undefined ? clamp(s.cardTop, 0.02, 0.8) : mix(0.12, 0.42, clamp(s.strapLength, 0, 1)));
      const hangTop = cardTop + (layout.hangY - layout.height / 2);
      sim.anchor.set(anchorX, anchorY, 0);
      configureSimulation(sim, layout, anchorY - hangTop);
      sim.nodes[0].copy(sim.anchor);
      sim.previous[0].copy(sim.anchor);
    };

    const apply = () => {
      const s = settingsRef.current!;
      const layoutKey = `${s.orientation}|${s.cornerRadius}`;
      if (layoutKey !== applied.layoutKey) {
        layout = cardLayout(s.orientation, s.cornerRadius);
        const geometry = buildCardGeometry(layout);
        bodyMesh.geometry.dispose();
        frontMesh.geometry.dispose();
        backMesh.geometry.dispose();
        bodyMesh.geometry = geometry.body;
        frontMesh.geometry = geometry.face;
        backMesh.geometry = geometry.face.clone();
        frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
        backMesh.rotation.y = Math.PI;
        backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);
        ring.position.set(0, layout.ringY, 0);
        applied.framingKey = '';
      }
      const framingKey = `${layoutKey}|${s.size}|${s.anchor}|${s.strapLength}|${s.anchorX}|${s.cardTop}|${view.width}|${view.height}`;
      if (framingKey !== applied.framingKey) {
        frameView();
        if (!placed) {
          placeHanging(sim, layout, s.intro && !reducedMotion);
          placed = true;
        } else if (layoutKey !== applied.layoutKey) {
          placeHanging(sim, layout, false);
        }
      }

      const imageSources = [s.frontImage, s.backImage, s.strapImage];
      if (!applied.imageSources || imageSources.some((image, i) => image !== applied.imageSources![i])) {
        const token = ++imageToken;
        Promise.all([
          loadImage(imageCache, s.frontImage),
          loadImage(imageCache, s.backImage),
          loadImage(imageCache, s.strapImage)
        ]).then(([front, back, strap]) => {
          if (!alive || token !== imageToken) return;
          images.front = front;
          images.back = back;
          images.strap = strap;
          paintFaces();
          repaintStrap();
          void prepare();
        });
      }
      const faceKey = `${layoutKey}|${s.cardColor}|${s.imageFit}`;
      if (faceKey !== applied.faceKey) paintFaces();
      if (s.strapColor !== applied.strapColor) repaintStrap();

      const finish = FINISHES[s.finish] || FINISHES.glossy;
      const card = parseColor(s.cardColor, [1, 1, 1]);
      [frontMaterial, backMaterial].forEach(material => {
        if (material instanceof THREE.MeshPhysicalMaterial) {
          material.roughness = finish.roughness;
          material.metalness = finish.metalness;
          material.clearcoat = finish.clearcoat;
          material.clearcoatRoughness = finish.clearcoatRoughness;
          material.anisotropy = finish.anisotropy;
          // No compilar el shader holográfico si el acabado actual no lo utiliza.
          const foil = finish.foil > 0;
          if (material.userData.foil !== foil) {
            material.userData.foil = foil;
            material.onBeforeCompile = foil ? injectFoil : () => {};
            material.customProgramCacheKey = () => foil ? 'portfolio-foil-v1' : 'portfolio-clean-v1';
            material.needsUpdate = true;
          }
        } else {
          material.shininess = s.finish === 'matte' ? 8 : 85;
          material.reflectivity = s.finish === 'matte' ? 0.02 : 0.08;
        }
      });
      foilUniforms.foilStrength.value = finish.foil;
      foilUniforms.foilAspect.value = layout.height / layout.width;
      edgeMaterial.color.setRGB(card[0] * 0.92, card[1] * 0.92, card[2] * 0.92, THREE.SRGBColorSpace);
      if (edgeMaterial instanceof THREE.MeshPhysicalMaterial) {
        edgeMaterial.roughness = Math.min(finish.roughness, 0.35);
        edgeMaterial.metalness = finish.metalness;
        edgeMaterial.clearcoat = 1;
        edgeMaterial.clearcoatRoughness = 0.08;
      }
      const metalLook = METALS[s.metal] || METALS.silver;
      metalMaterial.color.set(metalLook.color);
      if (metalMaterial instanceof THREE.MeshStandardMaterial) metalMaterial.roughness = metalLook.roughness;
      strapScale = STRAP_WIDTH * clamp(s.strapWidth, 0.4, 2);
      if (strapScale !== applied.strapScale) {
        clampMesh.geometry.dispose();
        clampMesh.geometry = buildClampGeometry(strapScale);
      }
      if (s.passThrough) canvas.style.pointerEvents = 'none';
      else canvas.style.touchAction = s.interactive ? 'pan-y' : 'auto';

      applied = { layoutKey, framingKey, imageSources, faceKey, strapColor: s.strapColor, strapScale };
      start();
    };

    const points = Array.from({ length: samples }, () => new THREE.Vector3());
    const sides = Array.from({ length: samples }, () => new THREE.Vector3());
    const bends = BAND_BEND.map((angle): [number, number] => [Math.cos(angle), Math.sin(angle)]);
    const work = {
      tangent: new THREE.Vector3(),
      toCamera: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
      up: new THREE.Vector3(),
      across: new THREE.Vector3(),
      facing: new THREE.Vector3(),
      end: new THREE.Vector3()
    };

    const updateBand = () => {
      const hang = sim.nodes[JOINTS];
      const reach = EYELET_RADIUS + CLAMP_BODY + 0.05;
      let guide = JOINTS - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach * 1.1) guide--;
      const axis = work.up.subVectors(sim.nodes[guide], hang);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).applyQuaternion(sim.body.quaternion);
      axis.normalize();
      mouth.copy(hang).addScaledVector(axis, reach);
      tuck.copy(hang).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY * 0.35);
      controls.length = 0;
      for (let i = 0; i <= guide; i++) controls.push(sim.nodes[i]);
      controls.push(mouth, tuck);
      curve.updateArcLengths();
      for (let i = 0; i < samples; i++) curve.getPointAt(i / (samples - 1), points[i]);
      const length = curve.getLength();
      const held = 1 - mouth.distanceTo(tuck) / Math.max(length, 0.001);
      const position = bandGeometry.getAttribute('position');
      const normal = bandGeometry.getAttribute('normal');
      const uv = bandGeometry.getAttribute('uv');
      const columns = BAND_COLUMNS.length;
      const restLength = sim.rest * JOINTS;
      const repeats = restLength / (strapScale * tileRatio);
      const width = strapScale / Math.pow(Math.max(1, length / Math.max(restLength, 0.001)), 0.35);
      const { tangent, toCamera, across, facing } = work;
      for (let i = 0; i < samples; i++) {
        tangent.subVectors(points[Math.min(samples - 1, i + 1)], points[Math.max(0, i - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();
        toCamera.subVectors(camera.position, points[i]).normalize();
        const side = sides[i].crossVectors(toCamera, tangent);
        if (side.lengthSq() < 1e-10) side.copy(i > 0 ? sides[i - 1] : scratch.a.set(1, 0, 0));
        side.normalize();
        if (i > 0 && side.dot(sides[i - 1]) < 0) side.negate();
        const angle = -sim.twist * Math.pow(Math.min(1, i / (samples - 1) / held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);
        const p = points[i];
        const v = (1 - i / (samples - 1)) * repeats;
        for (let c = 0; c < columns; c++) {
          const k = i * columns + c;
          const offset = (BAND_COLUMNS[c] - 0.5) * width;
          const [bendCos, bendSin] = bends[c];
          position.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normal.setXYZ(
            k,
            facing.x * bendCos + across.x * bendSin,
            facing.y * bendCos + across.y * bendSin,
            facing.z * bendCos + across.z * bendSin
          );
          uv.setXY(k, BAND_COLUMNS[c], v);
        }
      }
      work.end.copy(across);
      position.needsUpdate = true;
      normal.needsUpdate = true;
      uv.needsUpdate = true;

      across.copy(work.end).addScaledVector(axis, -work.end.dot(axis)).normalize();
      facing.crossVectors(across, axis).normalize();
      work.basis.makeBasis(across, axis, facing);
      clampGroup.quaternion.setFromRotationMatrix(work.basis);
      clampGroup.position.copy(hang);
    };

    const syncScene = () => {
      cardGroup.position.copy(sim.body.position);
      cardGroup.quaternion.copy(sim.body.quaternion);
      shadowMesh.position.copy(sim.body.position);
      shadowMesh.position.x += SHADOW.x;
      shadowMesh.position.y += SHADOW.y;
      shadowMesh.position.z += SHADOW.z;
      shadowMesh.quaternion.copy(sim.body.quaternion);
      shadowMesh.scale.set(layout.width * SHADOW_PAD.x, layout.height * SHADOW_PAD.y, 1);
      updateBand();
    };

    const render = () => {
      syncScene();
      renderer.render(scene, camera);
    };

    const physics = (): Physics => {
      const s = settingsRef.current!;
      const gravity = 40 * clamp(s.gravity, 0, 3);
      const weight = Math.max(gravity, 20);
      const springy = clamp(s.elasticity, 0, 1);
      const settle = clamp(s.damping, 0, 1);
      return {
        gravity,
        hold: weight * mix(2.2, 5.5, springy),
        stiffness: weight * 10 * JOINTS,
        spring: weight * mix(0.1, 0.4, springy) * JOINTS,
        bandDamping: weight * mix(0.3, 0.08, springy) * JOINTS,
        linearDrag: 0.25 * Math.pow(16, settle),
        angularDrag: 0.5 * Math.pow(12, settle),
        air: 0.15,
        broadside: 0.5,
        spinAir: 0.03,
        nodeDrag: 2,
        nodeAir: 0.2,
        twist: 30,
        twistDamping: 3,
        grip: 40,
        gripDamping: 6,
        breeze: reducedMotion ? 0 : clamp(s.breeze, 0, 1)
      };
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive || !ready || !visible || document.hidden) return;
      if (scrolling && !sim.grab && time > 1.6) return;
      // Móvil/GPUs por software: ~30 fps. GPU de escritorio: hasta ~60–75 fps.
      if (now - last < (balanced ? 30 : 12)) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      time += dt;
      const current = physics();
      stepSimulation(sim, dt, current, time);
      const body = sim.body;
      if (!Number.isFinite(body.position.x + body.position.y + body.position.z + body.quaternion.w)) {
        sim.grab = null;
        placeHanging(sim, layout, false);
      }
      render();
      const resting = sim.calm > 1.2 && !sim.grab && current.breeze === 0;
      if (visible && !resting) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !visible || !alive || !ready || document.hidden) return;
      if (scrolling && !sim.grab && time > 1.6) return;
      sim.calm = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // (Portfolio) dos fases: preparar todo OCULTO y recién después soltar la física.
    // El primer render ya no muestra una tarjeta vacía ni se interrumpe al recibir el arte.
    const prepare = async () => {
      if (ready || warming || !alive || renderer.getContext().isContextLost()) return;
      warming = true;
      const version = ++preparation;
      const active = () => alive && version === preparation && !renderer.getContext().isContextLost();
      try {
        syncScene();
        // Incluye el dorso aunque todavía no mire a cámara.
        const textures: THREE.Texture[] = [frontTexture, backTexture, strapTexture, shadowTexture];
        if (grain) textures.push(grain);
        if (weave) textures.push(weave);
        if (balanced) textures.push(environment.texture);
        for (const texture of textures) {
          if (!active()) return;
          renderer.initTexture(texture);
          // Ceder entre subidas: el navegador puede responder y pintar antes del siguiente bloque.
          await new Promise<void>(resolve => window.setTimeout(resolve, 0));
        }
        await renderer.compileAsync(scene, camera);
        if (!active()) return;
        render(); // sube geometrías/buffers mientras el canvas sigue oculto
      } catch {
        if (!active()) return;
        // Fallback para drivers sin compilación paralela: también ocurre oculto.
        try { render(); } catch { return; }
      }
      if (!active()) return;
      const reveal = () => {
        revealFrame = requestAnimationFrame(() => {
          if (!active()) return;
          time = 0;
          ready = true;
          canvas.style.visibility = 'visible';
          start();
        });
      };
      const delay = Math.max(0, revealAtRef.current - performance.now());
      revealTimer = window.setTimeout(reveal, delay);
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const toPointer = (event: Point) => {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
    };

    const pickCard = () => {
      cardGroup.updateMatrixWorld();
      const hits = raycaster.intersectObjects([bodyMesh, frontMesh, backMesh], false);
      return hits[0] || null;
    };

    // (Portfolio) modo passThrough: el lienzo no recibe eventos; se escuchan en el
    // contenedor padre / la ventana y solo se actúa si el puntero está sobre la tarjeta.
    const pass = !!settingsRef.current?.passThrough;
    // escucha en la sección que contiene la tarjeta (el hero), no en toda la página
    const root = (container.closest('section') ?? document.body) as HTMLElement;
    const html = document.documentElement;
    let suppressClick = false;
    if (pass && !document.getElementById('lanyard-cursor-style')) {
      const st = document.createElement('style');
      st.id = 'lanyard-cursor-style';
      st.textContent =
        'html.lanyard-grab,html.lanyard-grab *{cursor:grab!important}' +
        'html.lanyard-grabbing,html.lanyard-grabbing *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}';
      document.head.appendChild(st);
    }
    const insideCanvas = (event: Point) => {
      const r = canvas.getBoundingClientRect();
      return event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    };

    const setCursor = (value: string) => {
      if (pass) {
        html.classList.toggle('lanyard-grab', value === 'grab');
        html.classList.toggle('lanyard-grabbing', value === 'grabbing');
        return;
      }
      if (canvas.style.cursor !== value) canvas.style.cursor = value;
    };

    const flip = (point: THREE.Vector3) => {
      const body = sim.body;
      const up = scratch.a.set(0, 1, 0).applyQuaternion(body.quaternion);
      let direction = sim.turn > 0 ? -1 : 1;
      if (sim.turn === 0) {
        const away = scratch.c.subVectors(point, camera.position).normalize();
        direction = scratch.b.subVectors(point, body.position).cross(away).dot(up) < 0 ? -1 : 1;
      }
      sim.turn = sim.turn === 0 ? Math.PI * direction : 0;
      body.angular.addScaledVector(up, FLIP_SPIN * direction);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!ready || !settingsRef.current!.interactive || event.button > 0) return;
      if (pass && (!visible || !insideCanvas(event))) return;
      toPointer(event);
      const hit = pickCard();
      if (!hit) return;
      sim.grab = {
        local: hit.point.clone().sub(sim.body.position).applyQuaternion(sim.body.quaternion.clone().invert()),
        rotation: sim.body.quaternion.clone(),
        reach: hit.distance,
        from: hit.point.clone(),
        target: hit.point.clone()
      };
      press = { x: event.clientX, y: event.clientY, time: performance.now(), point: hit.point.clone() };
      if (pass) suppressClick = true;
      else canvas.setPointerCapture?.(event.pointerId);
      setCursor('grabbing');
      onGrabRef.current?.();
      event.preventDefault();
      start();
    };

    // (Portfolio) límite del arrastre: el centro de la tarjeta no puede salir de la zona visible del
    // lienzo (si no, quedaba debajo de la franja de tecnologías o cortada por los costados)
    const clampVec = new THREE.Vector3();
    const offsetVec = new THREE.Vector3();
    const clampGrab = (grab: NonNullable<typeof sim.grab>) => {
      const h = view.height;
      const w = view.width;
      const cardH = clamp(settingsRef.current!.size, 0.05, 1) * h;
      const cardW = cardH * 0.72;
      offsetVec.copy(grab.local).applyQuaternion(grab.rotation);
      clampVec.copy(grab.target).sub(offsetVec).project(camera);
      const px = ((clampVec.x + 1) / 2) * w;
      const py = ((1 - clampVec.y) / 2) * h;
      // media diagonal: lo máximo que ocupa la tarjeta desde su centro aunque esté inclinada
      const reach = 0.5 * Math.hypot(cardW, cardH);
      const minX = Math.min(w / 2, reach + 10);
      const maxX = Math.max(w / 2, w - reach - 10);
      const minY = Math.min(h / 2, cardH * 0.55);
      const maxY = Math.max(h * 0.45, h - reach - 14);
      const cx = clamp(px, minX, maxX);
      const cy = clamp(py, minY, maxY);
      if (cx === px && cy === py) return;
      clampVec.x = (cx / w) * 2 - 1;
      clampVec.y = 1 - (cy / h) * 2;
      clampVec.unproject(camera);
      grab.target.copy(clampVec).add(offsetVec);
    };

    // (Portfolio) suelta la tarjeta sin "dar vuelta" (cuando el botón se soltó fuera de la ventana)
    const release = () => {
      if (!sim.grab) return;
      sim.grab = null;
      press = null;
      suppressClick = false;
      setCursor('');
      start();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!ready || !visible || !settingsRef.current!.interactive) return;
      toPointer(event);
      if (sim.grab) {
        // si se soltó el botón fuera de la ventana, el navegador no avisa: se suelta acá
        if (event.pointerType === 'mouse' && event.buttons === 0) {
          release();
          return;
        }
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
        raycaster.ray.at(sim.grab.reach, sim.grab.target);
        clampGrab(sim.grab);
        start();
        return;
      }
      if (event.pointerType === 'touch') return;
      hovering = pass && (!visible || !insideCanvas(event)) ? false : !!pickCard();
      setCursor(hovering ? 'grab' : '');
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!sim.grab) return;
      sim.grab = null;
      if (press && event.type === 'pointerup' && performance.now() - press.time < 450) flip(press.point);
      press = null;
      if (pass) window.setTimeout(() => (suppressClick = false), 0);
      else canvas.releasePointerCapture?.(event.pointerId);
      setCursor(hovering && event.pointerType !== 'touch' ? 'grab' : '');
      start();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (!ready || !settingsRef.current!.interactive || event.touches.length !== 1) return;
      if (pass && (!visible || !insideCanvas(event.touches[0]))) return;
      toPointer(event.touches[0]);
      if (pickCard()) event.preventDefault();
    };

    // (Portfolio) si al soltar la tarjeta el puntero queda sobre un botón, no lo "clickea"
    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    if (pass) {
      root.addEventListener('pointerdown', onPointerDown, true);
      root.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      window.addEventListener('click', onClickCapture, true);
    } else {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      canvas.addEventListener('lostpointercapture', onPointerUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      // La nitidez depende del DPR, no del área del hero: nunca ampliar un
      // framebuffer de 0.65x/1x en una pantalla Retina. Los materiales y el
      // límite de cuadros siguen livianos, pero la imagen se dibuja hasta 2x.
      const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      if (width === view.width && height === view.height && ratio === renderer.getPixelRatio()) return;
      view.width = width;
      view.height = height;
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      apply();
      if (ready) render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        setCursor('');
      }
    });
    intersectionObserver.observe(container);
    // Un contexto recuperado vuelve a preparar la GPU OCULTO. El padre puede
    // remontarlo; este fallback también funciona si se usa Lanyard por separado.
    const onContextLost = (event: Event) => {
      event.preventDefault();
      preparation++;
      ready = false;
      warming = false;
      canvas.style.visibility = 'hidden';
      cancelAnimationFrame(raf);
      cancelAnimationFrame(revealFrame);
      window.clearTimeout(revealTimer);
      raf = 0;
      release();
      setCursor('');
    };
    const onContextRestored = () => { void prepare(); };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', release);
    const onScroll = () => {
      // No cortar la caída inicial por scroll restoration/layout al abrir la web.
      if (!ready || time < 1.6 || sim.grab) return;
      scrolling = true;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
        start();
      }, 140);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    applyRef.current = apply;
    resize();

    return () => {
      alive = false;
      preparation++;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      window.clearTimeout(revealTimer);
      cancelAnimationFrame(revealFrame);
      cancelAnimationFrame(raf);
      applyRef.current = null;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', release);
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(scrollTimer);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('lostpointercapture', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('pointerdown', onPointerDown, true);
      root.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('click', onClickCapture, true);
      html.classList.remove('lanyard-grab', 'lanyard-grabbing');
      [bodyMesh, frontMesh, backMesh, ring, clampMesh, eyelet, band].forEach(mesh => mesh.geometry?.dispose());
      [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial].forEach(material => material.dispose());
      [frontTexture, backTexture, strapTexture, grain, weave, shadowTexture].forEach(texture => texture?.dispose());
      shadowMesh.geometry.dispose();
      shadowMaterial.dispose();
      environment.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [detailedFinish]);

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`.trim()} style={style} />
  );
};

export default Lanyard;
