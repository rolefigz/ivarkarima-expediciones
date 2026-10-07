/* ============================================================
   Genera las variantes optimizadas de imágenes, logo y favicons.
   Uso:  node scripts/optimize-images.js
   Salida: assets/img/opt/  (y site.webmanifest en la raíz)

   Fotos de la web: cada "hueco" (tarjeta de tour, destino, galería…)
   tiene una proporción fija. SLOTS recorta cada original de
   assets/img/src/ a esa proporción alrededor de un punto focal
   (focus: [x, y] de 0 a 1) y genera AVIF/WebP/JPG a varios anchos.
   El resultado y los anchos reales quedan en assets/img/opt/photos.json.
   Créditos de las fotos de terceros: assets/img/src/credits.json.
   ============================================================ */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
sharp.cache(false);

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets/img');
const PHOTO_SRC = path.join(SRC, 'src');
const OUT = path.join(SRC, 'opt');
fs.mkdirSync(OUT, { recursive: true });

// Hero (foto completa, sin recorte)
// trimLeft: recorta el marco de la ventanilla del avión en el borde izquierdo
const PHOTOS = [{ file: 'roraima.jpg', name: 'roraima', trimLeft: 0.11 }];
const WIDTHS = [640, 1280, 1920];

const R = { card: [16, 10], dest: [4, 5], gallery: [4, 3] };
const W = { card: [480, 960], dest: [480, 960], gallery: [480, 960, 1600] };
const SLOTS = [
  // Tarjetas de expediciones (16:10)
  { name: 'tour1', src: 'gran-sabana-kukenan-roraima.jpg', kind: 'card', focus: [0.5, 0.4] },
  { name: 'tour2', src: '../roraima.jpg', kind: 'card', focus: [0.56, 0.42], zoom: 0.9 },
  { name: 'tour3', src: 'angel-falls.jpg', kind: 'card', focus: [0.5, 0.45] },
  { name: 'tour4', src: 'kavac-canon.jpg', kind: 'card', focus: [0.5, 0.5] },
  { name: 'tour6', src: 'piedra-elefante.jpg', kind: 'card', focus: [0.42, 0.5] },
  { name: 'tour7', src: 'ciudad-bolivar.jpg', kind: 'card', focus: [0.5, 0.5] },
  { name: 'tour8', src: 'saltos-caroni.jpg', kind: 'card', focus: [0.5, 0.5] },
  { name: 'tour5', src: 'expedicion-4x4.jpg', kind: 'card', focus: [0.5, 0.66] },
  // Destinos (4:5)
  { name: 'dest-roraima', src: 'roraima-vista.jpg', kind: 'dest', focus: [0.5, 0.5] },
  { name: 'dest-angel', src: 'angel-falls-vertical.jpg', kind: 'dest', focus: [0.5, 0.42] },
  { name: 'dest-canaima', src: 'canaima-laguna.jpg', kind: 'dest', focus: [0.28, 0.5] },
  { name: 'dest-jaspe', src: 'quebrada-jaspe.jpg', kind: 'dest', focus: [0.55, 0.5] },
  { name: 'dest-sabana', src: 'gran-sabana-tepuy-roraima.jpg', kind: 'dest', focus: [0.66, 0.5] },
  { name: 'dest-kavac', src: 'kavac-cascada.jpg', kind: 'dest', focus: [0.4, 0.5] },
  // Nosotros (4:5)
  { name: 'about', src: 'salto-kama-meru-vertical.jpg', kind: 'dest', focus: [0.5, 0.5] },
  // Galería (4:3)
  { name: 'gal-cielo', src: 'cielo-gran-sabana.jpg', kind: 'gallery', focus: [0.5, 0.5] },
  { name: 'gal-tepuyes', src: 'tepuyes-kukenan-roraima.jpg', kind: 'gallery', focus: [0.5, 0.5] },
  { name: 'gal-llovizna', src: 'la-llovizna-arcoiris.jpg', kind: 'gallery', focus: [0.5, 0.42] },
  { name: 'gal-piedra-laguna', src: 'piedra-elefante-laguna.jpg', kind: 'gallery', focus: [0.5, 0.5] },
  { name: 'gal-yuruani', src: 'salto-yuruani.jpg', kind: 'gallery', focus: [0.5, 0.5] },
  { name: 'gal-orquidea', src: 'orquidea-gran-sabana.jpg', kind: 'gallery', focus: [0.5, 0.32] },
  { name: 'gal-4x4', src: 'expedicion-4x4-grupo.jpg', kind: 'gallery', focus: [0.5, 0.64] },
  { name: 'gal-llovizna-sendero', src: 'la-llovizna-sendero.jpg', kind: 'gallery', focus: [0.5, 0.55] },
  { name: 'gal-piedra-cima', src: 'piedra-elefante-cima.jpg', kind: 'gallery', focus: [0.56, 0.42], zoom: 0.86 }
];

