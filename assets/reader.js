/* ARO Case Brief reader tools: highlight, memo, export. Stores in localStorage per page. */
(function () {
  var ROOT = document.querySelector('.rd-root') || document.body;
  var KEY = 'aro-brief:' + location.pathname.replace(/\/index\.html$/, '/');
  var state = load();
  var notesOpen = false;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* text offsets: walk text nodes inside ROOT, skipping our own UI */
  function textNodes() {
    var out = [], w = document.createTreeWalker(ROOT, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        while (p && p !== ROOT) { if (p.classList && (p.classList.contains('rd-ui') || p.classList.contains('rd-note'))) return NodeFilter.FILTER_REJECT; p = p.parentNode; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) out.push(n);
    return out;
  }
  function rangeToOffsets(r) {
    var nodes = textNodes(), pos = 0, s = -1, e = -1;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n === r.startContainer) s = pos + r.startOffset;
      if (n === r.endContainer) { e = pos + r.endOffset; break; }
      pos += n.nodeValue.length;
    }
    return (s >= 0 && e > s) ? { start: s, end: e } : null;
  }
  function unwrapAll() {
    ROOT.querySelectorAll('mark.rd-mark').forEach(function (m) {
      var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize && p.normalize();
    });
    ROOT.querySelectorAll('.rd-note, .rd-tag').forEach(function (x) { x.remove(); });
  }
  function render() {
    unwrapAll();
    state.sort(function (a, b) { return a.start - b.start; });
    state.forEach(function (h) {
      var nodes = textNodes(), pos = 0, pieces = [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], len = n.nodeValue.length, a = pos, b = pos + len;
        if (b > h.start && a < h.end) pieces.push({ node: n, from: Math.max(h.start, a) - a, to: Math.min(h.end, b) - a });
        pos = b; if (pos >= h.end) break;
      }
      var last = null;
      pieces.forEach(function (p) {
        var rng = document.createRange(); rng.setStart(p.node, p.from); rng.setEnd(p.node, p.to);
        var m = document.createElement('mark'); m.className = 'rd-mark' + (h.note ? ' has-note' : ''); m.dataset.id = h.id;
        try { rng.surroundContents(m); last = m; } catch (e) { }
      });
      if (last && h.note) {
        var tag = document.createElement('button'); tag.className = 'rd-tag'; tag.type = 'button'; tag.textContent = '메모'; tag.dataset.id = h.id;
        last.insertAdjacentElement('afterend', tag);
        var note = document.createElement('span'); note.className = 'rd-note' + (notesOpen || h.open ? ' open' : ''); note.dataset.id = h.id;
        note.textContent = h.note; tag.insertAdjacentElement('afterend', note);
      }
    });
    updateCount();
  }
  function updateCount() { var c = document.getElementById('rd-count'); if (c) c.textContent = state.length ? state.length + '개' : ''; }

  function add(note) {
    var sel = window.getSelection(); if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    var r = sel.getRangeAt(0); if (!ROOT.contains(r.commonAncestorContainer)) return;
    var off = rangeToOffsets(r); if (!off) return;
    var overlap = state.some(function (h) { return off.start < h.end && off.end > h.start; });
    if (overlap) { toast('이미 표시된 구간과 겹칩니다'); return; }
    var text = r.toString().replace(/\s+/g, ' ').trim();
    var h = { id: uid(), start: off.start, end: off.end, text: text, note: '', open: false, at: new Date().toISOString() };
    if (note) { var v = window.prompt('메모', ''); if (v === null) return; h.note = v.trim(); h.open = true; }
    state.push(h); save(); sel.removeAllRanges(); hideFloat(); render();
  }
  function edit(id) {
    var h = state.find(function (x) { return x.id === id; }); if (!h) return;
    var v = window.prompt('메모 수정 (비우면 메모만 삭제, "삭제"라고 쓰면 하이라이트도 삭제)', h.note || '');
    if (v === null) return; v = v.trim();
    if (v === '삭제') state = state.filter(function (x) { return x.id !== id; });
    else { h.note = v; h.open = !!v; }
    save(); render();
  }
  function toggleAll() {
    notesOpen = !notesOpen; state.forEach(function (h) { h.open = notesOpen; }); save(); render();
    var b = document.getElementById('rd-toggle'); if (b) b.textContent = notesOpen ? '메모 접기' : '메모 펼치기';
  }
  function exportText() {
    var title = (document.querySelector('h1') || {}).textContent || document.title;
    title = title.replace(/\s+/g, ' ').trim();
    var lines = ['# ' + title, '출처: ARO Case Brief, ' + location.href, '', '아래는 이 자료에서 내가 직접 표시한 구간과 메모다. 이것을 바탕으로 이야기해 달라.', ''];
    state.sort(function (a, b) { return a.start - b.start; }).forEach(function (h, i) {
      lines.push((i + 1) + '. "' + h.text + '"');
      if (h.note) lines.push('   메모: ' + h.note);
      lines.push('');
    });
    if (!state.length) lines.push('(표시한 구간이 없음)');
    var out = lines.join('\n');
    var done = function () { toast('복사됨. AI 대화창에 붙여 넣으세요'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(out).then(done, function () { fallback(out); done(); });
    else { fallback(out); done(); }
  }
  function fallback(t) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) { } ta.remove(); }
  function reset() { if (!state.length) return; if (!confirm('이 페이지의 하이라이트와 메모를 모두 지울까요?')) return; state = []; save(); render(); }
  function toast(msg) {
    var t = document.getElementById('rd-toast'); if (!t) { t = document.createElement('div'); t.id = 'rd-toast'; t.className = 'rd-ui'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  /* floating toolbar on selection */
  var fl = document.createElement('div'); fl.className = 'rd-ui rd-float'; fl.innerHTML = '<button type="button" data-act="hl">하이라이트</button><button type="button" data-act="memo">메모</button>';
  document.body.appendChild(fl);
  function hideFloat() { fl.classList.remove('show'); }
  document.addEventListener('mouseup', function () {
    setTimeout(function () {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || !ROOT.contains(sel.anchorNode)) { hideFloat(); return; }
      var rect = sel.getRangeAt(0).getBoundingClientRect(); if (!rect.width) { hideFloat(); return; }
      fl.style.left = Math.max(8, Math.min(window.innerWidth - fl.offsetWidth - 8, rect.left + rect.width / 2 - 80)) + 'px';
      fl.style.top = (rect.top + window.scrollY - 44) + 'px'; fl.classList.add('show');
    }, 10);
  });
  fl.addEventListener('mousedown', function (e) { e.preventDefault(); });
  fl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; add(b.dataset.act === 'memo'); });

  /* fixed bar */
  var bar = document.createElement('div'); bar.className = 'rd-ui rd-bar';
  bar.innerHTML = '<span class="rd-title">내 메모 <em id="rd-count"></em></span>' +
    '<button type="button" id="rd-toggle">메모 펼치기</button>' +
    '<button type="button" id="rd-export">AI용 복사</button>' +
    '<button type="button" id="rd-reset" class="rd-quiet">초기화</button>' +
    '<span class="rd-hint">본문을 드래그하면 하이라이트·메모 버튼이 뜹니다. 표시한 곳을 클릭하면 수정·삭제.</span>';
  document.body.appendChild(bar);
  document.getElementById('rd-toggle').onclick = toggleAll;
  document.getElementById('rd-export').onclick = exportText;
  document.getElementById('rd-reset').onclick = reset;

  ROOT.addEventListener('click', function (e) {
    var t = e.target.closest('.rd-tag'); if (t) { var n = ROOT.querySelector('.rd-note[data-id="' + t.dataset.id + '"]'); if (n) { n.classList.toggle('open'); var h = state.find(function (x) { return x.id === t.dataset.id; }); if (h) { h.open = n.classList.contains('open'); save(); } } return; }
    var m = e.target.closest('mark.rd-mark'); if (m && window.getSelection().isCollapsed) edit(m.dataset.id);
  });

  render();
})();
