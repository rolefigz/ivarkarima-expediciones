/* ============================================================
   IVARKARIMA EXPEDICIONES — Interacciones del sitio
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  var t = window.IVK_t || function (k) { return k; };
  var root = document.documentElement;

  /* ── Utilidades: bloqueo de scroll y fondo inerte ───────── */
  var scrollLocks = 0;
  function lockScroll() {
    scrollLocks++;
    root.classList.add("is-scroll-locked");
  }
  function unlockScroll() {
    scrollLocks = Math.max(0, scrollLocks - 1);
    if (!scrollLocks) root.classList.remove("is-scroll-locked");
  }

  // Todo lo que queda "detrás" de un diálogo abierto
  var backgroundEls = [
    document.querySelector(".skip-link"),
    document.getElementById("site-header"),
    document.getElementById("mobileMenu"),
    document.getElementById("main"),
    document.querySelector(".site-footer"),
    document.querySelector(".whatsapp-float")
  ].filter(Boolean);

  function setInert(els, on) {
    els.forEach(function (el) {
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function focusables(container) {
    return Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }
  // Mantiene Tab / Shift+Tab dentro del contenedor
  function trapTab(e, container) {
    if (e.key !== "Tab") return;
    var items = focusables(container);
    if (!items.length) { e.preventDefault(); return; }
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ── Diálogos (modales de itinerario y lightbox) ────────── */
  var openDialog = null;

  function showDialog(dialog, opener, focusTarget) {
    if (openDialog) hideDialog(openDialog, false);
    openDialog = { el: dialog, opener: opener || document.activeElement };
    dialog.classList.add("is-open");
    dialog.removeAttribute("aria-hidden");
    setInert(backgroundEls, true);
    lockScroll();
    (focusTarget || dialog.querySelector("[data-dialog-close]") || focusables(dialog)[0] || dialog).focus();
  }

  function hideDialog(state, restoreFocus) {
    state = state || openDialog;
    if (!state) return;
    state.el.classList.remove("is-open");
    state.el.setAttribute("aria-hidden", "true");
    setInert(backgroundEls, false);
    unlockScroll();
    if (state.el.id === "lightbox") document.getElementById("lightboxImg").removeAttribute("src");
    if (openDialog === state) openDialog = null;
    if (restoreFocus !== false && state.opener && document.contains(state.opener)) state.opener.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (!openDialog) return;
    if (e.key === "Escape") { e.preventDefault(); hideDialog(); return; }
    trapTab(e, openDialog.el);
    if (openDialog && openDialog.el.id === "lightbox" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      stepLightbox(e.key === "ArrowRight" ? 1 : -1);
    }
  });

  document.querySelectorAll(".tour-modal, .lightbox").forEach(function (dialog) {
    dialog.setAttribute("aria-hidden", "true");
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.closest("[data-dialog-close]")) hideDialog();
    });
  });

  /* ── Modal de itinerario completo ("Ver más" de cada tour) ── */
  document.querySelectorAll("[data-tour-modal]").forEach(function (btn) {
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", function () {
      var modal = document.getElementById(btn.getAttribute("data-tour-modal"));
      if (modal) showDialog(modal, btn);
    });
  });

  /* ── Lightbox de galería ────────────────────────────────── */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery-item[data-full]"));
  var lightboxIndex = 0;

  function fillLightbox(index) {
    var btn = galleryItems[index];
    if (!btn) return;
    lightboxIndex = index;
    var img = btn.querySelector("img");
    lightboxImg.src = btn.getAttribute("data-full");
    lightboxImg.alt = img ? img.alt : "";
    lightboxCaption.textContent = btn.getAttribute("data-caption") || "";
  }
  function stepLightbox(dir) {
    if (galleryItems.length < 2) return;
    fillLightbox((lightboxIndex + dir + galleryItems.length) % galleryItems.length);
  }
  galleryItems.forEach(function (btn, i) {
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", function () {
      fillLightbox(i);
      showDialog(lightbox, btn);
    });
  });

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
  var desktopMQ = window.matchMedia("(min-width: 1101px)");
  var menuBehind = [
    document.getElementById("main"),
    document.querySelector(".site-footer"),
    document.querySelector(".whatsapp-float"),
    document.querySelector(".brand")
  ].filter(Boolean);

  function isMenuOpen() { return mobileMenu.classList.contains("is-open"); }

  function setMobileMenu(open, restoreFocus) {
    if (open === isMenuOpen()) return;
    mobileMenu.classList.toggle("is-open", open);
    mobileBackdrop.classList.toggle("is-open", open);
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    setInert([mobileMenu], !open);
    setInert(menuBehind, open);
    if (open) {
      lockScroll();
      var first = mobileMenu.querySelector("a");
      if (first) first.focus();
    } else {
      unlockScroll();
      if (restoreFocus) navToggle.focus();
    }
  }

  setInert([mobileMenu], true);
  navToggle.addEventListener("click", function () { setMobileMenu(!isMenuOpen()); });
  mobileBackdrop.addEventListener("click", function () { setMobileMenu(false, true); });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMobileMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMenuOpen()) setMobileMenu(false, true);
  });
  // Si se pasa a escritorio con el menú abierto, se cierra y se libera el scroll
  function onBreakpoint(e) { if (e.matches) setMobileMenu(false); }
  if (desktopMQ.addEventListener) desktopMQ.addEventListener("change", onBreakpoint);
  else if (desktopMQ.addListener) desktopMQ.addListener(onBreakpoint);

  /* ── Revelado al hacer scroll ───────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
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
  var faqItems = document.querySelectorAll(".faq-item");

  function setFaq(item, open) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    item.classList.toggle("is-open", open);
    question.setAttribute("aria-expanded", String(open));
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : null;
  }
  // Recalcula la altura de las respuestas abiertas (cambio de idioma, resize)
  function refreshFaq() {
    document.querySelectorAll(".faq-item.is-open .faq-answer").forEach(function (answer) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    });
  }

  faqItems.forEach(function (item, i) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    question.id = question.id || "faq-q" + (i + 1);
    answer.id = answer.id || "faq-a" + (i + 1);
    question.setAttribute("aria-controls", answer.id);
    question.setAttribute("aria-expanded", "false");
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", question.id);
    question.addEventListener("click", function () {
      var willOpen = !item.classList.contains("is-open");
      faqItems.forEach(function (other) {
        if (other !== item && other.classList.contains("is-open")) setFaq(other, false);
      });
      setFaq(item, willOpen);
    });
  });

  /* ── Carrusel de testimonios ────────────────────────────── */
  var track = document.getElementById("testimonialsTrack");
  var prevBtn = document.getElementById("testiPrev");
  var nextBtn = document.getElementById("testiNext");

  function updateCarouselButtons() {
    if (!track) return;
    var max = track.scrollWidth - track.clientWidth;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= max - 2;
    // Si todo cabe, los controles sobran
    prevBtn.parentNode.hidden = max <= 2;
  }
  function scrollByCard(dir) {
    var card = track.querySelector(".testimonial-card");
    var gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    var amount = card ? card.offsetWidth + gap : 300;
    track.scrollBy({ left: dir * amount, behavior: reduceMotion ? "auto" : "smooth" });
  }

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    nextBtn.addEventListener("click", function () { scrollByCard(1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); scrollByCard(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollByCard(-1); }
    });
    var scrollTimer;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateCarouselButtons, 60);
    }, { passive: true });
    updateCarouselButtons();
  }

  /* ── Recalcular al cambiar idioma o tamaño ──────────────── */
  var resizeRaf;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      refreshFaq();
      updateCarouselButtons();
    });
  });
  document.addEventListener("ivk:langchange", function () {
    refreshFaq();
    updateCarouselButtons();
  });

  /* ── Formulario de contacto (Formspree, sin backend propio) ── */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  function waLinkFromForm() {
    var fields = new FormData(form);
    var lines = [t("contact.form.waIntro")];
    var name = (fields.get("name") || "").trim();
    var tour = form.querySelector("#tour option:checked");
    var message = (fields.get("message") || "").trim();
    if (name) lines.push(t("contact.form.name") + ": " + name);
    if (tour && tour.value) lines.push(t("contact.form.tour") + ": " + tour.textContent.trim());
    if (message) lines.push(message);
    return (window.IVK_waHref || function () { return "https://wa.me/584249542480"; })(lines.join("\n"));
  }

  function showStatus(state, key, withWhatsApp) {
    status.setAttribute("data-state", state);
    status.textContent = t(key);
    if (withWhatsApp) {
      var a = document.createElement("a");
      a.href = waLinkFromForm();
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "form-status-link";
      a.textContent = t("contact.form.waLink") + " →";
      status.appendChild(document.createTextNode(" "));
      status.appendChild(a);
    }
  }

  if (form && status) {
    var submitBtn = form.querySelector('button[type="submit"]');
    var sending = false;
    var formspreeReady = (form.getAttribute("action") || "").indexOf("YOUR_FORM_ID") === -1;

    // Sin Formspree configurado, el formulario envía la consulta por WhatsApp
    if (!formspreeReady) {
      submitBtn.setAttribute("data-i18n", "contact.form.submitWa");
      submitBtn.textContent = t("contact.form.submitWa");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;

      var action = form.getAttribute("action") || "";
      if (!formspreeReady) {
        window.open(waLinkFromForm(), "_blank", "noopener");
        showStatus("info", "contact.form.opened", true);
        return;
      }

      sending = true;
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      status.setAttribute("data-state", "pending");
      status.textContent = t("contact.form.sending");

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        showStatus("success", "contact.form.success", false);
        form.reset();
      }).catch(function () {
        showStatus("error", "contact.form.error", true);
      }).then(function () {
        sending = false;
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      });
    });
  }

  /* ── Año dinámico en footer ─────────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
