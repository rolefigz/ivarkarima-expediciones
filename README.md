# Ivarkarima Expediciones — Sitio web

Sitio estático (HTML/CSS/JS, sin frameworks ni backend) para Ivarkarima Expediciones, C.A.

## Estructura

```
index.html          Página principal (todas las secciones)
privacy.html         Política de Privacidad y Uso de Imágenes (borrador)
terms.html            Términos y Condiciones (borrador)
css/style.css         Todos los estilos
js/i18n.js            Diccionario de traducciones ES/EN + selector de idioma
js/main.js            Menú móvil, scroll reveal, FAQ, galería, carrusel, formulario
assets/img/           Imágenes (logo, favicon, fotos)
robots.txt, sitemap.xml
CNAME                 Dominio para GitHub Pages (ivarkarima.com)
```

## Cómo cambiar el número de WhatsApp

Se define en un solo lugar: `js/i18n.js`, dentro de la función `applyLang`, en esta línea:

```js
a.setAttribute("href", "https://wa.me/584249542480?text=" + ...
```

Cambia `584249542480` por el nuevo número (código de país + número, sin `+` ni espacios). Todos los botones de WhatsApp del sitio (header, hero, tarjetas de tours, botón flotante, sección de contacto) usan este mismo mecanismo.

Los mensajes prellenados de cada botón se editan directamente en `index.html`, en los atributos `data-wa-msg-es` y `data-wa-msg-en` de cada enlace con clase `wa-cta`.

## Cómo cambiar textos

El español vive directamente en `index.html` (atributos `data-i18n="clave"` o `data-i18n-html="clave"` marcan qué texto es traducible). El inglés vive en `js/i18n.js`, dentro del objeto `IVK_I18N.en`, usando las mismas claves. Si cambias un texto en español directamente en el HTML, recuerda actualizar también `IVK_I18N.es` en `js/i18n.js` si quieres que el fallback / la clave siga sincronizada.

Para agregar italiano (opcional, mencionado en el brief): añade un bloque `it: { ... }` en `js/i18n.js` con las mismas claves, y agrega un botón `<button data-lang="it">IT</button>` junto a los de ES/EN en el header (`index.html`) y en el `.lang-switch` del menú.

## Cómo reemplazar fotos y placeholders

Muchas secciones (Galería, Destinos, foto del fundador, tours 2–5) usan cajas de placeholder con el texto "Agrega foto aquí" — son `<div class="photo-placeholder">`. Para reemplazarlas:

1. Coloca la foto real en `assets/img/` (formato `.webp` o `.jpg`, optimizada para web).
2. Reemplaza el bloque `<div class="photo-placeholder">...</div>` por `<img src="assets/img/tu-foto.webp" alt="Descripción" loading="lazy">`.

## Testimonios

Los testimonios actuales son **de ejemplo** (marcados con la etiqueta "Reseña de ejemplo" / "Sample review"). Reemplaza el nombre, país y cita en `index.html` (sección `#testimonios`) y en `js/i18n.js` (claves `testi1.*`, `testi2.*`, `testi3.*`) con opiniones reales de viajeros.

## Formulario de contacto

El formulario no tiene backend propio; usa [Formspree](https://formspree.io) (plan gratuito). Pasos:

1. Crea una cuenta gratuita en formspree.io y un formulario nuevo.
2. Copia tu Form ID.
3. En `index.html`, reemplaza `YOUR_FORM_ID` en `<form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" ...>` por tu ID real.

Mientras no se configure, el formulario muestra un aviso pidiendo escribir por WhatsApp en su lugar.

## Datos pendientes de completar

Buscar `[completar]`, `[Nombre del fundador]`, `[Nombre del viajero]`, `[País de origen]` y el marcador de estadística de viajeros en `index.html` / `js/i18n.js` — son los puntos donde falta información real (nombre del fundador, cifra de viajeros, política de cancelación, enlaces reales a redes sociales, etc.), tal como se detalla en el checklist de assets del brief original.

## Despliegue

El sitio ya está preparado para GitHub Pages con dominio propio (`CNAME` → `ivarkarima.com`). Basta con hacer push a la rama publicada en GitHub Pages; no requiere build ni backend.
