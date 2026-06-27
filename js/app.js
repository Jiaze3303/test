/**
 * 主应用模块 - 导航切换、智能选型计算
 * 依赖：js/data/product_db.js (PRODUCT_DB)
 */

(function() {
  'use strict';

  // ═══════════ THEME & LANGUAGE ═══════════
  function swapThemeImages(isDark) {
    document.querySelectorAll('img[data-dark-src]').forEach(function(img) {
      var lightSrc = img.getAttribute('src').replace('-dark', '');
      var darkSrc = img.getAttribute('data-dark-src');
      img.setAttribute('src', isDark ? darkSrc : lightSrc);
    });
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    var icon = isDark ? '☀️' : '🌙';
    var btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = icon;
    var btnM = document.getElementById('themeBtnMobile');
    if (btnM) btnM.textContent = icon;
    swapThemeImages(isDark);
  }

  function initTheme() {
    var saved = localStorage.getItem('theme');
    var isDark = saved === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      var icon = '☀️';
      var btn = document.getElementById('themeBtn');
      if (btn) btn.textContent = icon;
      var btnM = document.getElementById('themeBtnMobile');
      if (btnM) btnM.textContent = icon;
    }
    swapThemeImages(isDark);
  }

  var currentLang = localStorage.getItem('lang') || 'zh';
  var i18n = {
    zh: {
      title: 'HIKROBOT · 读码器选型工具',
      status: '计算结果仅供参考，建议实测验证',
      tab1: '智能选型', tab2: '竞品对标', tab3: '配单表', tab4: '对照表',
      card1: '📋 核心参数配置', card2: '📐 方案示意图', card3: '🏆 最佳推荐型号',
      sec1: '🔖 码制 & 模块尺寸', sec2: '📐 距离 & 视野参数',
      codeType: '码制类型 *', moduleSize: '模块尺寸 *',
      workDist: '工作距离 *', fovW: '期望视野宽度 *', fovH: '期望视野高度 *',
      placeholder: '请输入',
      runBtn: '⚡ 开始智能选型',
      showModal: '📋 查看所有满足条件的型号清单',
      emptyState: '等待选型结果...',
      langBtn: 'EN',
      cpSearch: '搜索友商型号 / 海康型号，如 SR-1000、ID3013PM…',
      cpBrand: '全部品牌', cpReset: '重置', cpExpand: '📂 展开所有',
      cpStats: '共 0 条对标记录',
      mpSearch: '搜索基线/经销 型号名称或物料代码，如 MV-ID803、IDA02X…',
      mpCat: '全部系列', mpReset: '重置', mpCollapse: '📁 全部收起', mpExpand: '📂 全部展开',
      bomCat: '-- 请选择产品大类 --', bomSer: '-- 请先选择大类 --', bomModel: '-- 请先选择系列 --',
      bomAdd: '⚡ 生成配单', bomClear: '重置', bomExport: '⬇ 导出 CSV'
    },
    en: {
      title: 'HIKROBOT · Code Reader Selector',
      status: 'Results are for reference only, please verify with actual tests',
      tab1: 'Selection', tab2: 'Competitor', tab3: 'BOM', tab4: 'Mapping',
      card1: '📋 Core Parameters', card2: '📐 Schematic', card3: '🏆 Best Match',
      sec1: '🔖 Code Type & Module Size', sec2: '📐 Distance & FOV',
      codeType: 'Code Type *', moduleSize: 'Module Size *',
      workDist: 'Working Distance *', fovW: 'FOV Width *', fovH: 'FOV Height *',
      placeholder: 'Enter value',
      runBtn: '⚡ Start Selection',
      showModal: '📋 View All Matching Models',
      emptyState: 'Waiting for selection...',
      langBtn: '中',
      cpSearch: 'Search competitor / HIKROBOT model, e.g. SR-1000, ID3013PM…',
      cpBrand: 'All Brands', cpReset: 'Reset', cpExpand: '📂 Expand All',
      cpStats: '0 records',
      mpSearch: 'Search model name or material code, e.g. MV-ID803, IDA02X…',
      mpCat: 'All Series', mpReset: 'Reset', mpCollapse: '📁 Collapse All', mpExpand: '📂 Expand All',
      bomCat: '-- Select Category --', bomSer: '-- Select Category First --', bomModel: '-- Select Series First --',
      bomAdd: '⚡ Generate BOM', bomClear: 'Reset', bomExport: '⬇ Export CSV'
    }
  };

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    var t = i18n[lang];
    document.getElementById('langBtn').textContent = t.langBtn;
    var langBtnM = document.getElementById('langBtnMobile');
    if (langBtnM) langBtnM.textContent = t.langBtn;
    document.querySelector('.logo-area h1').innerHTML = 
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect x="2" y="2" width="9" height="9" rx="1" fill="#f76504"/><rect x="13" y="2" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="2" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="13" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.15)"/></svg> ' + t.title + ' <span class="badge">V3.0</span>';
    document.querySelector('.status-badge').textContent = t.status;
    var tabs = document.querySelectorAll('.nav-tab');
    var tabTexts = [t.tab1, t.tab2, t.tab3, t.tab4];
    tabs.forEach(function(tab, i) {
      var icon = tab.querySelector('.nav-tab-icon');
      if (icon && tabTexts[i]) tab.innerHTML = '<span class="nav-tab-icon">' + icon.textContent + '</span>' + tabTexts[i];
    });
    var headers = document.querySelectorAll('.card-header');
    if (headers[0]) headers[0].textContent = t.card1;
    if (headers[1]) headers[1].textContent = t.card2;
    if (headers[2]) headers[2].textContent = t.card3;
    var secTitles = document.querySelectorAll('.form-section-title');
    if (secTitles[0]) secTitles[0].innerHTML = t.sec1;
    if (secTitles[1]) secTitles[1].innerHTML = t.sec2;
    var labels = document.querySelectorAll('.left-panel label');
    if (labels[0]) labels[0].textContent = t.codeType;
    if (labels[1]) labels[1].textContent = t.moduleSize;
    if (labels[2]) labels[2].textContent = t.workDist;
    if (labels[3]) labels[3].textContent = t.fovW;
    if (labels[4]) labels[4].textContent = t.fovH;
    document.querySelectorAll('.left-panel input[type="number"]').forEach(function(inp) {
      inp.placeholder = t.placeholder;
    });
    document.getElementById('runBtn').textContent = t.runBtn;
    document.getElementById('showModalBtn').textContent = t.showModal;
    document.querySelector('.empty-state').textContent = t.emptyState;
  }

  function toggleLang() {
    applyLang(currentLang === 'zh' ? 'en' : 'zh');
  }

  // Expose to global scope for onclick handlers
  window.toggleTheme = toggleTheme;
  window.toggleLang = toggleLang;

  // ─── 导航切换 ───
  function initNav() {
    var tabs = document.querySelectorAll('.nav-tab');
    var pages = document.querySelectorAll('.page');

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        pages.forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var targetId = tab.dataset.page;
        var targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add('active');
      });
    });
  }

  // ─── 工具函数 ───
  function toMM(value, unit) {
    if (unit === 'mil') return value * 0.0254;
    if (unit === 'cm') return value * 10;
    return parseFloat(value);
  }

  function estimateFOV(model, wdMM) {
    if (!model.focal || !model.pixelSize) return null;
    var sensorWidth = (model.resolution.w * model.pixelSize) / 1000;
    var fovWidth = (sensorWidth * wdMM) / model.focal;
    var sensorHeight = (model.resolution.h * model.pixelSize) / 1000;
    var fovHeight = (sensorHeight * wdMM) / model.focal;
    return { width: Math.round(fovWidth), height: Math.round(fovHeight) };
  }

  function isCodeType2D(codeType) { return codeType === 'QR'; }

  function getPPMFilterRange(codeType) {
    return isCodeType2D(codeType) ? { min: 3, max: 20 } : { min: 1, max: 4 };
  }

  function getPPMScoreAndLevel(ppm, codeType) {
    var is2D = isCodeType2D(codeType);
    if (is2D) {
      if (ppm >= 4 && ppm <= 8)  return { score: 30, level: '优秀' };
      if (ppm > 8 && ppm <= 12)  return { score: 25, level: '良好' };
      if (ppm >= 12 || (ppm >= 3 && ppm < 4)) return { score: 15, level: '合格' };
      if (ppm < 3) return { score: -15, level: '较低' };
      return { score: 0, level: '未知' };
    } else {
      if (ppm >= 1.4 && ppm <= 2) return { score: 30, level: '优秀' };
      if (ppm >= 2 && ppm <= 3)   return { score: 25, level: '良好' };
      if ((ppm >= 1 && ppm < 1.4) || ppm >= 3) return { score: 15, level: '合格' };
      if (ppm < 1) return { score: -15, level: '较低' };
      return { score: 0, level: '未知' };
    }
  }

  var cachedFilteredList = null;

  function updateSchematic(wdMM, estW, estH, focal) {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('lblWd', wdMM + ' mm');
    set('lblFovW', (estW !== null && estW !== undefined) ? estW + ' mm' : '— mm');
    set('lblFovH', (estH !== null && estH !== undefined) ? estH + ' mm' : '— mm');
    set('lblFocal', focal ? focal + ' mm' : '— mm');
  }

  function resetSchematic() {
    var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('lblWd', '— mm');
    set('lblFovW', '— mm');
    set('lblFovH', '— mm');
    set('lblFocal', '— mm');
  }

  // ─── 选型计算 ───
  function runSelection() {
    var codeType = document.getElementById('codeType').value;
    var mSize = parseFloat(document.getElementById('moduleSize').value);
    var mUnit = document.getElementById('moduleUnit').value;
    var fovW = parseFloat(document.getElementById('fovWidth').value);
    var fovWUnit = document.getElementById('fovUnit').value;
    var fovH = parseFloat(document.getElementById('fovHeight').value);
    var fovHUnit = document.getElementById('fovHeightUnit').value;
    var wd = parseFloat(document.getElementById('workingDistance').value);
    var dUnit = document.getElementById('distanceUnit').value;

    if (!codeType || isNaN(mSize) || isNaN(fovW) || isNaN(fovH) || isNaN(wd) || 
        mSize <= 0 || fovW <= 0 || fovH <= 0 || wd <= 0) {
      alert('请完整填写所有必填参数（码制类型、模块尺寸、工作距离、视野宽度、视野高度），且数值必须大于0');
      resetSchematic();
      document.getElementById('top1Content').innerHTML = '<div class="empty-state">等待参数输入...</div>';
      document.getElementById('showModalBtn').disabled = true;
      cachedFilteredList = null;
      return;
    }

    var moduleMM = toMM(mSize, mUnit);
    var fovReqW_mm = toMM(fovW, fovWUnit);
    var fovReqH_mm = toMM(fovH, fovHUnit);
    var wdMM = toMM(wd, dUnit);
    var is2D = isCodeType2D(codeType);
    var divisor = is2D ? 5 : 1.5;
    var requiredPrecision = moduleMM / divisor;
    var requiredPixelsW = Math.ceil(fovReqW_mm / requiredPrecision);
    var requiredPixelsH = Math.ceil(fovReqH_mm / requiredPrecision);
    var ppmRange = getPPMFilterRange(codeType);

    // 检查 PRODUCT_DB 是否可用
    if (typeof PRODUCT_DB === 'undefined') {
      alert('产品数据库未加载，请确保 product_db.js 已引入');
      return;
    }

    var allScored = PRODUCT_DB.map(function(model) {
      var score = 0, reasons = [];
      var sensorWidthPx = model.resolution.w;
      var sensorHeightPx = model.resolution.h;
      var fovEst = estimateFOV(model, wdMM);
      var ppm = null, ppmLevel = '', ppmScore = 0;

      if (model.focal && fovEst) {
        ppm = (sensorWidthPx / fovEst.width) * moduleMM;
        var ppmResult = getPPMScoreAndLevel(ppm, codeType);
        ppmScore = ppmResult.score;
        ppmLevel = ppmResult.level;
      }

      // 分辨率评分
      if (sensorWidthPx >= requiredPixelsW && sensorHeightPx >= requiredPixelsH) {
        score += 30;
        reasons.push('分辨率满足');
      } else if (sensorWidthPx >= requiredPixelsW * 0.8 && sensorHeightPx >= requiredPixelsH * 0.8) {
        score += 15;
        reasons.push('分辨率接近');
      } else {
        score -= 20;
        reasons.push('分辨率偏低');
      }

      // PPM 评分
      if (ppm !== null) {
        score += ppmScore;
        reasons.push('PPM' + ppmLevel + '(' + ppm.toFixed(2) + ')');
      } else {
        score += 5;
        reasons.push('C-Mount');
      }

      // 工作距离评分
      if (wdMM >= model.workingDist.min && wdMM <= model.workingDist.max) {
        score += 15;
        reasons.push('距离适配');
      } else {
        score -= 5;
        reasons.push('距离不适配');
      }

      // 视野评分
      if (model.focal && fovEst) {
        if (fovEst.width >= fovReqW_mm && fovEst.height >= fovReqH_mm) {
          score += 15;
          reasons.push('视野满足');
        } else {
          score -= 20;
          reasons.push('视野不足');
        }
      }

      return { model: model, score: score, ppm: ppm, ppmLevel: ppmLevel, reasons: reasons, fovEst: fovEst };
    });

    allScored.sort(function(a, b) { return b.score - a.score; });

    var filtered = allScored.filter(function(item) {
      var wdOK = (wdMM >= item.model.workingDist.min && wdMM <= item.model.workingDist.max);
      var ppmOK = true;
      if (item.model.focal && item.ppm !== null) {
        ppmOK = (item.ppm >= ppmRange.min && item.ppm <= ppmRange.max);
      }
      var fovOK = true;
      if (item.model.focal && item.fovEst) {
        fovOK = (item.fovEst.width >= fovReqW_mm && item.fovEst.height >= fovReqH_mm);
      }
      return wdOK && ppmOK && fovOK;
    });

    cachedFilteredList = filtered;
    document.getElementById('showModalBtn').disabled = false;

    if (filtered.length > 0) {
      var best = filtered[0];
      var ppmDisplay = best.ppm !== null ? best.ppm.toFixed(2) : '—';
      var ppmLevelDisplay = best.ppmLevel ? ' (' + best.ppmLevel + ')' : '';
      document.getElementById('top1Content').innerHTML = 
        '<div class="result-main">' +
          '<div class="result-card"><strong>首选型号</strong><span>' + best.model.model + '</span></div>' +
          '<div class="result-card"><strong>PPM</strong><span>' + ppmDisplay + ppmLevelDisplay + '</span></div>' +
        '</div>' +
        '<div class="model-preview">' +
          '<span>' + best.model.series + ' · ' + best.model.resolution.w + '×' + best.model.resolution.h + ' · ' + best.model.interface + '</span>' +
          '<span class="tag">' + best.model.protection + '</span>' +
        '</div>';
      var estW = best.fovEst ? best.fovEst.width : null;
      var estH = best.fovEst ? best.fovEst.height : null;
      updateSchematic(wdMM, estW, estH, best.model.focal);
    } else {
      updateSchematic(wdMM, null, null, null);
      document.getElementById('top1Content').innerHTML = 
        '<div class="warning-badge">⚠️ 没有找到同时满足所有条件的型号<br>请调整参数后重试</div>';
    }
  }

  // ─── Modal 渲染 ───
  function renderModalWithSeriesFilter() {
    if (!cachedFilteredList || cachedFilteredList.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="empty-state">暂无满足条件的型号，请调整参数后重新选型</div>';
      return;
    }

    var checkboxes = document.querySelectorAll('#seriesCheckGroup input[type="checkbox"]');
    var selectedSeries = Array.from(checkboxes).filter(function(cb) { return cb.checked; }).map(function(cb) { return cb.value; });
    var filteredBySeries = cachedFilteredList.filter(function(item) {
      return selectedSeries.indexOf(item.model.series) !== -1;
    });

    if (filteredBySeries.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="warning-badge">⚠️ 当前勾选的系列中无匹配型号，请勾选其他系列</div>';
      return;
    }

    var html = '';
    filteredBySeries.forEach(function(item, idx) {
      var m = item.model;
      var fovEst = item.fovEst;
      var ppmDisplay = item.ppm !== null ? item.ppm.toFixed(2) : '— (C-Mount)';
      var ppmLevelDisplay = item.ppmLevel ? ' (' + item.ppmLevel + ')' : '';
      var fovStatus = fovEst ? '📐 预估视野 ' + fovEst.width + '×' + fovEst.height + 'mm' : '🔧 C-Mount';
      html += '<div class="modal-model-entry ' + (idx === 0 ? 'recommended' : '') + '">' +
        '<div class="modal-entry-header">' +
          '<span class="modal-model-name">' + m.model + '</span>' +
          '<span class="modal-model-series">' + m.series + '</span>' +
        '</div>' +
        '<div class="modal-spec-grid">' +
          '<div class="spec-item">🔘 ' + m.resolution.w + '×' + m.resolution.h + '</div>' +
          '<div class="spec-item">🔌 ' + m.interface + '</div>' +
          '<div class="spec-item">🛡️ ' + m.protection + '</div>' +
          '<div class="spec-item">' + (m.focal ? '🔍 ' + m.focal + 'mm' : '🔧 C-Mount') + '</div>' +
        '</div>' +
        '<div class="ppm-value-row"><span>📊 真实 PPM：<span class="ppm-value-highlight">' + ppmDisplay + '</span>' + ppmLevelDisplay + '</span></div>' +
        '<div class="info-row">' +
          '<span class="info-tag">📏 工作距离 ' + m.workingDist.min + '-' + m.workingDist.max + 'mm</span>' +
          '<span class="info-tag">' + fovStatus + '</span>' +
        '</div>' +
        '<div class="reasons-row">' + item.reasons.map(function(r) { return '<span class="reason-badge">✨ ' + r + '</span>'; }).join('') + '</div>' +
      '</div>';
    });
    document.getElementById('modalModelList').innerHTML = html;
  }

  function initModal() {
    var modal = document.getElementById('modelModal');
    var showBtn = document.getElementById('showModalBtn');
    var closeBtn = document.getElementById('closeModalBtn');
    var resetBtn = document.getElementById('resetSeriesFilterBtn');

    showBtn.addEventListener('click', function() {
      renderModalWithSeriesFilter();
      modal.classList.add('active');
    });

    closeBtn.addEventListener('click', function() {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.classList.remove('active');
    });

    var seriesChecks = document.querySelectorAll('#seriesCheckGroup input');
    seriesChecks.forEach(function(cb) {
      cb.addEventListener('change', function() {
        if (modal.classList.contains('active')) renderModalWithSeriesFilter();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        seriesChecks.forEach(function(cb) { cb.checked = true; });
        if (modal.classList.contains('active')) renderModalWithSeriesFilter();
      });
    }
  }

  // ─── 初始化 ───
  function init() {
    initNav();

    // 清空表单
    document.getElementById('codeType').value = '';
    document.getElementById('moduleSize').value = '';
    document.getElementById('workingDistance').value = '';
    document.getElementById('fovWidth').value = '';
    document.getElementById('fovHeight').value = '';
    resetSchematic();
    document.getElementById('top1Content').innerHTML = '<div class="empty-state">等待选型结果...</div>';
    document.getElementById('showModalBtn').disabled = true;

    // 绑定选型按钮
    document.getElementById('runBtn').addEventListener('click', runSelection);

    initModal();

    console.log('✅ 智能选型模块初始化完成，共 ' + (typeof PRODUCT_DB !== 'undefined' ? PRODUCT_DB.length : 0) + ' 个型号');
  }

  function boot() {
    initTheme();
    applyLang(currentLang);
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
