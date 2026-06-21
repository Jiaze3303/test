/**
 * 配单表模块 - 修复版本
 * 基于 PEIDAN_DATA 数据
 */

(function() {
  'use strict';

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

  // ─── 生成配件唯一ID ───
  function getAccKey(acc, index) {
    // 使用 code + name + index 组合确保唯一性
    var code = acc.code || 'no-code';
    var name = acc.name || 'no-name';
    return code + '||' + name + '||' + index;
  }

  // ─── 构建数据树（修复版） ───
  function buildTree(data) {
    tree = {};
    var modelList = data.modelList || [];
    
    modelList.forEach(function(item, index) {
      var cat = (item.productCategory || '未分类').trim();
      var ser = (item.productSeries || '未分类').trim();
      var model = (item.productModel || '未知型号').trim();

      if (!tree[cat]) tree[cat] = {};
      if (!tree[cat][ser]) tree[cat][ser] = { mains: [] };

      var exists = tree[cat][ser].mains.some(function(m) { return m.n === model; });
      if (!exists) {
        tree[cat][ser].mains.push({
          n: model,
          c: model,
          d: '读码器主机',
          index: index,
          standardAcc: (item.standardAccessories || []).map(function(a, idx) {
            return { 
              name: a.name, 
              code: a.code, 
              detail: a.detail || '',
              _key: getAccKey(a, idx)
            };
          }),
          optionalAcc: (item.optionalAccessories || []).map(function(a, idx) {
            return { 
              name: a.name, 
              code: a.code, 
              detail: a.detail || '', 
              category: a.category || '其他',
              _key: getAccKey(a, idx)
            };
          })
        });
      }
    });

    cats = Object.keys(tree).sort();
    cats.forEach(function(cat) {
      var serKeys = Object.keys(tree[cat]).sort();
      var sortedSer = {};
      serKeys.forEach(function(key) {
        sortedSer[key] = tree[cat][key];
      });
      tree[cat] = sortedSer;
    });

    console.log('✅ buildTree 完成：' + cats.length + ' 个大类');
  }

  // ─── 获取当前选中型号对象 ───
  function getCurrentModel() {
    if (selState.modelIdx === null || !selState.cat || !selState.ser) return null;
    try {
      var mains = (tree[selState.cat] && tree[selState.cat][selState.ser])
                  ? tree[selState.cat][selState.ser].mains : [];
      return mains[selState.modelIdx] || null;
    } catch(e) {
      return null;
    }
  }

  // 配单不持久化：刷新页面即清空（按需求设计），save() 保留为空函数兼容调用点
  function save() {}

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
      o.value = c;
      o.textContent = c;
      if (c === cur) o.selected = true;
      sel.appendChild(o);
    });
    if (cur && cats.indexOf(cur) === -1) {
      sel.value = '';
      selState.cat = '';
    }
  }

  function renderSerSel() {
    var sel = document.getElementById('bomSerSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- 请先选择大类 --</option>';
    sel.disabled = true;
    if (!selState.cat || !tree[selState.cat]) {
      selState.ser = '';
      return;
    }
    var sers = Object.keys(tree[selState.cat]).sort();
    if (sers.length === 0) return;
    sers.forEach(function(s) {
      var o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.ser && sers.indexOf(selState.ser) !== -1) {
      sel.value = selState.ser;
    } else {
      sel.value = '';
      selState.ser = '';
    }
  }

  function renderModelSel() {
    var sel = document.getElementById('bomModelSel');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- 请先选择系列 --</option>';
    sel.disabled = true;
    if (!selState.cat || !selState.ser || !tree[selState.cat] || !tree[selState.cat][selState.ser]) {
      selState.modelIdx = null;
      return;
    }
    var mains = tree[selState.cat][selState.ser].mains || [];
    if (mains.length === 0) return;
    mains.forEach(function(m, i) {
      var o = document.createElement('option');
      o.value = i;
      o.textContent = m.n;
      sel.appendChild(o);
    });
    sel.disabled = false;
    if (selState.modelIdx !== null && selState.modelIdx < mains.length) {
      sel.value = selState.modelIdx;
    } else {
      sel.value = '';
      selState.modelIdx = null;
    }
  }

  // ─── 配件列表 ───
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

    // 标配自动勾选 - 使用 _key
    standardAccs.forEach(function(a) { 
      if (a._key) selState.accCodes[a._key] = true; 
    });

    if (!optionalAccs.length) {
      container.innerHTML = '<div class="bom-acc-empty" style="color:#0b5e42;">✅ 无选装配件，标配 ' + standardAccs.length + ' 项已自动包含</div>';
      return;
    }

    var groups = {};
    var groupOrder = [];
    optionalAccs.forEach(function(a) {
      var cat = a.category || '其他';
      if (!groups[cat]) { groups[cat] = []; groupOrder.push(cat); }
      groups[cat].push(a);
    });

    var html = '';
    groupOrder.forEach(function(cat) {
      var items = groups[cat];
      var checkedCount = items.filter(function(a) { return selState.accCodes[a._key]; }).length;
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
      var checked = !!selState.accCodes[a._key];
      html += '<div class="acc-modal-item' + (checked ? ' checked' : '') + '" data-key="' + esc(a._key) + '">' +
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
        var key = el.dataset.key;
        selState.accCodes[key] = !selState.accCodes[key];
        var isChecked = !!selState.accCodes[key];
        el.classList.toggle('checked', isChecked);
        var checkEl = el.querySelector('.acc-modal-check');
        if (checkEl) checkEl.textContent = isChecked ? '✓' : '';
        autoGenerateBOM();
        renderAccList();
      });
    });

    modal.classList.add('active');
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
      if (a.code && a.name) {
        newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty: qty, accType: '标配', cat: selState.cat, ser: selState.ser });
      }
    });

    (m.optionalAcc || []).forEach(function(a) {
      if (a.code && a.name && selState.accCodes[a._key]) {
        newBom.push({ type: '配件', n: a.name, c: a.code, d: a.detail || '', qty: qty, accType: '选配', cat: selState.cat, ser: selState.ser });
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
      tbody.innerHTML = 
        '<tr>' +
          '<td colspan="6" class="bom-q-empty" style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted);">请选择型号，配单将自动生成</td>' +
        '</tr>';
      return;
    }

    tbody.innerHTML = bomList.map(function(row, i) {
      var typeLabel = row.accType || row.type;
      var typeClass = row.type === '配件' ? ' acc' : '';
      var rowBg = row.type === '主机' ? 'bom-row-main' : (row.accType === '标配' ? 'bom-row-std' : 'bom-row-opt');
      
      // 主机不显示物料代码
      var codeDisplay = row.type === '主机' ? '—' : (row.c || '—');
      
      return '<tr data-i="' + i + '" class="' + rowBg + '">' +
        '<td class="bom-q-idx" style="text-align:center;">' + (i + 1) + '</td>' +
        '<td style="text-align:center;"><span class="bom-q-type-badge' + typeClass + '">' + esc(typeLabel) + '</span></td>' +
        '<td class="bom-td-name" style="text-align:center;">' + esc(row.n || '') + '</td>' +
        '<td class="bom-q-desc" style="text-align:center;">' + esc((row.d || '').slice(0, 80)) + '</td>' +
        '<td style="text-align:center;"><span class="bom-q-code">' + esc(codeDisplay) + '</span></td>' +
        '<td style="text-align:center;"><button class="bom-q-del" data-i="' + i + '">✕</button></td>' +
      '</tr>';
    }).join('');

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
        var code = r.type === '主机' ? '-' : r.c;
        return [i + 1, r.type + (r.accType ? ' (' + r.accType + ')' : ''), r.n, r.d, code];
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

  // ─── 数据加载 ───
  function applyData(data) {
    if (!data || !data.modelList || data.modelList.length === 0) {
      console.warn('⚠️ PEIDAN_DATA 无效或为空');
      return;
    }
    var fp = fingerprint(data);
    if (fp === dataVersion && Object.keys(tree).length > 0) return;
    dataVersion = fp;
    buildTree(data);
    
    selState = { cat: '', ser: '', modelIdx: null, qty: 1, accCodes: {} };
    renderCatSel();
    renderSerSel();
    renderModelSel();
    renderAccList();
    updateAddBtn();
    renderTable();
  }

  // ─── 事件绑定 ───
  var _eventsBound = false;
  function bindEvents() {
    if (_eventsBound) return;
    _eventsBound = true;

    var catSel = document.getElementById('bomCatSel');
    var serSel = document.getElementById('bomSerSel');
    var modelSel = document.getElementById('bomModelSel');

    if (!catSel || !serSel || !modelSel) {
      console.warn('⚠️ 配单表关键 DOM 元素未找到，事件绑定失败');
      _eventsBound = false; // 允许下次重试
      return;
    }

    catSel.addEventListener('change', function() {
      selState.cat = this.value;
      selState.ser = '';
      selState.modelIdx = null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderSerSel();
      renderModelSel();
      renderAccList();
      updateAddBtn();
    });

    serSel.addEventListener('change', function() {
      selState.ser = this.value;
      selState.modelIdx = null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderModelSel();
      renderAccList();
      updateAddBtn();
    });

    modelSel.addEventListener('change', function() {
      selState.modelIdx = this.value !== '' ? +this.value : null;
      selState.accCodes = {};
      bomList = [];
      save();
      renderTable();
      renderAccList();
      updateAddBtn();
      if (selState.modelIdx !== null) setTimeout(autoGenerateBOM, 50);
    });

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

    var clearBtn = document.getElementById('bomQClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearBOM);
    var exportBtn = document.getElementById('bomQExportBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    initAccModal();
  }

  // ─── 初始化 ───
  function init() {
    bindEvents();
    bomList = [];
    renderTable();

    if (window.PEIDAN_DATA) {
      applyData(window.PEIDAN_DATA);
      bindEvents(); // 兜底：若首次绑定因 DOM 未就绪而失败，数据加载完成后重试
    } else {
      console.warn('⚠️ window.PEIDAN_DATA 未定义，等待数据加载...');
      var checkInterval = setInterval(function() {
        if (window.PEIDAN_DATA) {
          clearInterval(checkInterval);
          applyData(window.PEIDAN_DATA);
          bindEvents(); // 兜底重试
        }
      }, 100);
      setTimeout(function() { clearInterval(checkInterval); }, 5000);
    }
  }

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
