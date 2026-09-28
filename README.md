# Ivarkarima Expediciones — Sitio web

Sitio estático (HTML/CSS/JS, sin frameworks ni backend) para Ivarkarima Expediciones, C.A.

## Estructura

```
index.html          Página principal (todas las secciones)
privacy.html         Política de Privacidad y Uso de Imágenes (borrador)
terms.html            Términos y Condiciones (borrador)
404.html              Página de error bilingüe (GitHub Pages la sirve sola)
site.webmanifest      Manifest con los iconos de la app
css/style.css         Todos los estilos
js/i18n.js            Diccionario de traducciones ES/EN + selector de idioma
js/main.js            Menú móvil, scroll reveal, FAQ, galería, carrusel, formulario
assets/img/           Originales (logo, favicon, fotos)
assets/img/opt/       Variantes optimizadas generadas (no editar a mano)
scripts/optimize-images.js  Genera assets/img/opt/ con sharp
robots.txt, sitemap.xml
CNAME                 Dominio para GitHub Pages (ivarkarima.com)
```

## Cómo cambiar el número de WhatsApp

El número aparece en dos sitios:

1. `js/i18n.js`, constante `WA_BASE` (arma los enlaces con el mensaje prellenado).
2. El `href="https://wa.me/584249542480"` de cada enlace `.wa-cta` en `index.html`, que es el respaldo si el JavaScript no carga. Búscalo y reemplázalo en todo el archivo (también está en `404.html`, `privacy.html` y en el JSON-LD del `<head>`).

Usa el formato código de país + número, sin `+` ni espacios.

Los mensajes prellenados de cada botón se editan directamente en `index.html`, en los atributos `data-wa-msg-es` y `data-wa-msg-en` de cada enlace con clase `wa-cta`.

## Cómo cambiar textos

El español vive directamente en `index.html` (atributos `data-i18n="clave"` o `data-i18n-html="clave"` marcan qué texto es traducible; `data-i18n-attr="aria-label:clave; alt:otra"` traduce atributos). El `<title>` y la meta description salen de las claves `meta.title` / `meta.desc`. La versión en inglés tiene URL propia: `https://ivarkarima.com/?lang=en`. El inglés vive en `js/i18n.js`, dentro del objeto `IVK_I18N.en`, usando las mismas claves. Si cambias un texto en español directamente en el HTML, recuerda actualizar también `IVK_I18N.es` en `js/i18n.js` si quieres que el fallback / la clave siga sincronizada.

Para agregar italiano (opcional, mencionado en el brief): añade un bloque `it: { ... }` en `js/i18n.js` con las mismas claves, y agrega un botón `<button data-lang="it">IT</button>` junto a los de ES/EN en el header (`index.html`) y en el `.lang-switch` del menú.

## Cómo reemplazar fotos y placeholders

Las fotos pendientes (galería, destinos, foto del fundador, tours 02–08) se muestran como un paisaje de marca decorativo (`<div class="photo-placeholder">`) y están marcadas en `index.html` con el comentario `<!-- FOTO PENDIENTE -->`. Para poner una foto real:

1. Copia el original en `assets/img/` (por ejemplo `kavac.jpg`, idealmente ≥ 1920 px de ancho).
2. Añádelo a la lista `PHOTOS` de `scripts/optimize-images.js` y ejecuta `node scripts/optimize-images.js` (requiere `npm install`). Se generan AVIF/WebP/JPG a 640/1280/1920 px en `assets/img/opt/`.
3. Reemplaza el `<div class="photo-placeholder">…</div>` por un `<picture>` igual al de la tarjeta del tour 01 (cambia el nombre de archivo y el `alt`). En la galería, cambia además el `<div class="gallery-item is-placeholder">` por `<button type="button" class="gallery-item" data-full="assets/img/opt/tu-foto-1920.webp" data-caption="…">` para que abra el visor.

## Testimonios

Los testimonios actuales son **de ejemplo** (marcados con la etiqueta "Reseña de ejemplo" / "Sample review"). Reemplaza el nombre, país y cita en `index.html` (sección `#testimonios`) y en `js/i18n.js` (claves `testi1.*`, `testi2.*`, `testi3.*`) con opiniones reales de viajeros.

## Formulario de contacto

El formulario no tiene backend propio; usa [Formspree](https://formspree.io) (plan gratuito). Pasos:

1. Crea una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copia tu Form ID.
3. En `index.html`, reemplaza `YOUR_FORM_ID` en `<form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" ...>` por tu ID real.

Mientras no se configure, el formulario no envía nada: muestra un aviso con un enlace de WhatsApp que ya lleva escrito el mensaje del visitante.

## Datos pendientes de completar

Buscar `[completar]`, `[Nombre del fundador]`, `[Nombre del viajero]`, `[País de origen]` y el marcador de estadística de viajeros en `index.html` / `js/i18n.js` — son los puntos donde falta información real (nombre del fundador, cifra de viajeros, política de cancelación, enlaces reales a redes sociales, etc.), tal como se detalla en el checklist de assets del brief original.

## Despliegue

El sitio ya está preparado para GitHub Pages con dominio propio (`CNAME` → `ivarkarima.com`). Basta con hacer push a la rama publicada en GitHub Pages; no requiere build ni backend.
