/* =============================================================================
   MASSTORTS247 — Shared Responsive Behavior
   Phase 2.1 infrastructure. Companion to masstorts247.css.
   Vanilla JS, no dependencies. Self-contained IIFE.
   Created by Chady Elias — Visionary and Creator
   ============================================================================= */

(function () {
  'use strict';

  /* ---------- helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- 1. Mobile drawer ---------- */
  function initDrawer() {
    var toggle   = $('.mt-nav-toggle');
    var drawer   = $('.mt-drawer');
    var backdrop = $('.mt-drawer-backdrop');
    var closeBtn = $('.mt-drawer-close');
    if (!toggle || !drawer || !backdrop) return;

    function open() {
      drawer.setAttribute('data-open', 'true');
      backdrop.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mt-no-scroll');
      // Focus first link for accessibility
      var firstLink = $('.mt-drawer-links a', drawer);
      if (firstLink) firstLink.focus();
    }
    function close() {
      drawer.setAttribute('data-open', 'false');
      backdrop.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mt-no-scroll');
      toggle.focus();
    }

    toggle.addEventListener('click', function () {
      var isOpen = drawer.getAttribute('data-open') === 'true';
      isOpen ? close() : open();
    });
    backdrop.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);

    // ESC key closes drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') close();
    });

    // Close drawer if viewport grows past mobile breakpoint
    var mq = window.matchMedia('(min-width: 768px)');
    function onMq(e) { if (e.matches) close(); }
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq); // legacy Safari
  }

  /* ---------- 2. Bottom tab bar active-state management ---------- */
  function initTabbar() {
    var items = $$('.mt-tabbar-item');
    if (!items.length) return;

    // Match pathname to item's [data-path]. Longest prefix match wins.
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var best = null;
    var bestLen = -1;
    items.forEach(function (item) {
      var itemPath = item.getAttribute('data-path');
      if (!itemPath) return;
      var normalized = itemPath.replace(/\/+$/, '') || '/';
      if (path === normalized || (normalized !== '/' && path.indexOf(normalized + '/') === 0) || (normalized === '/' && path === '/')) {
        if (normalized.length > bestLen) {
          best = item;
          bestLen = normalized.length;
        }
      }
    });
    items.forEach(function (i) { i.removeAttribute('aria-current'); });
    if (best) best.setAttribute('aria-current', 'page');
  }

  /* ---------- 3. Tablet sidebar collapse/expand ---------- */
  function initSidebar() {
    var shell  = $('.mt-shell');
    var toggle = $('.mt-sidebar-toggle');
    if (!shell || !toggle) return;

    // Persist user preference
    var KEY = 'mt247.sidebar';
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (_) { /* storage blocked — degrade gracefully */ }
    if (stored === 'collapsed' || stored === 'expanded') {
      shell.setAttribute('data-sidebar', stored);
    }

    toggle.addEventListener('click', function () {
      var next = shell.getAttribute('data-sidebar') === 'collapsed' ? 'expanded' : 'collapsed';
      shell.setAttribute('data-sidebar', next);
      try { localStorage.setItem(KEY, next); } catch (_) {}
      toggle.setAttribute('aria-label', next === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar');
    });
  }

  /* ---------- 4. Accordion (mobile tort page sections) ---------- */
  function initAccordion() {
    $$('.mt-accordion-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.parentElement;
        var isOpen = item.getAttribute('data-open') === 'true';
        item.setAttribute('data-open', isOpen ? 'false' : 'true');
        head.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });
    });
  }

  /* ---------- 5. Table scroll-indicator (applies shadow when overflow exists) -- */
  function initTableScroll() {
    var wraps = $$('.mt-table-wrap');
    if (!wraps.length) return;

    function check(w) {
      var overflow = w.scrollWidth > w.clientWidth + 1;
      var atEnd = Math.abs(w.scrollWidth - w.clientWidth - w.scrollLeft) < 2;
      w.setAttribute('data-scrollable', overflow && !atEnd ? 'true' : 'false');
    }
    wraps.forEach(function (w) {
      check(w);
      w.addEventListener('scroll', function () { check(w); }, { passive: true });
    });
    var ro = ('ResizeObserver' in window) ? new ResizeObserver(function () { wraps.forEach(check); }) : null;
    if (ro) wraps.forEach(function (w) { ro.observe(w); });
    else window.addEventListener('resize', function () { wraps.forEach(check); });
  }

  /* ---------- 6. Smooth-scroll for in-page anchors (respects reduced motion) -- */
  function initAnchors() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // Honor OS preference

    $$('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', function (e) {
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- init ---------- */
  function init() {
    initDrawer();
    initTabbar();
    initSidebar();
    initAccordion();
    initTableScroll();
    initAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
