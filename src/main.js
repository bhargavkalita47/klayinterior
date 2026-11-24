/* KLAY — independent architectural portfolio concept.
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

  // Design A is final. Ignore legacy query strings and saved concept choices.
  body.dataset.concept = "a";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", "#f4f1eb");

  function closeMenu(restore) {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mobileMenu.inert = true;
    if (restore) menuToggle.focus();
  }
  function openMenu() {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    updateMenuPosition();
    body.classList.add("menu-open");
    updateMenuPosition();
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
    updateMenuPosition();
    refreshCarousel();
  });
  window.addEventListener("scroll", updateMenuPosition, { passive: true });
  function updateMenuPosition() {
    if (body.dataset.concept !== "a" || !body.classList.contains("menu-open")) return;
    const bottom = document.getElementById("site-header").getBoundingClientRect().bottom;
    body.style.setProperty("--klay-menu-top", Math.max(70, Math.round(bottom)) + "px");
  }

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
    document.querySelectorAll("[data-nav], [data-mobile-link]").forEach(function (link) {
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
    requestAnimationFrame(refreshCarousel);
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
    lightboxImage.classList.remove("klay-photo-in");
    const thumbs = document.querySelector(".klay-lightbox-thumbs");
    if (thumbs) thumbs.replaceChildren();
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
    updateGalleryThumbnails();
    if (body.dataset.concept === "a" && window.matchMedia("(max-width:760px) and (prefers-reduced-motion:no-preference)").matches) {
      lightboxImage.classList.remove("klay-photo-in");
      void lightboxImage.offsetWidth;
      lightboxImage.classList.add("klay-photo-in");
    }
  }
  function openLightbox(image) {
    const page = image.closest(".project-page");
    if (!page || page.hidden) return;
    gallery = Array.from(page.querySelectorAll(".project-gallery img")).filter(function (img) { return !img.closest(".is-broken"); });
    galleryIndex = gallery.indexOf(image);
    if (galleryIndex < 0) return;
    restoreFocus = image;
    lightbox.hidden = false;
    buildGalleryThumbnails();
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
        const focusables = [document.getElementById("lightbox-close"), document.getElementById("lightbox-prev"), document.getElementById("lightbox-next")].concat(Array.from(lightbox.querySelectorAll(".klay-lightbox-thumbs button")).filter(function (button) { return button.getClientRects().length > 0; }));
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

  // KLAY mobile component adaptations. Native DOM + scroll snapping, no runtime dependencies.
  // References: Spell UI Slide Up Text, BagUI responsive navbar, UI TripleD gallery/lightbox.
  const mobileA = function () { return body.dataset.concept === "a" && window.matchMedia("(max-width:760px)").matches; };
  const editorialGrid = document.querySelector(".editorial-grid");
  let carouselControls = null;
  let carouselIndex = 0;
  let carouselFrame = 0;

  function refreshCarousel() {
    if (!carouselControls || !editorialGrid || !mobileA() || !editorialGrid.clientWidth) return;
    const cards = Array.from(editorialGrid.querySelectorAll(".editorial-project"));
    const left = editorialGrid.getBoundingClientRect().left + parseFloat(getComputedStyle(editorialGrid).paddingLeft);
    const max = editorialGrid.scrollWidth - editorialGrid.clientWidth;
    carouselIndex = cards.reduce(function (nearest, card, i) {
      return Math.abs(card.getBoundingClientRect().left - left) < Math.abs(cards[nearest].getBoundingClientRect().left - left) ? i : nearest;
    }, 0);
    if (max > 0 && editorialGrid.scrollLeft >= max - 3) carouselIndex = cards.length - 1;
    carouselControls.querySelector(".klay-carousel-count").textContent = String(carouselIndex + 1).padStart(2, "0") + " / " + String(cards.length).padStart(2, "0");
    carouselControls.style.setProperty("--klay-progress", ((carouselIndex + 1) / cards.length * 100) + "%");
    carouselControls.querySelector("[data-carousel-prev]").disabled = carouselIndex === 0;
    carouselControls.querySelector("[data-carousel-next]").disabled = carouselIndex === cards.length - 1;
  }
  function moveCarousel(direction) {
    const cards = Array.from(editorialGrid.querySelectorAll(".editorial-project"));
    const next = Math.max(0, Math.min(cards.length - 1, carouselIndex + direction));
    const left = editorialGrid.getBoundingClientRect().left + parseFloat(getComputedStyle(editorialGrid).paddingLeft);
    const offset = cards[next].getBoundingClientRect().left - left + editorialGrid.scrollLeft;
    editorialGrid.scrollTo({left:offset,behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches ? "instant" : "smooth"});
  }
  if (editorialGrid) {
    editorialGrid.id = "klay-selected-projects";
    editorialGrid.classList.add("klay-carousel");
    carouselControls = document.createElement("div");
    carouselControls.className = "klay-carousel-controls";
    carouselControls.setAttribute("role", "group");
    carouselControls.setAttribute("aria-label", "Selected projects navigation");
    carouselControls.innerHTML = '<span class="klay-carousel-count" aria-live="polite">01 / 04</span><div class="klay-carousel-progress" aria-hidden="true"><span></span></div><button type="button" data-carousel-prev aria-label="Previous project" aria-controls="klay-selected-projects" disabled>←</button><button type="button" data-carousel-next aria-label="Next project" aria-controls="klay-selected-projects">→</button>';
    editorialGrid.after(carouselControls);
    carouselControls.querySelector("[data-carousel-prev]").addEventListener("click", function () { moveCarousel(-1); });
    carouselControls.querySelector("[data-carousel-next]").addEventListener("click", function () { moveCarousel(1); });
    editorialGrid.addEventListener("scroll", function () {
      if (carouselFrame) return;
      carouselFrame = requestAnimationFrame(function () { carouselFrame = 0; refreshCarousel(); });
    }, { passive:true });
    requestAnimationFrame(refreshCarousel);
  }

  const heroTitle = document.getElementById("hero-a-title");
  if (heroTitle) {
    const walker = document.createTreeWalker(heroTitle, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let wordIndex = 0;
    heroTitle.setAttribute("aria-label", heroTitle.innerText.replace(/\s+/g, " ").trim() || "Your space must do the talking.");
    nodes.forEach(function (node) {
      if (node.parentElement.classList.contains("hero-a__period")) return;
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).filter(Boolean).forEach(function (piece) {
        if (/^\s+$/.test(piece)) { fragment.append(document.createTextNode(piece)); return; }
        const mask = document.createElement("span");
        const word = document.createElement("span");
        mask.className = "klay-word-mask";
        mask.style.setProperty("--klay-word-index", wordIndex++);
        word.textContent = piece;
        mask.append(word);
        fragment.append(mask);
      });
      node.replaceWith(fragment);
    });
    heroTitle.classList.add("klay-staggered");
  }

  const galleryThumbs = document.createElement("div");
  galleryThumbs.className = "klay-lightbox-thumbs";
  galleryThumbs.setAttribute("role","group");
  galleryThumbs.setAttribute("aria-label","Choose a project photograph");
  lightbox.append(galleryThumbs);
  function buildGalleryThumbnails() {
    galleryThumbs.replaceChildren();
    if (!mobileA()) return;
    gallery.forEach(function (photo, i) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "View photograph " + (i + 1) + ": " + photo.alt);
      const thumbnail = document.createElement("img");
      thumbnail.src = photo.currentSrc || photo.src;
      thumbnail.alt = "";
      button.append(thumbnail);
      button.addEventListener("click", function () { showGalleryPhoto(i); });
      galleryThumbs.append(button);
    });
  }
  function updateGalleryThumbnails() {
    if (!galleryThumbs) return;
    Array.from(galleryThumbs.children).forEach(function (button,i) { button.setAttribute("aria-pressed", String(i === galleryIndex)); });
  }
  window.addEventListener("resize", function () {
    if (!lightbox.hidden) { buildGalleryThumbnails(); updateGalleryThumbnails(); }
  });

  const newsletterForm = document.getElementById("newsletter-signup");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!newsletterForm.reportValidity()) return;
      const email = String(new FormData(newsletterForm).get("email") || "").trim();
      const subject = "KLAY Studio Notes — newsletter signup request";
      const message = ["Hello KLAY Interior Studio,", "", "I would like to receive your newsletter and studio updates at this email address:", email, "", "Thank you."].join("\n");
      const status = document.getElementById("newsletter-status");
      status.textContent = "Send the prepared email to request a subscription. No signup has been recorded by this preview.";
      window.location.href = "mailto:klayinteriorstudio@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);
    });
  }

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
