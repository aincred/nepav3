/* North Eastern Police Academy - page behaviour (GIGW 3.0 / WCAG 2.2 aligned)
   Sections: header (menu, ticker) | footer (email) | home (slider, gallery viewer, reveal) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- HEADER: collapsible menu ---------- */
  function initNav() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var btn = nav.querySelector('.menu-toggle');
    function set(open) { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) set(false); });
  }

  /* ---------- HEADER: pausable notice ticker (WCAG 2.2.2) ---------- */
  function initTicker() {
    var t = document.getElementById('ticker');
    if (!t) return;
    var b = t.querySelector('.tk-btn');
    b.addEventListener('click', function () {
      var p = t.classList.toggle('is-paused');
      b.setAttribute('aria-pressed', p ? 'true' : 'false');
      b.setAttribute('aria-label', p ? 'Resume scrolling notice' : 'Pause scrolling notice');
    });
  }

  /* ---------- FOOTER: spam-safe email link ---------- */
  function initEmail() {
    var m = document.getElementById('nepa-mail');
    if (!m) return;
    var addr = m.dataset.user + '@' + m.dataset.domain;
    var a = document.createElement('a');
    a.className = 'c-val';
    a.href = 'mailto:' + addr;
    a.textContent = addr;
    a.setAttribute('aria-label', 'Email ' + m.dataset.user + ' at ' + m.dataset.domain.replace('.', ' dot '));
    m.replaceWith(a);
  }

  /* ---------- HOME: photo slider ---------- */
  function initSlider() {
    var root = document.getElementById('slider');
    if (!root) return;
    var slides = [].slice.call(root.querySelectorAll('.slide'));
    var dots = [].slice.call(root.querySelectorAll('.dot'));
    var count = root.querySelector('.count'), list = root.querySelector('.slides');
    var tg = root.querySelector('.toggle'), cur = 0, timer = null, playing = false;
    function show(n) {
      cur = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); d.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
      count.textContent = (cur + 1) + ' / ' + slides.length;
      var nx = slides[(cur + 1) % slides.length].querySelector('img'); if (nx) nx.loading = 'eager';
    }
    function play() { if (timer) clearInterval(timer); timer = setInterval(function () { show(cur + 1); }, 5000); playing = true; tg.dataset.state = 'playing'; tg.setAttribute('aria-label', 'Pause slideshow'); list.setAttribute('aria-live', 'off'); }
    function pause() { if (timer) clearInterval(timer); timer = null; playing = false; tg.dataset.state = 'paused'; tg.setAttribute('aria-label', 'Play slideshow'); list.setAttribute('aria-live', 'polite'); }
    root.querySelector('.prev').addEventListener('click', function () { show(cur - 1); });
    root.querySelector('.next').addEventListener('click', function () { show(cur + 1); });
    tg.addEventListener('click', function () { playing ? pause() : play(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1); });
    var wasPlaying = false;
    function hold() { if (playing) { wasPlaying = true; clearInterval(timer); timer = null; playing = false; tg.dataset.state = 'playing'; } }
    function release() { if (wasPlaying) { wasPlaying = false; play(); } }
    root.addEventListener('mouseenter', hold); root.addEventListener('mouseleave', release);
    root.addEventListener('focusin', hold); root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) release(); });
    show(0);
    if (reduce) pause(); else play();
  }

  /* ---------- HOME: accessible photo viewer (native <dialog>) ---------- */
  function initLightbox() {
    var dlg = document.getElementById('lightbox');
    if (!dlg || !dlg.showModal) return;
    var items = [].slice.call(document.querySelectorAll('.gal-item')), cur = 0, opener = null;
    var img = dlg.querySelector('.lb-img'), cap = dlg.querySelector('.lb-cap'), cnt = dlg.querySelector('.lb-count');
    function show(n) {
      cur = (n + items.length) % items.length;
      var it = items[cur];
      img.src = it.dataset.full; img.alt = it.querySelector('img').alt; cap.textContent = it.dataset.cap;
      cnt.textContent = (cur + 1) + ' / ' + items.length;
    }
    items.forEach(function (it, i) { it.addEventListener('click', function () { opener = it; show(i); dlg.showModal(); dlg.querySelector('.lb-close').focus(); }); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(cur - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(cur + 1); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- HOME: gentle scroll reveal (off for reduced motion) ---------- */
  function initReveal() {
    var els = [].slice.call(document.querySelectorAll('main .sec-title, main .card, main .prog, main .fact, main .fcard, main .gal-li, main .newsbox, main .about2-top'));
    if (reduce || !('IntersectionObserver' in window)) return;
    els.forEach(function (e, i) { e.classList.add('reveal'); e.style.transitionDelay = (i % 4) * 70 + 'ms'; });
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- boot ---------- */
  function initPartials() { initNav(); initTicker(); initEmail(); }
  initSlider(); initLightbox(); initReveal();
  if (window.__partialsLoaded) initPartials();
  else document.addEventListener('partials:loaded', initPartials);
})();
