(function () {
  // Theme toggle (preference saved per browser)
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Client-side search over /index.json
  var box = document.querySelector('.search');
  if (!box) return;
  var input = document.getElementById('q');
  var status = document.getElementById('search-status');
  var list = document.getElementById('results');
  var docs = [];

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function snippet(text, terms) {
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < terms.length && at < 0; i++) at = low.indexOf(terms[i]);
    if (at < 0) return '';
    var s = Math.max(0, at - 50), e = Math.min(text.length, at + 110);
    return (s > 0 ? '…' : '') + text.slice(s, e).replace(/\s+/g, ' ') + (e < text.length ? '…' : '');
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    list.innerHTML = '';
    if (!q) { status.textContent = docs.length + ' sessions indexed. Start typing to search.'; return; }
    var terms = q.split(/\s+/);
    var hits = docs.filter(function (d) {
      var hay = (d.title + ' ' + d.content).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) > -1; });
    }).slice(0, 20);
    if (!hits.length) { status.textContent = 'No sessions match “' + q + '”. Try a shorter word.'; return; }
    status.textContent = hits.length + ' result' + (hits.length > 1 ? 's' : '');
    hits.forEach(function (d) {
      var li = document.createElement('li');
      var sn = esc(snippet(d.content, terms));
      terms.forEach(function (t) {
        if (t) sn = sn.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
      });
      li.innerHTML = '<a href="' + d.permalink + '"><strong>' + esc(d.title) + '</strong><span>' + sn + '</span></a>';
      list.appendChild(li);
    });
  }

  fetch(box.dataset.index)
    .then(function (r) { return r.json(); })
    .then(function (data) { docs = data; input.disabled = false; input.focus(); render(); })
    .catch(function () { status.textContent = 'Search is unavailable right now. Browse the sessions instead.'; });
  input.addEventListener('input', render);
})();
