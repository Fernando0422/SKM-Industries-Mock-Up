/* SKM Industries redesign v2 - behavior */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  var yrEl = document.getElementById("yr");
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  /* Sticky header: shrink top bar on scroll */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  if (toggle && nav) {
    var close = function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-lock");
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-lock", open);
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* Scroll reveal */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var revealAll = function () {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else if (revealEls.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          ro.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });

    /* Fallback: anything at or above the viewport must never stay invisible,
       even if the observer stalls or misses a tall block. */
    var checkVisible = function () {
      var limit = window.scrollY + window.innerHeight;
      revealEls = revealEls.filter(function (el) {
        if (el.classList.contains("is-in")) return false;
        if (el.getBoundingClientRect().top + window.scrollY < limit) {
          el.classList.add("is-in");
          return false;
        }
        return true;
      });
    };
    window.addEventListener("scroll", checkVisible, { passive: true });
    window.addEventListener("resize", checkVisible);
    window.addEventListener("load", checkVisible);
    setTimeout(checkVisible, 1200);
  }

  /* Animated counters: data-count on .statcell .n */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      var dur = 1200, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        p = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * p).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(step);
    };
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            run(en.target);
            co.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* Gallery filter */
  var filterBtns = document.querySelectorAll(".filters button");
  var gallery = document.querySelector(".gallery");
  if (filterBtns.length && gallery) {
    var items = gallery.querySelectorAll(".g-item");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        items.forEach(function (it) {
          var show = f === "all" || it.getAttribute("data-cat") === f;
          it.classList.toggle("hidden", !show);
        });
      });
    });
  }

  /* Lightbox for gallery (minimal, keyboard accessible) */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    var lbClose = lightbox.querySelector(".lb-close");
    var openLb = function (fig) {
      var im = fig.querySelector("img");
      if (!im) return;
      lbImg.src = im.src;
      lbImg.alt = im.alt || "";
      lbCap.textContent = (fig.querySelector("figcaption") || {}).textContent || "";
      lightbox.classList.add("open");
      document.body.classList.add("nav-lock");
      lbClose.focus();
    };
    gallery.querySelectorAll(".g-item").forEach(function (fig) {
      fig.setAttribute("tabindex", "0");
      fig.setAttribute("role", "button");
      fig.addEventListener("click", function () { openLb(fig); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(fig); }
      });
    });
    var closeLb = function () {
      lightbox.classList.remove("open");
      document.body.classList.remove("nav-lock");
    };
    lbClose.addEventListener("click", closeLb);
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }
})();
