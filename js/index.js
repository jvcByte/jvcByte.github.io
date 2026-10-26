/**
 * Template Name: SnapFolio
 * Template URL: https://bootstrapmade.com/snapfolio-bootstrap-portfolio-template/
 * Updated: Jul 21 2025 with Bootstrap v5.3.7
 * Author: BootstrapMade.com
 * License: https://bootstrapmade.com/license/
 */

(function () {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector(".header-toggle");

  function headerToggle() {
    document.querySelector("#header").classList.toggle("header-show");
    headerToggleBtn.classList.toggle("bi-list");
    headerToggleBtn.classList.toggle("bi-x");
  }
  headerToggleBtn.addEventListener("click", headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".header-show")) {
        headerToggle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle("active");
      this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }
  scrollTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector(".typed");
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute("data-typed-items");
    typed_strings = typed_strings.split(",");
    new Typed(".typed", {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,
      smartBackspace: true,
      html: false,
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll(".skills-animation");
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: "80%",
      handler: function (direction) {
        let progress = item.querySelectorAll(".progress .progress-bar");
        progress.forEach((el) => {
          el.style.width = el.getAttribute("aria-valuenow") + "%";
        });
      },
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll(".isotope-layout").forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute("data-layout") ?? "masonry";
    let filter = isotopeItem.getAttribute("data-default-filter") ?? "*";
    let sort = isotopeItem.getAttribute("data-sort") ?? "original-order";

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector(".isotope-container"), function () {
      initIsotope = new Isotope(
        isotopeItem.querySelector(".isotope-container"),
        {
          itemSelector: ".isotope-item",
          layoutMode: layout,
          filter: filter,
          sortBy: sort,
        }
      );
    });

    isotopeItem
      .querySelectorAll(".isotope-filters li")
      .forEach(function (filters) {
        filters.addEventListener(
          "click",
          function () {
            isotopeItem
              .querySelector(".isotope-filters .filter-active")
              .classList.remove("filter-active");
            this.classList.add("filter-active");
            initIsotope.arrange({
              filter: this.getAttribute("data-filter"),
            });
            if (typeof aosInit === "function") {
              aosInit();
            }
          },
          false
        );
      });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener("load", function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: "smooth",
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll(".navmenu a");

  function navmenuScrollspy() {
    navmenulinks.forEach((navmenulink) => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        document
          .querySelectorAll(".navmenu a.active")
          .forEach((link) => link.classList.remove("active"));
        navmenulink.classList.add("active");
      } else {
        navmenulink.classList.remove("active");
      }
    });
  }
  window.addEventListener("load", navmenuScrollspy);
  document.addEventListener("scroll", navmenuScrollspy);
})();

/**
 * Prefill the contact form when a visitor arrives from the template library:
 *   jvcbyte.dev/?template=Classic%20Fashion&category=Clothing%20%26%20Fashion#contact
 * The "Use this template" buttons on templates.jvcbyte.dev link here.
 */
(function () {
  const params = new URLSearchParams(window.location.search);
  const template = params.get("template");
  if (!template) return;

  const category = params.get("category") || "";
  const form = document.querySelector(".contact-form form");
  if (!form) return;

  const subject = form.querySelector('[name="subject"]');
  const message = form.querySelector('[name="message"]');

  if (subject && !subject.value) {
    subject.value = `Template enquiry — ${template}`;
  }
  if (message && !message.value) {
    message.value =
      `Hi John,\n\n` +
      `I'm interested in the "${template}" template` +
      (category ? ` from your ${category} collection` : "") +
      `.\n\nA bit about the project:\n\n`;
  }
})();

/**
 * Re-assert the URL hash once the page reaches its real height.
 *
 * The project grid is fetched and laid out after first paint, which pushes
 * every following section down by thousands of pixels. The browser honours
 * the hash against the pre-fetch height, so arriving at #contact lands in the
 * middle of Projects and the visitor has to scroll down to find the form.
 */
(function () {
  const hash = window.location.hash;
  if (hash.length < 2) return;

  const target = document.querySelector(hash);
  if (!target) return;

  let userTookOver = false;
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach((evt) => {
    // if the visitor starts moving themselves, stop correcting under them
    window.addEventListener(evt, () => { userTookOver = true; }, { once: true, passive: true });
  });

  let aligned = false;
  const align = () => {
    if (aligned || userTookOver) return;
    aligned = true;
    target.scrollIntoView({ behavior: "instant", block: "start" });
  };

  /* Wait for the document height to stop changing rather than guessing a
     delay: the grid is injected, then isotope lays the cards out, then images
     settle — each of those moves everything below. */
  const settle = () => {
    let last = -1;
    let stable = 0;
    const tick = setInterval(() => {
      const h = document.documentElement.scrollHeight;
      if (h === last) {
        if (++stable >= 3) {
          clearInterval(tick);
          align();
        }
      } else {
        last = h;
        stable = 0;
      }
    }, 150);
    setTimeout(() => { clearInterval(tick); align(); }, 4000); // fail-safe
  };

  const grid = document.getElementById("dyn-projects");
  const waiting = grid && grid.children.length === 0 && window.MutationObserver;

  if (waiting) {
    const observer = new MutationObserver(() => {
      if (grid.children.length) {
        observer.disconnect();
        settle();
      }
    });
    observer.observe(grid, { childList: true });
    setTimeout(settle, 3500); // fallback if the fetch never resolves
  } else {
    settle();
  }
})();
