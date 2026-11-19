/* KLAY — independent dual-direction portfolio concept.
   No tracking, backend, form collection or third-party UI dependencies. */
(function () {
  "use strict";

  const body = document.body;
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCount = document.getElementById("lightbox-count");
  const knownPages = ["home", "work", "studio", "contact"];
  const projectSlugs = ["protech-prime", "digital-empire", "hatigaon-duplex", "shubham-heights"];
  const pageTitles = {
    home: "KLAY Interior Studio — Independent Design Concept",
    work: "Selected Projects — KLAY Interior Studio",
    studio: "The Studio — KLAY Interior Studio",
    contact: "Contact — KLAY Interior Studio",
    "project-protech-prime": "Protech Prime — KLAY Interior Studio",
    "project-digital-empire": "Digital Empire — KLAY Interior Studio",
    "project-hatigaon-duplex": "Hatigaon Duplex — KLAY Interior Studio",
    "project-shubham-heights": "Shubham Heights — KLAY Interior Studio"
  };
  let gallery = [];
  let galleryIndex = 0;
  let restoreFocus = null;
  let touchStartX = null;
  let revealObserver = null;

  function safeGetPreference() {
    try { return window.localStorage.getItem("klay-concept"); } catch (_) { return null; }
  }
  function safeSetPreference(value) {
    try { window.localStorage.setItem("klay-concept", value); } catch (_) { /* storage optional */ }
  }
  function switchConcept(next) {
    if (next !== "a" && next !== "c") return;
    body.dataset.concept = next;
    document.querySelectorAll("[data-set-concept]").forEach(function (button) {
      const isActive = button.dataset.setConcept === next;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelector('meta[name="theme-color"]').setAttribute("content", next === "a" ? "#f4f1eb" : "#f0f1ed");
    safeSetPreference(next);
  }

  const urlPreference = new URLSearchParams(window.location.search).get("concept");
  switchConcept(urlPreference === "a" || urlPreference === "c" ? urlPreference : (safeGetPreference() === "c" ? "c" : "a"));
  document.querySelectorAll("[data-set-concept]").forEach(function (button) {
    button.addEventListener("click", function () { switchConcept(button.dataset.setConcept); });
  });

  function closeMenu(restore) {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.inert = true;
    if (restore) menuToggle.focus();
  }
  function openMenu() {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    mobileMenu.inert = false;
    const firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus();
  }
  menuToggle.addEventListener("click", function () {
    if (body.classList.contains("menu-open")) closeMenu(false);
    else openMenu();
  });
  document.querySelectorAll("[data-mobile-link]").forEach(function (link) {
    link.addEventListener("click", function () { closeMenu(false); });
  });
  document.getElementById("site-header").addEventListener("click", function (event) {
    if (body.classList.contains("menu-open") && !menuToggle.contains(event.target)) closeMenu(false);
  });
  window.addEventListener("resize", function () {
    if (!window.matchMedia("(max-width: 760px)").matches && body.classList.contains("menu-open")) closeMenu(false);
  });

  function resolveRoute() {
    const path = decodeURIComponent((window.location.hash || "#/").replace(/^#\/?/, "")).replace(/\/+$/, "");
    if (!path) return "home";
    if (knownPages.includes(path)) return path;
    if (path.indexOf("project/") === 0) {
      const slug = path.split("/")[1];
      if (projectSlugs.includes(slug)) return "project-" + slug;
    }
    return "work";
  }

  function setupReveal() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -25px 0px", threshold: 0.04 });
    }
    document.querySelectorAll('.page:not([hidden]) .reveal').forEach(function (element) {
      if (element.classList.contains("is-visible")) return;
      element.classList.add("will-reveal");
      revealObserver.observe(element);
    });
  }

  function renderRoute() {
    const route = resolveRoute();
    closeMenu(false);
    closeLightbox();
    document.querySelectorAll("[data-page]").forEach(function (page) {
      page.hidden = page.dataset.page !== route;
    });
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      let url = (link.getAttribute("href") || "").slice(2);
      const current = route === "home" ? url === "" : (route.indexOf("project-") === 0 ? url === "work" : url === route);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.title = pageTitles[route] || pageTitles.home;
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = route === "home"
        ? "KLAY Interior Studio — independent architectural portfolio website design exploration for a Guwahati-based interior design practice."
        : "Discover " + document.title.split(" — ")[0] + " at KLAY Interior Studio, Guwahati. Independent, unofficial redesign concept.";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    requestAnimationFrame(setupReveal);
  }
  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selected = button.dataset.filter;
      filterButtons.forEach(function (item) {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".work-card[data-category]").forEach(function (card) {
        card.hidden = selected !== "all" && card.dataset.category !== selected;
      });
    });
  });

  function imageFallback(image) {
    if (image.dataset.fallbackAttempt !== "yes" && image.src.indexOf("klayinteriorstudio.com/wp-content/uploads/") !== -1) {
      image.dataset.fallbackAttempt = "yes";
      const source = image.getAttribute("src");
      image.src = "https://ml8lyimzlldy.i.optimole.com/w:auto/h:auto/q:mauto/f:best/" + source;
      return;
    }
    const holder = image.closest(".media-frame");
    if (holder) holder.classList.add("is-broken");
    image.alt = image.alt + " (photograph temporarily unavailable)";
  }
  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () { imageFallback(image); });
    if (image.complete && image.naturalWidth === 0) imageFallback(image);
  });

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    body.classList.remove("lightbox-open");
    lightboxImage.removeAttribute("src");
    if (restoreFocus && restoreFocus.isConnected) restoreFocus.focus();
    restoreFocus = null;
  }
  function showGalleryPhoto(index) {
    if (!gallery.length) return;
    galleryIndex = (index + gallery.length) % gallery.length;
    const item = gallery[galleryIndex];
    lightboxImage.src = item.currentSrc || item.src;
    lightboxImage.alt = item.alt || "Project photograph";
    const caption = item.closest("figure").querySelector("figcaption");
    lightboxCaption.textContent = caption ? caption.textContent : "";
    lightboxCount.textContent = String(galleryIndex + 1).padStart(2, "0") + " / " + String(gallery.length).padStart(2, "0");
  }
  function openLightbox(image) {
    const page = image.closest(".project-page");
    if (!page || page.hidden) return;
    gallery = Array.from(page.querySelectorAll(".project-gallery img")).filter(function (img) { return !img.closest(".is-broken"); });
    galleryIndex = gallery.indexOf(image);
    if (galleryIndex < 0) return;
    restoreFocus = image;
    lightbox.hidden = false;
    body.classList.add("lightbox-open");
    showGalleryPhoto(galleryIndex);
    document.getElementById("lightbox-close").focus();
  }
  document.querySelectorAll(".project-gallery img").forEach(function (image) {
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "Enlarge photograph: " + image.alt);
    image.addEventListener("click", function () { openLightbox(image); });
    image.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openLightbox(image); }
    });
  });
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", function () { showGalleryPhoto(galleryIndex - 1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { showGalleryPhoto(galleryIndex + 1); });
  lightbox.addEventListener("click", function (event) { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("touchstart", function (event) { touchStartX = event.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", function (event) {
    if (touchStartX === null) return;
    const difference = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(difference) > 50) showGalleryPhoto(galleryIndex + (difference < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });
  document.addEventListener("keydown", function (event) {
    if (!lightbox.hidden) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") showGalleryPhoto(galleryIndex + 1);
      if (event.key === "ArrowLeft") showGalleryPhoto(galleryIndex - 1);
      if (event.key === "Tab") {
        const focusables = [document.getElementById("lightbox-close"), document.getElementById("lightbox-prev"), document.getElementById("lightbox-next")];
        const activeIndex = focusables.indexOf(document.activeElement);
        if (activeIndex >= 0) {
          event.preventDefault();
          focusables[(activeIndex + (event.shiftKey ? focusables.length - 1 : 1)) % focusables.length].focus();
        }
      }
      return;
    }
    if (event.key === "Escape" && body.classList.contains("menu-open")) closeMenu(true);
    if (body.classList.contains("menu-open") && event.key === "Tab") {
      const focusable = [menuToggle].concat(Array.from(mobileMenu.querySelectorAll("a")));
      const index = focusable.indexOf(document.activeElement);
      if (index !== -1) {
        event.preventDefault();
        focusable[(index + (event.shiftKey ? focusable.length - 1 : 1)) % focusable.length].focus();
      }
    }
  });

  const contactForm = document.getElementById("project-enquiry");
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const space = String(data.get("space") || "").trim();
    const location = String(data.get("location") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = "Project enquiry for KLAY — " + (space || "Interior design");
    const text = ["Hello KLAY Interior Studio,", "", "I'd like to enquire about a project.", "", "Name: " + name, "Email: " + email, "Space: " + space, "Location: " + (location || "Not specified"), "", "About my project:", message || "I'd like to discuss my interior design requirements.", "", "Kind regards,", name].join("\n");
    window.location.href = "mailto:klayinteriorstudio@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  });
})();
