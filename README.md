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

## Fotos

Todas las fotos pasan por `scripts/optimize-images.js` (requiere `npm install`):

1. El original va a `assets/img/src/` con un nombre claro (por ejemplo `kavac-canon.jpg`).
2. En la lista `SLOTS` del script, cada hueco de la web indica su foto, su tipo y su punto focal. Los tipos fijan la proporción para que todo cuadre: `card` 16:10 (tarjetas de expediciones), `dest` 4:5 (destinos y "Nosotros") y `gallery` 4:3 (galería).
3. `node scripts/optimize-images.js` genera AVIF/WebP/JPG en `assets/img/opt/` y los anchos reales en `assets/img/opt/photos.json`.

Para cambiar una foto basta con cambiar el `src` (y el `focus` si hace falta) de su hueco y volver a ejecutar el script; el HTML no cambia mientras el nombre del hueco sea el mismo.

Las fotos de terceros vienen de Wikimedia Commons con licencias CC BY / CC BY-SA. Sus autores y licencias están en `assets/img/src/credits.json` y en la página pública `creditos.html` (enlazada en el pie). Si reemplazas una por una foto propia, quítala también de esos dos sitios.

Los originales enviados por WhatsApp están en `assets/img/Fotos/` y no se suben a git (ver `.gitignore`).

## Testimonios

La sección está **oculta** (atributo `hidden` en `#testimonios` y enlaces del menú comentados) hasta tener reseñas reales. Los testimonios actuales son **de ejemplo** (marcados con la etiqueta "Reseña de ejemplo" / "Sample review"). Reemplaza el nombre, país y cita en `index.html` (sección `#testimonios`) y en `js/i18n.js` (claves `testi1.*`, `testi2.*`, `testi3.*`) con opiniones reales de viajeros.

## Formulario de contacto

El formulario no tiene backend propio; usa [Formspree](https://formspree.io) (plan gratuito). Pasos:

1. Crea una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copia tu Form ID.
3. En `index.html`, reemplaza `YOUR_FORM_ID` en `<form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" ...>` por tu ID real.

Mientras no se configure, el botón dice "Enviar por WhatsApp" y abre WhatsApp con el mensaje del visitante ya escrito (nombre, expedición y texto). Al poner el ID real, el formulario pasa solo a enviar por correo.

## Datos pendientes de completar

Buscar `[completar]`, `[Nombre del fundador]`, `[Nombre del viajero]`, `[País de origen]` y el marcador de estadística de viajeros en `index.html` / `js/i18n.js` — son los puntos donde falta información real (nombre del fundador, cifra de viajeros, política de cancelación, enlaces reales a redes sociales, etc.), tal como se detalla en el checklist de assets del brief original.

## Despliegue

El sitio ya está preparado para GitHub Pages con dominio propio (`CNAME` → `ivarkarima.com`). Basta con hacer push a la rama publicada en GitHub Pages; no requiere build ni backend.
