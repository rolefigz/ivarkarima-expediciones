/* ============================================================
   IVARKARIMA EXPEDICIONES — Interacciones del sitio
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ── Header sticky ──────────────────────────────────────── */
  var header = document.getElementById("site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Menú móvil ─────────────────────────────────────────── */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileBackdrop = document.getElementById("mobileBackdrop");

  function closeMobileMenu() {
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileBackdrop.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function toggleMobileMenu() {
    var isOpen = mobileMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileBackdrop.classList.toggle("is-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  navToggle.addEventListener("click", toggleMobileMenu);
  mobileBackdrop.addEventListener("click", closeMobileMenu);
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMobileMenu);
  });

  /* ── Revelado al hacer scroll ───────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ── Acordeón de FAQ ────────────────────────────────────── */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove("is-open");
          openItem.querySelector(".faq-answer").style.maxHeight = null;
        }
      });
      item.classList.toggle("is-open", !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : null;
    });
  });

  /* ── Lightbox de galería ────────────────────────────────── */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item:not([disabled])").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var full = btn.getAttribute("data-full");
      var caption = btn.getAttribute("data-caption");
      var img = btn.querySelector("img");
      if (full) openLightbox(full, img ? img.alt : "", caption);
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  /* ── Carrusel de testimonios ────────────────────────────── */
  var track = document.getElementById("testimonialsTrack");
  var prevBtn = document.getElementById("testiPrev");
  var nextBtn = document.getElementById("testiNext");
  if (track && prevBtn && nextBtn) {
    function scrollByCard(dir) {
      var card = track.querySelector(".testimonial-card");
      var gap = 24;
      var amount = card ? card.offsetWidth + gap : 300;
      track.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
  }

  /* ── Formulario de contacto (Formspree, sin backend propio) ── */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        var lang = window.IVK_CURRENT_LANG || "es";
        var msg = lang === "en"
          ? "This form isn't connected yet. Create a free form at formspree.io and replace YOUR_FORM_ID in index.html — or message us directly on WhatsApp for now."
          : "Este formulario aún no está conectado. Crea un formulario gratis en formspree.io y reemplaza YOUR_FORM_ID en index.html — mientras tanto, escríbenos por WhatsApp.";
        status.textContent = msg;
        status.setAttribute("data-state", "error");
        return;
      }
      e.preventDefault();
      var data = new FormData(form);
      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      }).then(function (response) {
        var lang = window.IVK_CURRENT_LANG || "es";
        if (response.ok) {
          status.textContent = lang === "en" ? "Message sent — we'll be in touch soon!" : "¡Mensaje enviado! Te responderemos pronto.";
          status.setAttribute("data-state", "success");
          form.reset();
        } else {
          status.textContent = lang === "en" ? "Something went wrong. Please try WhatsApp instead." : "Algo salió mal. Intenta escribirnos por WhatsApp.";
          status.setAttribute("data-state", "error");
        }
      }).catch(function () {
        var lang = window.IVK_CURRENT_LANG || "es";
        status.textContent = lang === "en" ? "Something went wrong. Please try WhatsApp instead." : "Algo salió mal. Intenta escribirnos por WhatsApp.";
        status.setAttribute("data-state", "error");
      });
    });
  }

  /* ── Año dinámico en footer ─────────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
