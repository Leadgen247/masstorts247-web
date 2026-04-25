/* MassTorts247 — shared client behaviors
   Auto-wires the mobile drawer for any page that has .mt-nav-toggle.
   Created by Chady Elias — Visionary and Creator | LeadGen247 Network */
(function () {
  'use strict';

  function initDrawer() {
    var toggle = document.querySelector('.mt-nav-toggle');
    if (!toggle) return;

    // Build drawer markup if it doesn't already exist
    var drawer = document.getElementById('mt-drawer');
    if (!drawer) {
      var backdrop = document.createElement('div');
      backdrop.className = 'mt-drawer-backdrop';
      backdrop.setAttribute('data-open', 'false');

      drawer = document.createElement('aside');
      drawer.id = 'mt-drawer';
      drawer.className = 'mt-drawer';
      drawer.setAttribute('data-open', 'false');
      drawer.setAttribute('role', 'dialog');
      drawer.setAttribute('aria-modal', 'true');
      drawer.setAttribute('aria-label', 'Mobile menu');
      drawer.innerHTML = [
        '<div class="mt-drawer-head">',
        '  <span style="font-family:var(--font-serif);font-weight:700;color:#fff;font-size:16px;">Mass Torts <span style="color:var(--gold);">24/7</span></span>',
        '  <button class="mt-drawer-close" aria-label="Close menu">',
        '    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>',
        '  </button>',
        '</div>',
        '<nav class="mt-drawer-links" aria-label="Mobile primary">',
        '  <a href="/#platform">Platform</a>',
        '  <a href="/torts">Tort Library</a>',
        '  <a href="/#pricing">Pricing</a>',
        '  <a href="/#faq">Resources</a>',
        '</nav>',
        '<div class="mt-drawer-footer">',
        '  <a href="/signin" class="mt-nav-signin" style="display:inline-flex;">Sign In</a>',
        '  <a href="/signin" class="mt-btn mt-btn-primary" style="margin-top:8px;display:inline-flex;">Start Free</a>',
        '</div>'
      ].join('');

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);
    }

    var backdropEl = document.querySelector('.mt-drawer-backdrop');
    var closeBtn = drawer.querySelector('.mt-drawer-close');

    function openDrawer() {
      drawer.setAttribute('data-open', 'true');
      if (backdropEl) backdropEl.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.setAttribute('data-drawer', 'open');
    }
    function closeDrawer() {
      drawer.setAttribute('data-open', 'false');
      if (backdropEl) backdropEl.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.removeAttribute('data-drawer');
    }

    toggle.addEventListener('click', function () {
      if (drawer.getAttribute('data-open') === 'true') closeDrawer();
      else openDrawer();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdropEl) backdropEl.addEventListener('click', closeDrawer);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') closeDrawer();
    });

    // Close drawer when any internal link is clicked
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDrawer);
  } else {
    initDrawer();
  }
})();
