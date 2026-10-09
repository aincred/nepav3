/* Connects the shared header/footer to a page.
   Put <div data-include="partials/header.html"></div> where the header should appear.
   - On a web server: the HTML file is fetched, so edits show immediately.
   - Opened by double-click (file://): browsers block fetch, so the copy in
     js/partials-bundle.js is used (rebuild it with: python build_partials.py). */
(function () {
  var slots = [].slice.call(document.querySelectorAll('[data-include]'));
  var pending = slots.length;
  var onFile = location.protocol === 'file:';

  function finish() {
    window.__partialsLoaded = true;
    document.dispatchEvent(new Event('partials:loaded'));
  }
  function oneDone() { pending -= 1; if (pending === 0) finish(); }
  function put(slot, html) { slot.outerHTML = html; oneDone(); }
  function bundled(url) { return window.NEPA_PARTIALS && window.NEPA_PARTIALS[url]; }
  function fail(slot, url) {
    slot.innerHTML = '<p style="padding:16px;background:#fff3cd;color:#3b2f00;font-size:16px">Could not load ' + url + '.</p>';
    oneDone();
  }

  if (!pending) { finish(); return; }

  slots.forEach(function (slot) {
    var url = slot.getAttribute('data-include');
    if (onFile) {
      var html = bundled(url);
      if (html) put(slot, html); else fail(slot, url);
      return;
    }
    fetch(url)
      .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); })
      .then(function (html) { put(slot, html); })
      .catch(function () {
        var html = bundled(url);
        if (html) put(slot, html); else fail(slot, url);
      });
  });
})();
