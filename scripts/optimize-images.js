/* ============================================================
   Genera las variantes optimizadas de imágenes, logo y favicons.
   Uso:  node scripts/optimize-images.js
   Salida: assets/img/opt/  (y site.webmanifest en la raíz)

   Para añadir una foto nueva: agrégala a PHOTOS con su nombre
   base; se generan AVIF, WebP y JPG a 640/1280/1920 px de ancho.
   ============================================================ */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets/img');
const OUT = path.join(SRC, 'opt');
fs.mkdirSync(OUT, { recursive: true });

const PHOTOS = [{ file: 'roraima.jpg', name: 'roraima' }];
const WIDTHS = [640, 1280, 1920];

async function photos() {
  for (const { file, name } of PHOTOS) {
    const input = path.join(SRC, file);
    for (const w of WIDTHS) {
      const base = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
      await base.clone().avif({ quality: 50, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
      await base.clone().webp({ quality: 72 }).toFile(path.join(OUT, `${name}-${w}.webp`));
      await base.clone().jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${name}-${w}.jpg`));
    }
  }
  // Imagen social (Open Graph / Twitter) 1200x630
  await sharp(path.join(SRC, 'roraima.jpg'))
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
