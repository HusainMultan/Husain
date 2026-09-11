/* Karun Jewellers — global behaviour. No framework, progressive enhancement. */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Utilities ---------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function trapFocus(panel) {
    var focusable = qsa('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])', panel);
    if (!focusable.length) return;
    focusable[0].focus();
  }

  /* ---------- Drawers (cart / search / mobile menu) ---------- */
  function openDrawer(el) {
    if (!el) return;
    el.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    trapFocus(el);
  }
  function closeDrawer(el) {
    if (!el) return;
    el.setAttribute("data-open", "false");
    document.body.style.overflow = "";
  }
  qsa("[data-drawer-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.getAttribute("data-drawer-target"));
      openDrawer(target);
    });
  });
  qsa("[data-drawer-close]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeDrawer(btn.closest(".drawer, .mobile-menu"));
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      qsa('.drawer[data-open="true"], .mobile-menu[data-open="true"]').forEach(closeDrawer);
    }
  });

  /* ---------- Ajax Cart ---------- */
  var CartAPI = {
    get: function () {
      return fetch("/cart.js").then(function (r) { return r.json(); });
    },
    add: function (id, quantity) {
      return fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id, quantity: quantity || 1 })
      }).then(function (r) { return r.json(); });
    },
    change: function (line, quantity) {
      return fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: line, quantity: quantity })
      }).then(function (r) { return r.json(); });
    }
  };

  function renderCartCount(count) {
    qsa("[data-cart-count]").forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function refreshCartDrawer() {
    var drawer = qs("#CartDrawer");
    if (!drawer) return;
    fetch("/?section_id=cart-drawer")
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var newDrawer = doc.getElementById("CartDrawer");
        if (newDrawer) {
          drawer.innerHTML = newDrawer.innerHTML;
          bindCartLineEvents();
        }
      });
    CartAPI.get().then(function (cart) { renderCartCount(cart.item_count); });
  }

  function bindCartLineEvents() {
    qsa("[data-qty-decrease]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var line = parseInt(btn.getAttribute("data-line"), 10);
        var input = qs('[data-qty-input="' + line + '"]');
        var newQty = Math.max(0, parseInt(input.value, 10) - 1);
        CartAPI.change(line, newQty).then(refreshCartDrawer);
      });
    });
    qsa("[data-qty-increase]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var line = parseInt(btn.getAttribute("data-line"), 10);
        var input = qs('[data-qty-input="' + line + '"]');
        var newQty = parseInt(input.value, 10) + 1;
        CartAPI.change(line, newQty).then(refreshCartDrawer);
      });
    });
    qsa("[data-cart-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        CartAPI.change(parseInt(btn.getAttribute("data-line"), 10), 0).then(refreshCartDrawer);
      });
    });
  }
  bindCartLineEvents();

  qsa("form[data-product-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var submitBtn = qs('[type="submit"]', form);
      var idInput = qs('[name="id"]', form);
      var qtyInput = qs('[name="quantity"]', form);
      if (submitBtn) submitBtn.setAttribute("disabled", "disabled");
      CartAPI.add(idInput.value, qtyInput ? parseInt(qtyInput.value, 10) : 1)
        .then(function (res) {
          if (res.status) {
            var err = qs("[data-form-error]", form);
            if (err) { err.textContent = res.description || "This item could not be added to your basket."; err.hidden = false; }
          } else {
            refreshCartDrawer();
            openDrawer(qs("#CartDrawer"));
          }
        })
        .finally(function () { if (submitBtn) submitBtn.removeAttribute("disabled"); });
    });
  });

  /* Initial cart count on load */
  CartAPI.get().then(function (cart) { renderCartCount(cart.item_count); }).catch(function () {});

  /* ---------- Quantity selectors (generic, non-cart e.g. product page) ---------- */
  qsa("[data-qty-selector]").forEach(function (wrap) {
    var input = qs("input", wrap);
    var down = qs('[data-step="down"]', wrap);
    var up = qs('[data-step="up"]', wrap);
    if (!input || !down || !up) return;
    down.addEventListener("click", function () {
      input.value = Math.max(parseInt(input.min || 1, 10), parseInt(input.value, 10) - 1);
      input.dispatchEvent(new Event("change"));
    });
    up.addEventListener("click", function () {
      input.value = parseInt(input.value, 10) + 1;
      input.dispatchEvent(new Event("change"));
    });
  });

  /* ---------- Product gallery ---------- */
  qsa("[data-product-gallery]").forEach(function (gallery) {
    var mainImg = qs("[data-gallery-main-img]", gallery);
    qsa("[data-gallery-thumb]", gallery).forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        if (mainImg) mainImg.src = thumb.getAttribute("data-full");
        qsa("[data-gallery-thumb]", gallery).forEach(function (t) { t.setAttribute("aria-current", "false"); });
        thumb.setAttribute("aria-current", "true");
      });
    });
  });

  /* ---------- Variant selection -> update price/availability/url ---------- */
  qsa("[data-variant-selector]").forEach(function (form) {
    var variantsJSON = form.getAttribute("data-variants");
    if (!variantsJSON) return;
    var variants = JSON.parse(variantsJSON);

    function currentSelection() {
      var selected = {};
      qsa("input[type=radio]:checked, select", form).forEach(function (input) {
        selected[input.name] = input.value;
      });
      return selected;
    }
    function findVariant() {
      var selected = currentSelection();
      return variants.find(function (v) {
        return v.options.every(function (opt, idx) {
          var key = "option" + (idx + 1);
          return selected[key] === opt;
        });
      });
    }
    function update() {
      var variant = findVariant();
      var priceEl = qs("[data-variant-price]", form.closest(".product-info") || document);
      var idInput = qs('[name="id"]', form);
      var addBtn = qs('[data-add-to-basket]', form.closest(".product-info") || document);
      var stockEl = qs("[data-variant-stock]", form.closest(".product-info") || document);
      if (!variant) return;
      idInput.value = variant.id;
      if (priceEl) priceEl.textContent = variant.price_formatted;
      if (addBtn) {
        addBtn.disabled = !variant.available;
        addBtn.textContent = variant.available ? addBtn.getAttribute("data-label-available") : addBtn.getAttribute("data-label-unavailable");
      }
      if (stockEl) {
        stockEl.classList.toggle("is-out", !variant.available);
        stockEl.textContent = variant.available ? stockEl.getAttribute("data-label-instock") : stockEl.getAttribute("data-label-outstock");
      }
      if (window.history && window.history.replaceState && variant.url) {
        window.history.replaceState({}, "", variant.url);
      }
    }
    form.addEventListener("change", update);
    update();
  });

  /* ---------- Accordions: nothing needed, native <details> ---------- */

  /* ---------- Sticky mobile add-to-basket ---------- */
  var productForm = qs("[data-product-form]");
  var stickyBar = qs("#MobileStickyATC");
  if (productForm && stickyBar) {
    var trigger = qs("[data-add-to-basket]", productForm);
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        stickyBar.hidden = entry.isIntersecting;
      });
    }, { threshold: 0 });
    if (trigger) observer.observe(trigger);
  }

  /* ---------- Predictive search ---------- */
  var searchInput = qs("[data-predictive-search-input]");
  if (searchInput) {
    var resultsEl = qs("[data-predictive-search-results]");
    var timer;
    searchInput.addEventListener("input", function () {
      clearTimeout(timer);
      var term = searchInput.value.trim();
      if (term.length < 2) { resultsEl.innerHTML = ""; return; }
      timer = setTimeout(function () {
        fetch("/search/suggest.json?q=" + encodeURIComponent(term) + "&resources[type]=product,collection&resources[limit]=6")
          .then(function (r) { return r.json(); })
          .then(function (data) { renderPredictiveResults(data, term); })
          .catch(function () {});
      }, 220);
    });
  }
  function renderPredictiveResults(data, term) {
    var resultsEl = qs("[data-predictive-search-results]");
    if (!resultsEl) return;
    var res = data.resources ? data.resources.results : { products: [], collections: [] };
    var products = res.products || [];
    var collections = res.collections || [];
    if (!products.length && !collections.length) {
      resultsEl.innerHTML = '<p class="predictive-empty">No results found for "' + term.replace(/</g, "&lt;") + '". Try a different search term.</p>';
      return;
    }
    var html = "";
    if (collections.length) {
      html += '<div class="predictive-group"><h4>Collections</h4><ul>' + collections.map(function (c) {
        return '<li><a href="' + c.url + '">' + c.title + "</a></li>";
      }).join("") + "</ul></div>";
    }
    if (products.length) {
      html += '<div class="predictive-group"><h4>Products</h4><ul class="predictive-products">' + products.map(function (p) {
        return '<li><a href="' + p.url + '">' +
          (p.image ? '<img src="' + p.image + '" alt="" width="56" height="56">' : "") +
          '<span><span class="predictive-product-title">' + p.title + '</span><span class="predictive-product-price">' + p.price + "</span></span></a></li>";
      }).join("") + "</ul></div>";
    }
    resultsEl.innerHTML = html;
  }

  /* ---------- Newsletter / contact form success (no-JS safe fallback already works via Shopify) ---------- */

  /* ---------- Scroll reveal animations ---------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    qsa("[data-animate]").forEach(function (el) { revealObserver.observe(el); });
  } else {
    qsa("[data-animate]").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Wishlist (localStorage-based demo implementation) ---------- */
  var WISHLIST_KEY = "karun-jewellers-wishlist";
  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch (e) { return []; }
  }
  function setWishlist(list) {
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function renderWishlistState() {
    var list = getWishlist();
    qsa("[data-wishlist-count]").forEach(function (el) { el.textContent = list.length; el.hidden = list.length === 0; });
    qsa("[data-wishlist-toggle]").forEach(function (btn) {
      var id = btn.getAttribute("data-wishlist-toggle");
      btn.classList.toggle("is-active", list.indexOf(id) > -1);
    });
  }
  qsa("[data-wishlist-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-wishlist-toggle");
      var list = getWishlist();
      var idx = list.indexOf(id);
      if (idx > -1) list.splice(idx, 1); else list.push(id);
      setWishlist(list);
      renderWishlistState();
    });
  });
  renderWishlistState();

  /* ---------- Hero slider ---------- */
  qsa("[data-hero-slider]").forEach(function (slider) {
    var slides = qsa("[data-hero-slide]", slider);
    var dots = qsa("[data-hero-dot]", slider);
    if (slides.length < 2) return;
    var current = 0;
    var autoplayMs = parseInt(slider.getAttribute("data-autoplay"), 10) || 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.setAttribute("data-active", i === current ? "true" : "false"); });
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === current ? "true" : "false"); });
    }
    function next() { show(current + 1); }
    function prev() { show(current - 1); }
    function restartAutoplay() {
      if (!autoplayMs || prefersReducedMotion) return;
      clearInterval(timer);
      timer = setInterval(next, autoplayMs);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); restartAutoplay(); });
    });
    var nextBtn = qs("[data-hero-next]", slider);
    var prevBtn = qs("[data-hero-prev]", slider);
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restartAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restartAutoplay(); });

    var touchStartX = null;
    slider.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) { diff < 0 ? next() : prev(); restartAutoplay(); }
      touchStartX = null;
    }, { passive: true });

    show(0);
    restartAutoplay();
  });

  /* ---------- Showcase / collection carousel arrows ---------- */
  qsa("[data-carousel-track]").forEach(function (track) {
    var wrap = track.closest("[data-carousel-wrap]") || track.parentElement;
    var prevBtn = qs("[data-carousel-prev]", wrap);
    var nextBtn = qs("[data-carousel-next]", wrap);
    function scrollByAmount(dir) {
      var item = track.firstElementChild;
      var amount = item ? item.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
      track.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByAmount(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByAmount(1); });
  });
})();