// Mayor rectángulo con la proporción pedida, centrado en el foco
// zoom < 1 recorta más cerrado (para sacar bordes o elementos sueltos)
function cropBox(w, h, [rw, rh], [fx, fy], zoom = 1) {
  let cw = w, ch = Math.round(w * rh / rw);
  if (ch > h) { ch = h; cw = Math.round(h * rw / rh); }
  cw = Math.round(cw * zoom); ch = Math.round(cw * rh / rw);
  const left = Math.min(Math.max(Math.round(fx * w - cw / 2), 0), w - cw);
  const top = Math.min(Math.max(Math.round(fy * h - ch / 2), 0), h - ch);
  return { left, top, width: cw, height: ch };
}

async function slots() {
  const manifest = {};
  for (const slot of SLOTS) {
    const input = fs.readFileSync(path.join(PHOTO_SRC, slot.src));
    const oriented = await sharp(input).rotate().toBuffer();
    const meta = await sharp(oriented).metadata();
    const box = cropBox(meta.width, meta.height, R[slot.kind], slot.focus, slot.zoom);
    const cropped = await sharp(oriented).extract(box).toBuffer();
    // Nunca se amplía: si el recorte es más chico, su ancho real es el máximo
    const widths = W[slot.kind].filter(w => w < box.width);
    widths.push(Math.min(box.width, W[slot.kind][W[slot.kind].length - 1]));
    const out = [];
    for (const w of [...new Set(widths)]) {
      const h = Math.round(w * R[slot.kind][1] / R[slot.kind][0]);
      const base = sharp(cropped).resize(w, h);
      await base.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `${slot.name}-${w}.avif`));
      await base.clone().webp({ quality: 74 }).toFile(path.join(OUT, `${slot.name}-${w}.webp`));
      await base.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${slot.name}-${w}.jpg`));
      out.push({ w, h });
    }
    manifest[slot.name] = out;
  }
  fs.writeFileSync(path.join(OUT, 'photos.json'), JSON.stringify(manifest, null, 2) + '\n');
}

async function photos() {
  for (const { file, name, trimLeft = 0 } of PHOTOS) {
    const raw = await sharp(fs.readFileSync(path.join(SRC, file))).rotate().toBuffer();
    const m = await sharp(raw).metadata();
    const cut = Math.round(m.width * trimLeft);
    const input = await sharp(raw).extract({ left: cut, top: 0, width: m.width - cut, height: m.height }).toBuffer();
    for (const w of WIDTHS) {
      const base = sharp(input).resize({ width: w, withoutEnlargement: true });
      await base.clone().avif({ quality: 50, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
      await base.clone().webp({ quality: 72 }).toFile(path.join(OUT, `${name}-${w}.webp`));
      await base.clone().jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${name}-${w}.jpg`));
    }
  }
  await slots();
  // Imagen social (Open Graph / Twitter) 1200x630
  await sharp(path.join(OUT, 'roraima-1920.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, 'og-image.jpg'));
}

async function logos() {
  const input = path.join(SRC, 'Ivarkarimalogonobg.png');
  // Recorta el área transparente sobrante del lienzo de 1920x1080
  const trimmed = await sharp(input).trim({ threshold: 1 }).png().toBuffer();

  // Variante clara para fondos oscuros: los trazos negros pasan a crema,
  // el verde de marca y el texto blanco del recuadro se conservan.
  const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const light = Buffer.from(data);
  for (let i = 0; i < light.length; i += 4) {
    const r = light[i], g = light[i + 1], b = light[i + 2];
    const isGreen = g > r + 40 && g > b + 20;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (!isGreen && lum < 140) { light[i] = 0xF5; light[i + 1] = 0xED; light[i + 2] = 0xD5; }
  }
  const lightPng = await sharp(light, { raw: info }).png().toBuffer();

  // Header ~46px de alto / footer 44px → 2x = 96px de alto
  await sharp(lightPng).resize({ height: 96 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'logo-light.png'));
  // Logo para JSON-LD / buscadores (fondo crema, cuadrado 512)
  await sharp(trimmed).resize(440, 440, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 36, bottom: 36, left: 36, right: 36, background: '#F5EDD5' })
    .flatten({ background: '#F5EDD5' })
    .png().toFile(path.join(OUT, 'logo-512.png'));

  const meta = await sharp(path.join(OUT, 'logo-light.png')).metadata();
  return meta;
}

async function favicons() {
  const input = path.join(SRC, 'ominov2.png');
  for (const s of [32, 180, 192, 512]) {
    await sharp(input).resize(s, s).png({ compressionLevel: 9, palette: s <= 192 }).toFile(path.join(OUT, `icon-${s}.png`));
  }
  const manifest = {
    name: 'Ivarkarima Expediciones',
    short_name: 'Ivarkarima',
    start_url: '/',
    display: 'browser',
    background_color: '#0B1410',
    theme_color: '#0B1410',
    icons: [
      { src: '/assets/img/opt/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/img/opt/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
  fs.writeFileSync(path.join(ROOT, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
}

(async () => {
  await photos();
  const logo = await logos();
  await favicons();
  console.log('logo-light:', logo.width + 'x' + logo.height);
  for (const f of fs.readdirSync(OUT).sort()) {
    console.log(f.padEnd(22), (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + ' KB');
  }
})().catch(e => { console.error(e); process.exit(1); });
