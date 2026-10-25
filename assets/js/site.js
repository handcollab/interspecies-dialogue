/* 三界共語 · minimal — vanilla JS, no dependencies */
(function () {
  'use strict';
  var D = window.SJ_DATA || { exp: [], yolo: [], audio: {}, plants: [], outcomes: [] };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hoverMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  var SVGNS = 'http://www.w3.org/2000/svg';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  var hasIO = 'IntersectionObserver' in window;
  var OUT_COL = ['#c8ff40', '#8db82e', '#567226', 'none', 'none'];

  /* ------------------------------------------------------------ nav */
  (function nav() {
    var links = $$('.topnav a.nl');
    if (!hasIO || !links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = map[e.target.id];
        if (!a) return;
        links.forEach(function (x) { x.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
        document.documentElement.style.setProperty('--nav-accent', a.getAttribute('data-accent'));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* ------------------------------------------------------------ media: one sound at a time */
  var players = [];
  document.addEventListener('play', function (e) {
    var t = e.target;
    if (!t || t.muted) return;
    players.forEach(function (p) { p.pause(); });
    $$('video').forEach(function (v) { if (v !== t && !v.muted && !v.paused) v.pause(); });
  }, true);

  /* ------------------------------------------------------------ lazy <video data-src> */
  var lazyIO = hasIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var v = e.target;
      lazyIO.unobserve(v);
      if (v.dataset.src && !v.getAttribute('src')) v.setAttribute('src', v.dataset.src);
    });
  }, { rootMargin: '400px 0px' }) : null;
  $$('video.lazy[data-src]').forEach(function (v) {
    if (lazyIO) lazyIO.observe(v); else v.setAttribute('src', v.dataset.src);
  });

  /* ------------------------------------------------------------ media buttons */
  function ensureVideo(btn) {
    var v = btn.querySelector('video');
    if (v) return v;
    v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('loop', '');
    v.setAttribute('preload', 'none'); v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
    var src = btn.dataset.video, alt = btn.dataset.videoAlt;
    if (alt && /\.webm$/.test(src)) {
      var s1 = document.createElement('source'); s1.src = src; s1.type = 'video/webm'; v.appendChild(s1);
      var s2 = document.createElement('source'); s2.src = alt; s2.type = 'video/mp4'; v.appendChild(s2);
    } else {
      v.src = src;
    }
    v.addEventListener('playing', function () { btn.classList.add('playing'); });
    v.addEventListener('pause', function () { btn.classList.remove('playing'); });
    v.addEventListener('error', function () { btn.classList.remove('playing'); }, true);
    var im0 = btn.querySelector('img');
    if (im0) im0.parentNode.insertBefore(v, im0.nextSibling); else btn.appendChild(v);
    return v;
  }
  var btnIO = hasIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      btnIO.unobserve(e.target);
      ensureVideo(e.target);
    });
  }, { rootMargin: '300px 0px' }) : null;
  function observeButtons(root) {
    $$('.mbtn[data-video]', root).forEach(function (b) {
      if (!b.dataset.badge) { var bd = b.querySelector('.badge'); if (bd) b.dataset.badge = bd.textContent; }
      if (btnIO) btnIO.observe(b);
    });
  }
  observeButtons(document);

  function setBadge(btn, playing) {
    var bd = btn.querySelector('.badge');
    if (!bd || !btn.dataset.badge || btn.dataset.full) return;
    bd.textContent = playing ? btn.dataset.badge.replace('PLAY', 'PAUSE') : btn.dataset.badge;
  }
  function safePlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  // hover preview (desktop pointer only, never with reduced motion, never in the uncanny zone)
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || !hoverMQ.matches || reduceMQ.matches) return;
    var b = e.target.closest && e.target.closest('.mbtn[data-video]');
    if (!b || b.classList.contains('no-hover') || (e.relatedTarget && b.contains(e.relatedTarget))) return;
    var v = ensureVideo(b);
    b.dataset.hover = '1';
    safePlay(v);
  });
  document.addEventListener('pointerout', function (e) {
    var b = e.target.closest && e.target.closest('.mbtn[data-video]');
    if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return;
    if (b.dataset.hover && b.getAttribute('aria-pressed') !== 'true') {
      var v = b.querySelector('video');
      if (v) v.pause();
      b.classList.remove('ready');
    }
    delete b.dataset.hover;
  });

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.mbtn');
    if (!b) return;
    if (b.dataset.img) {
      openLightbox({ kind: 'img', src: b.dataset.img, w: b.dataset.w, h: b.dataset.h, cap: b.dataset.cap, tag: b.dataset.tag, alt: (b.querySelector('img') || {}).alt || '' }, b);
      return;
    }
    if (b.dataset.full) {
      var pv = b.querySelector('video'); if (pv) pv.pause();
      openLightbox({ kind: 'video', src: b.dataset.full, cap: b.dataset.cap, tag: b.dataset.tag }, b);
      return;
    }
    if (b.dataset.video) {   // inline toggle (versions)
      var v = ensureVideo(b);
      var on = b.getAttribute('aria-pressed') === 'true';
      if (!on) {
        $$('.mbtn[aria-pressed="true"]').forEach(function (o) { if (o !== b) { o.setAttribute('aria-pressed', 'false'); var ov = o.querySelector('video'); if (ov) ov.pause(); setBadge(o, false); } });
        b.setAttribute('aria-pressed', 'true'); b.classList.add('ready');
        safePlay(v); setBadge(b, true);
      } else {
        b.setAttribute('aria-pressed', 'false');
        v.pause(); setBadge(b, false);
      }
    }
  });

  /* ------------------------------------------------------------ lightbox */
  var dlg = $('#lightbox'), lbMedia = $('#lb-media'), lbCap = $('#lb-cap');
  function closeLightbox() { if (dlg && dlg.open) dlg.close(); }
  function openLightbox(o, trigger) {
    if (!dlg || typeof dlg.showModal !== 'function') {
      window.open(o.src, '_blank', 'noopener');
      return;
    }
    lbMedia.innerHTML = '';
    if (o.kind === 'img') {
      var im = document.createElement('img');
      im.src = o.src; im.alt = o.alt || ''; if (o.w) { im.width = o.w; im.height = o.h; }
      lbMedia.appendChild(im);
    } else {
      var v = document.createElement('video');
      v.controls = true; v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'auto'; v.src = o.src;
      if (!reduceMQ.matches) v.autoplay = true;
      v.setAttribute('aria-label', (o.tag || '') + '（無聲）');
      lbMedia.appendChild(v);
    }
    lbCap.innerHTML = '<span class="mono">' + esc(o.tag || '') + '</span>' + esc(o.cap || '');
    dlg._trigger = trigger;
    dlg.showModal();
  }
  if (dlg) {
    $('#lb-close').addEventListener('click', closeLightbox);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
    dlg.addEventListener('close', function () {
      var v = lbMedia.querySelector('video'); if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
      lbMedia.innerHTML = '';
      if (dlg._trigger && dlg._trigger.focus) dlg._trigger.focus();
    });
  }

  /* ------------------------------------------------------------ uncanny zone */
  (function uncanny() {
    var show = $('#uncanny-show'), hide = $('#uncanny-hide'), grid = $('#uncanny-grid'), tpl = $('#uncanny-tpl');
    if (!show || !grid || !tpl) return;
    show.addEventListener('click', function () {
      grid.innerHTML = '';
      grid.appendChild(document.importNode(tpl.content, true));
      grid.hidden = false;
      show.hidden = true; hide.hidden = false;
      show.setAttribute('aria-expanded', 'true');
      observeButtons(grid);
      var first = grid.querySelector('.mbtn'); if (first) first.focus();
    });
    hide.addEventListener('click', function () {
      $$('video', grid).forEach(function (v) { v.pause(); });
      grid.innerHTML = ''; grid.hidden = true;
      hide.hidden = true; show.hidden = false;
      show.setAttribute('aria-expanded', 'false');
      show.focus();
    });
  })();

  /* ------------------------------------------------------------ audio players */
  function Player(root) {
    var self = this;
    this.root = root; this.src = root.dataset.src; this.dur = parseFloat(root.dataset.dur) || 0;
    this.btn = root.querySelector('.pl-btn'); this.range = root.querySelector('input[type=range]');
    this.cur = root.querySelector('.cur'); this.audio = null; this.raf = 0;
    var svg = root.querySelector('.pl-wave svg');
    var pk = (D.audio || {})[root.dataset.key] || [];
    var n = pk.length || 1;
    svg.setAttribute('viewBox', '0 0 ' + n + ' 40');
    var cid = 'clip-' + root.dataset.key;
    var defs = el('defs', {}, svg);
    var cp = el('clipPath', { id: cid }, defs);
    this.clipRect = el('rect', { x: 0, y: 0, width: 0, height: 40 }, cp);
    var gBase = el('g', { 'class': 'w-base' }, svg);
    var gProg = el('g', { 'class': 'w-prog', 'clip-path': 'url(#' + cid + ')' }, svg);
    pk.forEach(function (p, i) {
      var h = Math.max(1.2, Math.sqrt(p) * 36);
      var a = { x: i + 0.18, y: 20 - h / 2, width: 0.64, height: h };
      el('rect', a, gBase); el('rect', a, gProg);
    });
    this.n = n;
    this.btn.addEventListener('click', function () { self.toggle(); });
    this.range.addEventListener('input', function () { self.seek(parseFloat(self.range.value)); });
    players.push(this);
  }
  Player.prototype.ensure = function () {
    if (this.audio) return this.audio;
    var self = this, a = new Audio();
    a.preload = 'none'; a.src = this.src;
    a.addEventListener('play', function () {
      players.forEach(function (p) { if (p !== self) p.pause(); });
      $$('video').forEach(function (v) { if (!v.muted && !v.paused) v.pause(); });
      self.root.classList.add('is-playing');
      self.btn.setAttribute('aria-label', self.btn.getAttribute('aria-label').replace(/^播放/, '暫停'));
      self.loop();
    });
    a.addEventListener('pause', function () { self.stopped(); });
    a.addEventListener('ended', function () { self.stopped(); a.currentTime = 0; self.draw(0); });
    a.addEventListener('loadedmetadata', function () { if (isFinite(a.duration)) self.dur = a.duration; if (self.pending != null) { a.currentTime = self.pending; self.pending = null; } });
    a.addEventListener('timeupdate', function () { self.draw(a.currentTime); });
    a.addEventListener('error', function () { self.stopped(); self.root.querySelector('.pl-meta').insertAdjacentHTML('beforeend', '<br><span class="zh">音檔沒有載入，請重新整理頁面再試一次。</span>'); });
    this.audio = a;
    return a;
  };
  Player.prototype.stopped = function () {
    this.root.classList.remove('is-playing');
    this.btn.setAttribute('aria-label', this.btn.getAttribute('aria-label').replace(/^暫停/, '播放'));
    cancelAnimationFrame(this.raf);
  };
  Player.prototype.toggle = function () {
    var a = this.ensure();
    if (a.paused) { var p = a.play(); if (p && p.catch) p.catch(function () {}); } else a.pause();
  };
  Player.prototype.pause = function () { if (this.audio && !this.audio.paused) this.audio.pause(); };
  Player.prototype.seek = function (t) {
    var a = this.ensure();
    if (a.readyState >= 1) a.currentTime = t; else this.pending = t;
    this.draw(t);
  };
  Player.prototype.draw = function (t) {
    var f = this.dur ? Math.min(1, t / this.dur) : 0;
    this.clipRect.setAttribute('width', (f * this.n).toFixed(2));
    this.cur.textContent = fmt(t);
    if (document.activeElement !== this.range) this.range.value = Math.floor(t);
    this.range.setAttribute('aria-valuetext', Math.floor(t / 60) + ' 分 ' + Math.floor(t % 60) + ' 秒');
  };
  Player.prototype.loop = function () {
    var self = this;
    cancelAnimationFrame(this.raf);
    (function step() {
      if (!self.audio || self.audio.paused) return;
      self.draw(self.audio.currentTime);
      self.raf = requestAnimationFrame(step);
    })();
  };
  $$('.player').forEach(function (p) { new Player(p); });

  /* ------------------------------------------------------------ the film: click-to-load YouTube */
  // Until the click there is no request to YouTube: the button shows our own still. The click swaps it for a
  // privacy-enhanced (no-cookie) YouTube iframe (autoplay, since the visitor just asked to play) and stops this page's own sound.
  $$('.film-btn[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.yt;
      if (!/^[\w-]{11}$/.test(id)) return;
      players.forEach(function (p) { p.pause(); });
      $$('video').forEach(function (v) { if (!v.muted && !v.paused) v.pause(); });
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = b.dataset.title || 'YouTube';
      f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      // the legacy attribute only where `allow` cannot grant fullscreen (Chromium warns when both are set)
      var fp = document.permissionsPolicy || document.featurePolicy;
      if (!(fp && fp.features && fp.features().indexOf('fullscreen') >= 0)) f.setAttribute('allowfullscreen', '');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      b.parentNode.replaceChild(f, b);
      f.focus();
    });
  });

  /* ------------------------------------------------------------ filter state */
  var state = { plant: '', stim: '' };
  var listeners = [];
  function match(r) {
    return (state.plant === '' || String(r.p) === state.plant) && (state.stim === '' || String(r.st) === state.stim);
  }
  $$('.fgroup').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      $$('.chip', g).forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      state[g.dataset.key] = c.dataset.v;
      listeners.forEach(function (f) { f(); });
    });
  });

  /* ------------------------------------------------------------ dot calendar */
  (function dotChart() {
    var host = $('#dotchart'); if (!host || !D.exp.length) return;
    var readout = $('#readout');
    var byDay = {}, days = [];
    D.exp.forEach(function (r) { if (!byDay[r.d]) { byDay[r.d] = []; days.push(r.d); } byDay[r.d].push(r); });
    days.sort();
    var maxStack = Math.max.apply(null, days.map(function (d) { return byDay[d].length; }));
    var tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('aria-hidden', 'true'); host.appendChild(tip);
    var svg, dots = {}, pos = [], byId = {}, ring = null, sel = null, lastW = 0, R = 4;
    var phaseOf = function (r) { return r.st === 0 ? 0 : (r.sc === 1 ? 2 : 1); };
    var PH = ['水 · 桌上型', '藍光 · 桌上型', '藍光 · 手持'];

    function label(r) {
      var mag = (r.ma ? '約 ' : '') + r.m + '×';
      return '<b>#' + r.i + '</b> · ' + r.d + ' · ' + esc(D.plants[r.p]) + '<br>' + D.scopes[r.sc] + ' ' + mag + ' · ' + esc(r.me) +
        (r.h != null ? ' · 濕度 ' + r.h + '% / ' + r.t + ' °C' : '') +
        '<br>結果：<b>' + esc(D.outcomes[r.o].zh) + '</b>' + (r.o === 4 ? '（' + esc(r.ot) + '）' : '');
    }
    function render() {
      var W = Math.round(host.clientWidth);
      if (!W || W === lastW) return;
      lastW = W;
      if (svg) svg.remove();
      dots = {}; pos = []; byId = {};
      var months = []; days.forEach(function (d) { var m = d.slice(0, 7); if (months.indexOf(m) < 0) months.push(m); });
      var gap = W < 500 ? 8 : 14;
      var colW = (W - gap * (months.length - 1)) / days.length;
      var r = Math.max(2.8, Math.min(5.2, colW * 0.34)); R = r;
      var step = r * 2 + (colW > 18 ? 3 : 2);
      var top = 34, plotH = maxStack * step, showDay = colW >= 17;
      var H = top + plotH + (showDay ? 40 : 26);
      svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, tabindex: '0', role: 'img', 'aria-describedby': 'readout',
        'aria-label': '200 段紀錄的圓點圖：橫軸為 27 個實驗日，每天的錄影由下往上疊，顏色代表結果。聚焦後可用左右方向鍵逐段瀏覽，內容顯示在圖下方。' });
      var xs = {};
      var x = 0, prevM = null;
      days.forEach(function (d) {
        var m = d.slice(0, 7);
        if (prevM && m !== prevM) x += gap;
        xs[d] = x; x += colW; prevM = m;
      });
      // baseline
      el('line', { x1: 0, x2: W, y1: top + plotH + 3, y2: top + plotH + 3, stroke: '#2c2c35', 'stroke-width': 1 }, svg);
      // phases
      var gp = el('g', { 'class': 'phase' }, svg);
      var spans = [];
      days.forEach(function (d) {
        var ph = phaseOf(byDay[d][0]);
        var s = spans[spans.length - 1];
        if (s && s.ph === ph) s.end = d; else spans.push({ ph: ph, start: d, end: d });
      });
      spans.forEach(function (s) {
        var x1 = xs[s.start] + 1, x2 = xs[s.end] + colW - 1;
        el('path', { d: 'M' + x1 + ' 22V17H' + x2 + 'V22', fill: 'none', stroke: '#55534e', 'stroke-width': 1 }, gp);
        var t = el('text', { x: x1, y: 11 }, gp); t.textContent = PH[s.ph];
      });
      // axis
      var ga = el('g', { 'class': 'axis' }, svg);
      var seenM = {};
      days.forEach(function (d) {
        var m = d.slice(0, 7);
        if (showDay) { var td = el('text', { x: xs[d] + colW / 2, y: top + plotH + 17, 'text-anchor': 'middle' }, ga); td.textContent = String(+d.slice(8)); }
        if (!seenM[m]) {
          seenM[m] = 1;
          var tm = el('text', { x: xs[d] + 1, y: top + plotH + (showDay ? 34 : 19) }, ga);
          tm.textContent = (m === '2025-12' ? '2025 · ' : (m === '2026-01' ? '2026 · ' : '')) + (+m.slice(5)) + '月';
        }
      });
      // dots
      var gd = el('g', {}, svg);
      days.forEach(function (d) {
        byDay[d].forEach(function (rec, k) {
          var cx = xs[d] + colW / 2, cy = top + plotH - (k + 0.5) * step;
          var a = { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (rec.o >= 3 ? r - 0.75 : r).toFixed(2), 'class': 'dot' };
          if (rec.o === 0) {            // 顯著: a lime ring around a dark pinhole, so it reads by shape as well as colour
            var sw = r * 0.68;
            a.r = (r - sw / 2).toFixed(2); a.fill = '#090909'; a.stroke = OUT_COL[0]; a['stroke-width'] = sw.toFixed(2);
          } else if (rec.o < 3) { a.fill = OUT_COL[rec.o]; }
          else { a.fill = 'none'; a.stroke = '#8a8781'; a['stroke-width'] = 1.3; if (rec.o === 4) a['stroke-dasharray'] = '1.6 1.6'; }
          dots[rec.i] = el('circle', a, gd);
          byId[rec.i] = { x: cx, y: cy };
          pos.push({ x: cx, y: cy, r: rec });
        });
      });
      ring = el('circle', { r: (r + 2.4).toFixed(2), fill: 'none', stroke: '#d8d5d0', 'stroke-width': 1.3, 'pointer-events': 'none', visibility: 'hidden', 'class': 'sel-ring' }, svg);
      host.insertBefore(svg, tip);
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerleave', function () { tip.classList.remove('on'); });
      svg.addEventListener('click', function (e) { var h = hit(e); if (h) select(h.r); });
      svg.addEventListener('keydown', onKey);
      svg.addEventListener('focus', function () { if (!sel) { var f = visible()[0]; if (f) select(f); } });
      applyFilter();
      if (sel && dots[sel.i]) { dots[sel.i].classList.add('sel'); placeRing(sel); }
      host._step = step;
    }
    function hit(e) {
      var b = svg.getBoundingClientRect();
      var sx = (e.clientX - b.left) * (lastW / b.width), sy = (e.clientY - b.top) * (lastW / b.width);
      var best = null, bd = 1e9, lim = host._step * 1.1;
      pos.forEach(function (p) { var dd = Math.hypot(p.x - sx, p.y - sy); if (dd < bd) { bd = dd; best = p; } });
      return bd <= lim ? best : null;
    }
    function onMove(e) {
      var h = hit(e);
      if (!h) { tip.classList.remove('on'); return; }
      tip.innerHTML = label(h.r) + (h.r.n ? '<br><span class="mono">' + esc(h.r.n) + '</span>' : '');
      var b = svg.getBoundingClientRect(), hb = host.getBoundingClientRect(), s = b.width / lastW;
      var px = h.x * s + (b.left - hb.left), py = h.y * s + (b.top - hb.top);
      tip.classList.add('on');
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = Math.min(Math.max(0, px - tw / 2), hb.width - tw);
      var topY = py - th - 12; if (topY < 0) topY = py + 14;
      tip.style.left = left + 'px'; tip.style.top = topY + 'px';
    }
    function visible() { return D.exp.filter(match); }
    function placeRing(rec) {
      if (!ring) return;
      var p = rec && byId[rec.i];
      if (!p) { ring.setAttribute('visibility', 'hidden'); return; }
      ring.setAttribute('cx', p.x.toFixed(1)); ring.setAttribute('cy', p.y.toFixed(1)); ring.setAttribute('visibility', 'visible');
    }
    function select(rec) {
      if (sel && dots[sel.i]) dots[sel.i].classList.remove('sel');
      sel = rec;
      if (dots[rec.i]) dots[rec.i].classList.add('sel');
      placeRing(rec);
      readout.innerHTML = label(rec).replace(/<br>/g, ' · ') + (rec.n ? '<br><span class="mono">備註</span> ' + esc(rec.n) : '') + (rec.y ? '　<span class="mono">有開口標註 #' + rec.y + '</span>' : '');
    }
    function onKey(e) {
      var v = visible(); if (!v.length) return;
      var i = sel ? v.indexOf(sel) : -1, n = i;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = Math.min(v.length - 1, i + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = Math.max(0, i - 1);
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = v.length - 1;
      else return;
      e.preventDefault();
      select(v[n < 0 ? 0 : n]);
    }
    function applyFilter() {
      var c = [0, 0, 0, 0, 0], tot = 0;
      D.exp.forEach(function (r) {
        var m = match(r);
        if (dots[r.i]) dots[r.i].classList.toggle('off', !m);
        if (m) { c[r.o]++; tot++; }
      });
      var filtered = state.plant !== '' || state.stim !== '';
      $$('#legend li').forEach(function (li) {
        var o = +li.dataset.o;
        li.querySelector('.v').textContent = c[o];
        li.querySelector('.of').textContent = filtered ? ' / ' + D.exp.filter(function (r) { return r.o === o; }).length : '';
      });
      if (sel && !match(sel)) { if (dots[sel.i]) dots[sel.i].classList.remove('sel'); sel = null; placeRing(null); readout.innerHTML = '<span class="mono">' + tot + ' / 200</span><br>符合篩選條件的錄影有 ' + tot + ' 段。'; }
    }
    listeners.push(applyFilter);
    render();
    if ('ResizeObserver' in window) new ResizeObserver(function () { render(); }).observe(host);
    else window.addEventListener('resize', render);
  })();

  /* ------------------------------------------------------------ table */
  (function table() {
    var det = $('#tbl-details'), tb = $('#exp-table tbody'); if (!det || !tb) return;
    var rows = [], built = false, sortK = 'id', dir = 1;
    var KEYS = { id: 'i', d: 'd', p: 'p', sc: 'sc', m: 'm', me: 'me', h: 'h', t: 't', o: 'o', n: 'n' };
    function build() {
      built = true;
      var frag = document.createDocumentFragment();
      D.exp.forEach(function (r) {
        var tr = document.createElement('tr');
        tr._r = r;
        var sw = r.o === 0 ? '<span class="sw sw-S"></span> ' : r.o < 3 ? '<span class="sw" style="background:' + OUT_COL[r.o] + '"></span> ' : '<span class="sw sw-ring' + (r.o === 4 ? ' dash' : '') + '"></span> ';
        tr.innerHTML = '<td class="num">' + r.i + '</td><td class="mono">' + r.d + '</td><td>' + esc(D.plants[r.p]) + '</td><td class="mono">' + D.scopes[r.sc] +
          '</td><td class="num">' + (r.ma ? '≈' : '') + r.m + '×</td><td>' + esc(r.me) + '</td><td class="num">' + (r.h == null ? '—' : r.h + '%') +
          '</td><td class="num">' + (r.t == null ? '—' : r.t + '°') + '</td><td>' + sw + esc(D.outcomes[r.o].zh) + (r.o === 4 ? '<br><span class="dim">' + esc(r.ot) + '</span>' : '') +
          '</td><td class="note">' + esc(r.n) + '</td>';
        rows.push(tr); frag.appendChild(tr);
      });
      tb.appendChild(frag);
      filter();
    }
    function filter() {
      if (!built) { $('#tbl-count').textContent = D.exp.filter(match).length; return; }
      var n = 0;
      rows.forEach(function (tr) { var m = match(tr._r); tr.classList.toggle('off', !m); if (m) n++; });
      $('#tbl-count').textContent = n;
    }
    function sort(k) {
      if (sortK === k) dir = -dir; else { sortK = k; dir = 1; }
      var key = KEYS[k];
      rows.sort(function (a, b) {
        var x = a._r[key], y = b._r[key];
        if (x == null && y == null) return a._r.i - b._r.i;
        if (x == null) return 1; if (y == null) return -1;
        if (typeof x === 'string') return x.localeCompare(y, 'zh-Hant') * dir || a._r.i - b._r.i;
        return (x - y) * dir || a._r.i - b._r.i;
      });
      var frag = document.createDocumentFragment(); rows.forEach(function (tr) { frag.appendChild(tr); }); tb.appendChild(frag);
      $$('#exp-table thead th').forEach(function (th) {
        if (th.dataset.k === k) th.setAttribute('aria-sort', dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort');
      });
    }
    det.addEventListener('toggle', function () { if (det.open && !built) { build(); sort('id'); sortK = 'id'; } });
    $$('#exp-table thead th').forEach(function (th) {
      th.querySelector('button').addEventListener('click', function () { if (!built) build(); sort(th.dataset.k); });
    });
    listeners.push(filter);
    filter();
  })();

  /* ------------------------------------------------------------ sparklines */
  (function sparks() {
    var host = $('#sparks'); if (!host || !D.yolo.length) return;
    var more = $('#sparks-more') || host;
    var rep = D.yoloRep || [];
    var cards = [];
    var Wd = 120, Hd = 47, X0 = 1, X1 = 119, Y0 = 40, Y1 = 4;
    D.yolo.forEach(function (y) {
      var fig = document.createElement('figure'); fig.className = 'spark'; fig.setAttribute('role', 'listitem');
      var mins = Math.round(y.dur / 60);
      var first = y.a[0][1];
      fig.setAttribute('aria-label', '標註 #' + y.i + '，' + D.plants[y.p] + '，' + y.d + '，' + (y.ma ? '約 ' : '') + y.m + ' 倍，' + y.me + '，錄影約 ' + mins + ' 分鐘，開口由 ' + first + '% 到最大 ' + y.pk + '%');
      var head = '<div class="sp-h" aria-hidden="true"><span>#' + ('0' + y.i).slice(-2) + ' · ' + y.d.slice(5) + '</span><b>' + y.pk + '%</b></div>';
      fig.innerHTML = head;
      var svg = el('svg', { viewBox: '0 0 ' + Wd + ' ' + Hd, 'aria-hidden': 'true' }, fig);
      var X = function (t) { return X0 + (X1 - X0) * Math.min(1, t / y.dur); };
      var Y = function (p) { return Y0 - (Y0 - Y1) * p / 100; };
      y.nz.forEach(function (n) { el('rect', { x: X(n[0]).toFixed(1), y: Y0 + 2.5, width: Math.max(0.8, X(n[1]) - X(n[0])).toFixed(1), height: 2.5, fill: '#55534e' }, svg); });
      el('line', { x1: X0, x2: X1, y1: Y(50), y2: Y(50), stroke: '#1e1e25', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, svg);
      el('line', { x1: X0, x2: X1, y1: Y0 + .5, y2: Y0 + .5, stroke: '#2c2c35', 'stroke-width': 1 }, svg);
      var pts = y.a.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
      if (pts.length === 1) pts.push((X1).toFixed(1) + ',' + Y(y.a[0][1]).toFixed(1));
      var a = { points: pts.join(' '), fill: 'none', stroke: '#c8ff40', 'stroke-width': 1.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' };
      if (y.dash) a['stroke-dasharray'] = '3 2';
      el('polyline', a, svg);
      var pk = y.a.reduce(function (m, p) { return p[1] > m[1] ? p : m; }, y.a[0]);
      el('circle', { cx: X(pk[0]).toFixed(1), cy: Y(pk[1]).toFixed(1), r: 1.9, fill: '#c8ff40' }, svg);
      var foot = document.createElement('div'); foot.className = 'sp-f'; foot.setAttribute('aria-hidden', 'true');
      foot.innerHTML = esc(D.plants[y.p]) + ' <span class="mono">' + mins + ' 分 · ' + (y.ma ? '≈' : '') + y.m + '×</span>';
      fig.appendChild(foot);
      fig._r = y;
      cards.push(fig);
    });
    rep.forEach(function (id) { cards.forEach(function (c) { if (c._r.i === id) host.appendChild(c); }); });
    cards.forEach(function (c) { if (rep.indexOf(c._r.i) < 0) more.appendChild(c); });
    function filter() { cards.forEach(function (c) { c.classList.toggle('off', !match(c._r)); }); }
    listeners.push(filter);
  })();

  /* ------------------------------------------------------------ micro scrubber */
  (function scrub() {
    var fig = $('#scrub'); if (!fig) return;
    var frames = JSON.parse(fig.dataset.frames), times = JSON.parse(fig.dataset.times);
    var img = $('#scrub-img'), rng = $('#scrub-rng'), t = $('#scrub-t'), pre = false;
    function preload() { if (pre) return; pre = true; frames.forEach(function (f) { var i = new Image(); i.src = f; }); }
    rng.addEventListener('pointerdown', preload); rng.addEventListener('focus', preload);
    if (hasIO) { var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { preload(); io.disconnect(); } }, { rootMargin: '200px 0px' }); io.observe(fig); }
    rng.addEventListener('input', function () {
      var i = +rng.value;
      img.src = frames[i];
      img.alt = '顯微鏡下的一個紫錦草氣孔，錄影第 ' + times[i] + '。';
      t.textContent = times[i];
      rng.setAttribute('aria-valuetext', times[i]);
    });
  })();
})();
