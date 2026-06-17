/**
 * 配单表模块 - 基于 peidan.json 数据
 * 每个型号独立存储自己的标配/选配，支持 JSON 热更新
 */

(function() {
  'use strict';

  var BOMQ_KEY = 'hikrobot_bomq_v5';
  var bomList = [];
  var selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
  var dataVersion = '';
  var tree = {};
  var cats = [];

  // ─── 数据指纹 ───
  function fingerprint(data) {
    if (!data || !data.modelList) return '';
    var str = JSON.stringify(data.modelList);
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return String(h);
  }

  // ─── 构建数据树（每个型号独立存配件） ───
  function buildTree(data) {
    tree = {};
    (data.modelList || []).forEach(function(item, index) {
      var cat = item.productCategory || '未分类';
      var ser = item.productSeries || '未分类';
      var model = item.productModel || '未知型号';

      if (!tree[cat]) tree[cat] = {};
      if (!tree[cat][ser]) tree[cat][ser] = { mains: [] };

      tree[cat][ser].mains.push({
        n: model,
        c: model, // 物料代码用型号名
        d: '读码器主机',
        index: index,
        standardAcc: (item.standardAccessories || []).map(function(a) {
          return { name: a.name, code: a.code, detail: a.detail || '' };
        }),
        optionalAcc: (item.optionalAccessories || []).map(function(a) {
          return { name: a.name, code: a.code, detail: a.detail || '', category: a.category || '其他' };
        })
      });
    });
    cats = Object.keys(tree);
    console.log('✅ buildTree 完成：' + cats.length + ' 个大类，共 ' +
      (data.modelList || []).length + ' 个型号');
  }

  // ─── 获取当前选中型号对象 ───
  function getCurrentModel() {
    if (selState.modelIdx === null || !selState.cat || !selState.ser) return null;
    var mains = (tree[selState.cat] && tree[selState.cat][selState.ser])
                ? tree[selState.cat][selState.ser].mains : [];
    return mains[selState.modelIdx] || null;
  }

  // ─── localStorage ───
  function save() {
    try { localStorage.setItem(BOMQ_KEY, JSON.stringify(bomList)); } catch(e) {}
  }
  function load() {
    try {
      var r = localStorage.getItem(BOMQ_KEY);
      if (r) { var p = JSON.parse(r); if (Array.isArray(p)) bomList = p; }
    } catch(e) {}
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function(c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // ─── 下拉菜单渲染 ───
  function renderCatSel() {
    var sel = document.getElementById('bomCatSel');
    if (!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="">-- 请选择产品大类 --</option>';
    cats.forEach(function(c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
    if (cur && cats.indexOf(cur) !== -1) sel.value = cur;
  }

  function renderSerSel() {
    var sel = document.getElementById('bomSerSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- 请先选择大类 --</option>';
    sel.disabled = true;
    if (!selState.cat || !tree[selState.cat]) return;
    var sers = Object.keys(tree[selState.cat]);
    sers.forEach(function(s) {
      var o = document.createElement('option');
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.ser) sel.value = selState.ser;
  }

  function renderModelSel() {
    var sel = document.getElementById('bomModelSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- 请先选择系列 --</option>';
    sel.disabled = true;
    if (!selState.cat || !selState.ser || !tree[selState.cat] || !tree[selState.cat][selState.ser]) return;
    var mains = tree[selState.cat][selState.ser].mains || [];
    mains.forEach(function(m, i) {
      var o = document.createElement('option');
      o.value = i; o.textContent = m.n;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.modelIdx !== null) sel.value = selState.modelIdx;
  }

  // ─── 配件列表：按大类渲染，点击弹 Modal ───
  function renderAccList() {
    var container = document.getElementById('bomAccList');
    if (!container) return;
    var m = getCurrentModel();
    if (!m) {
      container.innerHTML = '<div class="bom-acc-empty">请先完成产品型号选择</div>';
      return;
    }

    var standardAccs = m.standardAcc || [];
    var optionalAccs = m.optionalAcc || [];

    // 标配自动勾选
    standardAccs.forEach(function(a) { selState.accCodes[a.code] = true; });

    if (!optionalAccs.length) {
      container.innerHTML = '<div class="bom-acc-empty" style="color:#0b5e42;">✅ 无选装配件，标配 ' + standardAccs.length + ' 项已自动包含</div>';
      return;
    }

    // 按 category 分组
    var groups = {};
    var groupOrder = [];
    optionalAccs.forEach(function(a) {
      var cat = a.category || '其他';
      if (!groups[cat]) { groups[cat] = []; groupOrder.push(cat); }
      groups[cat].push(a);
    });

    // 渲染大类卡片
    var html = '';
    groupOrder.forEach(function(cat) {
      var items = groups[cat];
      var checkedCount = items.filter(function(a) { return selState.accCodes[a.code]; }).length;
      html += '<div class="bom-cat-card" data-cat="' + esc(cat) + '">' +
        '<div class="bom-cat-icon">' + getCatIcon(cat) + '</div>' +
        '<div class="bom-cat-info">' +
          '<div class="bom-cat-name">' + esc(cat) + '</div>' +
          '<div class="bom-cat-count">' + items.length + ' 个配件' + (checkedCount ? ' · <span class="bom-cat-checked">' + checkedCount + ' 已选</span>' : '') + '</div>' +
        '</div>' +
        '<div class="bom-cat-arrow">›</div>' +
      '</div>';
    });
    container.innerHTML = html;

    // 点击大类卡片 → 弹 Modal
    container.querySelectorAll('.bom-cat-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var cat = card.dataset.cat;
        openAccModal(cat, groups[cat]);
      });
    });
  }

  function getCatIcon(cat) {
    var map = { '线缆': '🔌', '电源': '⚡', '安装': '🔩', '其他': '📦', '镜头': '🔍', '光源': '💡', '大类': '📋' };
    return map[cat] || '📦';
  }

  // ─── 选配配件 Modal ───
  function openAccModal(catName, items) {
    var modal = document.getElementById('accModal');
    if (!modal) return;
    document.getElementById('accModalTitle').textContent = getCatIcon(catName) + ' ' + catName;

    var listEl = document.getElementById('accModalList');
    var html = '';
    items.forEach(function(a) {
      var checked = !!selState.accCodes[a.code];
      html += '<div class="acc-modal-item' + (checked ? ' checked' : '') + '" data-code="' + esc(a.code) + '">' +
        '<div class="acc-modal-check">' + (checked ? '✓' : '') + '</div>' +
        '<div class="acc-modal-info">' +
          '<div class="acc-modal-name">' + esc(a.name) + '</div>' +
          '<div class="acc-modal-code">' + esc(a.code) + '</div>' +
          (a.detail ? '<div class="acc-modal-detail">' + esc(a.detail) + '</div>' : '') +
        '</div>' +
      '</div>';
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll('.acc-modal-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var code = el.dataset.code;
        selState.accCodes[code] = !selState.accCodes[code];
        var isChecked = !!selState.accCodes[code];
        el.classList.toggle('checked', isChecked);
        var checkEl = el.querySelector('.acc-modal-check');
        if (checkEl) checkEl.textContent = isChecked ? '✓' : '';
        autoGenerateBOM();
        renderAccList(); // 刷新大类卡片已选计数（不关闭 Modal）
      });
    });

    modal.classList.add('active');
  }

  function bindAccCatEvents() {
    var m = getCurrentModel();
    if (!m) return;
    var optionalAccs = m.optionalAcc || [];
    var groups = {};
    var groupOrder = [];
    optionalAccs.forEach(function(a) {
      var cat = a.category || '其他';
      if (!groups[cat]) { groups[cat] = []; groupOrder.push(cat); }
      groups[cat].push(a);
    });
    var container = document.getElementById('bomAccList');
    if (!container) return;
    container.querySelectorAll('.bom-cat-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var cat = card.dataset.cat;
        openAccModal(cat, groups[cat]);
      });
    });
  }

  function initAccModal() {
    var modal = document.getElementById('accModal');
    if (!modal) return;
    function closeModal() { modal.classList.remove('active'); }
    document.getElementById('accModalClose').addEventListener('click', closeModal);
    var doneBtn = document.getElementById('accModalClose2');
    if (doneBtn) doneBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
  }

  function updateAddBtn() {
    var btn = document.getElementById('bomAddToListBtn');
    if (btn) btn.disabled = (getCurrentModel() === null);
  }

  // ─── 自动生成配单 ───
  function autoGenerateBOM() {
    var m = getCurrentModel();
    if (!m) return;
    var qty = 1;
    var newBom = [];

    newBom.push({ type: '主机', n: m.n, c: m.c, d: m.d, qty: qty,
                  cat: selState.cat, ser: selState.ser });

    (m.standardAcc || []).forEach(function(a) {
      newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail, qty: qty,
                    scene: '', accType: '标配', cat: selState.cat, ser: selState.ser });
    });

    (m.optionalAcc || []).forEach(function(a) {
      if (selState.accCodes[a.code]) {
        newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail, qty: qty, accType: '选配', cat: selState.cat, ser: selState.ser });
      }
    });

    bomList = newBom;
    save();
    renderTable();
  }

  // ─── 配单表 ───
  function renderTable() {
    var tbody = document.getElementById('bomQBody');
    if (!tbody) return;

    var setStat = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
    var countEl = document.getElementById('bomQCount');
    if (countEl) countEl.textContent = '共 ' + bomList.length + ' 行';
    setStat('bomStatTotal', bomList.length);
    setStat('bomStatMain',  bomList.filter(function(r) { return r.type === '主机'; }).length);
    setStat('bomStatAcc',   bomList.filter(function(r) { return r.type === '配件'; }).length);

    if (!bomList.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="bom-q-empty">请选择型号，配单将自动生成</td></tr>';
      return;
    }

    tbody.innerHTML = bomList.map(function(row, i) {
      var typeLabel = row.type + (row.accType ? ' (' + row.accType + ')' : '');
      var typeClass = row.type === '配件' ? ' acc' : '';
      var rowBg = row.type === '主机' ? 'bom-row-main' : (row.accType === '标配' ? 'bom-row-std' : 'bom-row-opt');
      return '<tr data-i="' + i + '" class="' + rowBg + '">' +
        '<td class="bom-q-idx">' + (i + 1) + '</td>' +
        '<td><span class="bom-q-type-badge' + typeClass + '">' + esc(typeLabel) + '</span></td>' +
        '<td contenteditable="true" data-f="n" style="min-width:140px">' + esc(row.n || '') + '</td>' +
        '<td style="font-size:0.68rem;color:var(--text-muted);max-width:200px;word-break:break-all;">' + esc((row.d || '').slice(0, 80)) + '</td>' +
        '<td><span class="bom-q-code">' + esc(row.c || '—') + '</span></td>' +
        '<td style="text-align:center"><button class="bom-q-del" data-i="' + i + '">✕</button></td>' +
      '</tr>';
    }).join('');

    tbody.querySelectorAll('td[contenteditable]').forEach(function(td) {
      td.addEventListener('blur', function() {
        var i = +td.closest('tr').dataset.i;
        var f = td.dataset.f;
        if (bomList[i]) { bomList[i][f] = td.textContent.trim(); save(); }
      });
      td.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); td.blur(); }
      });
    });

    tbody.querySelectorAll('.bom-q-del').forEach(function(btn) {
      btn.addEventListener('click', function() {
        bomList.splice(+btn.dataset.i, 1);
        save();
        renderTable();
      });
    });
  }

  // ─── 导出 CSV ───
  function exportCSV() {
    if (!bomList.length) { alert('配单表为空'); return; }
    var rows = [['#', '配件类型', '物料名称', '描述', '物料代码']].concat(
      bomList.map(function(r, i) {
        return [i + 1, r.type + (r.accType ? ' (' + r.accType + ')' : ''), r.n, r.d, r.c];
      })
    );
    var csv = rows.map(function(r) {
      return r.map(function(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }).join(',');
    }).join('\r\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'HIKROBOT_配单表_' + new Date().toLocaleDateString('zh-CN').replace(/\//g, '-') + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearBOM() {
    if (!bomList.length) return;
    if (confirm('确认清空全部配单行？')) { bomList = []; save(); renderTable(); }
  }

  // ─── 数据加载：只在数据真正变化时重建树并刷新 UI ───
  function applyData(data) {
    var fp = fingerprint(data);
    if (!fp || fp === dataVersion) return; // 无变化
    dataVersion = fp;
    buildTree(data);
    // 重置选择状态，重新渲染所有下拉
    selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
    renderCatSel();
    renderSerSel();
    renderModelSel();
    renderAccList();
    updateAddBtn();
    renderTable();
  }

  // ─── 事件绑定（只执行一次） ───
  function bindEvents() {
    if (window._bomEventsBound) return;
    window._bomEventsBound = true;

    // 产品大类
    document.getElementById('bomCatSel').addEventListener('change', function() {
      selState.cat = this.value;
      selState.ser = ''; selState.modelIdx = null; selState.accCodes = {};
      bomList = []; save(); renderTable();
      renderSerSel(); renderModelSel(); renderAccList(); updateAddBtn();
    });

    // 产品系列
    document.getElementById('bomSerSel').addEventListener('change', function() {
      selState.ser = this.value;
      selState.modelIdx = null; selState.accCodes = {};
      bomList = []; save(); renderTable();
      renderModelSel(); renderAccList(); updateAddBtn();
    });

    // 具体型号
    document.getElementById('bomModelSel').addEventListener('change', function() {
      selState.modelIdx = this.value !== '' ? +this.value : null;
      selState.accCodes = {};
      bomList = []; save(); renderTable();
      renderAccList(); updateAddBtn();
      if (selState.modelIdx !== null) setTimeout(autoGenerateBOM, 50);
    });

    // 生成配单按钮
    var addBtn = document.getElementById('bomAddToListBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        if (getCurrentModel()) {
          autoGenerateBOM();
          addBtn.textContent = '✓ 已更新';
          setTimeout(function() { addBtn.textContent = '✓ 自动生成配单'; }, 1000);
        }
      });
    }

    // 清空 & 导出
    var clearBtn = document.getElementById('bomQClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearBOM);
    var exportBtn = document.getElementById('bomQExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    initAccModal();
  }

  // ─── 对外暴露：JSON 到位后调用 ───
  function init() {
    bindEvents();
    // 刷新时配单明细自动清空（不从 localStorage 恢复）
    bomList = [];
    renderTable();
    // PEIDAN_DATA 由 peidan.js 的 <script> 标签同步赋值
    // peidan.js 末尾会主动调用 BOM.applyData()，这里做一次兜底
    if (window.PEIDAN_DATA) {
      applyData(window.PEIDAN_DATA);
    }
  }

  // DOM ready 后立即绑定事件 & 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BOM = {
    init: init,
    applyData: applyData,
    exportCSV: exportCSV,
    clearBOM: clearBOM,
    getData: function() { return bomList; },
    getTree: function() { return tree; },
    getCats: function() { return cats; }
  };

})();