/**
 * 基线-经销对照表模块
 */
(function() {
  'use strict';

  var db = [];
  var currentData = [];
  var expandedCats = {}; // 记录哪些系列展开了

  function normalize(s) {
    return (s || '').toLowerCase().replace(/[\s\-_\/]+/g, '').replace(/^mv/i, 'mv');
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function(c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  function getUniqueCats() {
    var seen = {}, cats = [];
    db.forEach(function(r) { if (r.cat && !seen[r.cat]) { seen[r.cat]=1; cats.push(r.cat); } });
    return cats;
  }

  // ─── i18n 辅助 ───
  function _t(key, n) {
    if (window._i18n && window._i18n.t) return window._i18n.t(key, n);
    return key;
  }

  function initCatFilter() {
    var sel = document.getElementById('mpCatSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="all">' + _t('mpCatAll') + '</option>';
    getUniqueCats().forEach(function(c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
  }

  function doFilter() {
    var cat = document.getElementById('mpCatSelect').value;
    var kw  = normalize(document.getElementById('mpSearchInput').value.trim());
    currentData = db.filter(function(r) {
      var catOK = cat === 'all' || r.cat === cat;
      var kwOK  = !kw || [r.baseName, r.baseCode, r.distName, r.distCode]
        .some(function(v) { return normalize(v).indexOf(kw) !== -1; });
      return catOK && kwOK;
    });
    render();
  }

  function render() {
    var tbody = document.getElementById('mpTableBody');
    var stats = document.getElementById('mpStats');
    if (!tbody) return;

    if (stats) stats.textContent = _t('mpStats', currentData.length);

    if (!currentData.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="mp-empty">' + _t('mpNoMatch') + '</td></tr>';
      return;
    }

    // 按系列分组
    var groups = {};
    var groupOrder = [];
    currentData.forEach(function(r) {
      if (!groups[r.cat]) { groups[r.cat] = []; groupOrder.push(r.cat); }
      groups[r.cat].push(r);
    });

    var isSearching = document.getElementById('mpSearchInput').value.trim().length > 0;

    var html = '';
    groupOrder.forEach(function(cat) {
      var rows = groups[cat];
      // 搜索时自动展开有结果的系列；否则用用户手动展开状态
      var isOpen = isSearching ? true : !!expandedCats[cat];

      html += '<tr class="mp-cat-row' + (isOpen ? ' open' : '') + '" data-cat="' + esc(cat) + '">' +
        '<td colspan="5">' +
          '<span class="mp-cat-toggle">' + (isOpen ? '▼' : '▶') + '</span>' +
          '📂 ' + esc(cat) +
          '<span class="mp-cat-badge">' + _t('mpRecords', rows.length) + '</span>' +
        '</td></tr>';

      if (isOpen) {
        rows.forEach(function(r) {
          html += '<tr class="mp-data-row" data-parent-cat="' + esc(cat) + '">' +
            '<td class="mp-seq">' + esc(r.seq) + '</td>' +
            '<td class="mp-base-name">' + esc(r.baseName) + '</td>' +
            '<td class="mp-base-code"><span class="mp-code-tag base">' + (r.baseCode || '—') + '</span></td>' +
            '<td class="mp-dist-name">' + esc(r.distName) + '</td>' +
            '<td class="mp-dist-code"><span class="mp-code-tag dist">' + (r.distCode || '—') + '</span></td>' +
          '</tr>';
        });
      }
    });
    tbody.innerHTML = html;

    // 绑定系列标题点击展开/收起
    tbody.querySelectorAll('.mp-cat-row').forEach(function(tr) {
      tr.addEventListener('click', function() {
        var cat = tr.dataset.cat;
        expandedCats[cat] = !expandedCats[cat];
        render();
      });
    });

    updateToggleBtn();
  }

  function isAllExpanded() {
    var cats = getUniqueCats();
    return cats.length > 0 && cats.every(function(c) { return expandedCats[c]; });
  }

  function updateToggleBtn() {
    var btn = document.getElementById('mpToggleAllBtn');
    if (!btn) return;
    btn.textContent = isAllExpanded() ? _t('mpCollapse') : _t('mpExpand');
  }

  function toggleAll() {
    if (isAllExpanded()) {
      expandedCats = {};
    } else {
      currentData.forEach(function(r) { expandedCats[r.cat] = true; });
    }
    render();
  }

  function applyData(data) {
    if (!Array.isArray(data) || !data.length) return;
    db = data;
    currentData = data.slice();
    initCatFilter();
    doFilter();
    console.log('✅ 对照表加载，共 ' + db.length + ' 条');
  }

  function init() {
    var searchInput = document.getElementById('mpSearchInput');
    var catSelect   = document.getElementById('mpCatSelect');
    if (!searchInput) return;

    // 搜索防抖
    var timer;
    searchInput.addEventListener('input', function() {
      clearTimeout(timer);
      timer = setTimeout(doFilter, 200);
    });
    catSelect.addEventListener('change', doFilter);

    var toggleAllBtn = document.getElementById('mpToggleAllBtn');
    if (toggleAllBtn) toggleAllBtn.addEventListener('click', toggleAll);

    if (window.MAPPING_DATA) applyData(window.MAPPING_DATA);
    else {
      var check = setInterval(function() {
        if (window.MAPPING_DATA) { clearInterval(check); applyData(window.MAPPING_DATA); }
      }, 100);
      setTimeout(function() { clearInterval(check); }, 5000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.MAPPING = { applyData: applyData, reset: function() { db = []; currentData = []; expandedCats = {}; render(); }, getData: function() { return db; }, rerender: function() { initCatFilter(); doFilter(); } };
})();
