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
      // Titlebar
      title: 'HIKROBOT · 读码器选型工具',
      status: '计算结果仅供参考，建议实测验证',
      // Nav tabs
      tab1: '智能选型', tab2: '竞品对标', tab3: '配单表', tab4: '对照表',
      // Selection page
      card1: '📋 核心参数配置', card2: '📐 方案示意图', card3: '🏆 最佳推荐型号',
      sec1: '🔖 码制 & 模块尺寸', sec2: '📐 距离 & 视野参数',
      codeType: '码制类型 *', moduleSize: '模块尺寸 *',
      codeTypePh: '-- 请选择 --',
      codeType2D: '二维码 (2D)', codeType1D: '一维码 (1D)',
      workDist: '工作距离 *', fovW: '期望视野宽度 *', fovH: '期望视野高度 *',
      placeholder: '请输入',
      imgCaption: '💡 码制类型与模块尺寸说明',
      runBtn: '⚡ 开始智能选型',
      showModal: '📋 查看所有满足条件的型号清单',
      emptyState: '等待选型结果...',
      // SVG schematic
      svgEstW: '预估宽度', svgEstH: '预估高度', svgWd: '工作距离', svgFocal: '焦距',
      // Modal
      modalTitle: '📌 满足过滤条件的推荐型号',
      filterLabel: '🔍 按系列筛选', filterReset: '全选',
      modalEmpty: '请先进行选型',
      // Competitor page
      cpSearch: '搜索友商型号 / 海康型号，如 SR-1000、ID3013PM…',
      cpBrandLabel: '品牌筛选',
      cpBrandAll: '全部品牌',
      cpExpand: '📂 展开所有',
      cpStats: '共 {n} 条对标记录',
      cpStatsHint: '蓝色 = 友商核心特点 · 绿色 = 海康竞争优势',
      cpEmpty: '✨ 点击「展开所有」浏览全部对标数据，或在搜索框输入关键词自动匹配',
      // BOM page
      bomConfig: '配单配置',
      bomModelSel: '型号选择',
      bomStep1: '产品大类', bomStep2: '产品系列', bomStep3: '具体型号',
      bomCatPh: '-- 请选择产品大类 --', bomSerPh: '-- 请先选择大类 --', bomModelPh: '-- 请先选择系列 --',
      bomAcc: '选装配件',
      bomAccEmpty: '请先完成产品型号选择',
      bomAdd: '⚡ 生成配单',
      bomDetail: '配单明细',
      bomLegendMain: '■ 主机', bomLegendStd: '■ 标配', bomLegendOpt: '■ 选配',
      bomStatTotal: '总计', bomStatMain: '主机', bomStatAcc: '配件',
      bomReset: '重置', bomExport: '⬇ 导出 CSV',
      bomThIdx: '#', bomThType: '类型', bomThName: '物料名称', bomThDesc: '描述', bomThCode: '物料代码', bomThAction: '操作',
      bomEmpty: '请选择型号，配单将自动生成',
      bomCount: '共 {n} 行',
      bomFooterHint: '💡 蓝色 = 主机 · 浅蓝 = 标配 · 浅橙 = 选配',
      // Mapping page
      mpSearch: '搜索基线/经销 型号名称或物料代码，如 MV-ID803、IDA02X…',
      mpCatLabel: '系列筛选', mpCatAll: '全部系列',
      mpExpand: '📂 全部展开', mpCollapse: '📁 全部收起',
      mpStats: '共 {n} 条记录',
      mpStatsHint: '基线 = 直销物料 · 经销 = 渠道物料 · 每行一一对应',
      mpThBaseModel: '基线型号', mpThBaseCode: '基线代码',
      mpThDistModel: '经销型号', mpThDistCode: '经销代码',
      mpLoading: '正在加载对照表数据…',
      mpCount: '共 {n} 条',
      mpFooterHint: '💡 支持搜索基线和经销的型号名称及物料代码',
      mpNoMatch: '😔 未找到匹配记录，请调整搜索条件',
      mpRecords: '{n} 条',
      // Acc modal
      accTitle: '选装配件',
      accHint: '点击配件行即可勾选/取消',
      accDone: '完成',
      // BOM dynamic
      bomReadHost: '读码器主机',
      bomNoOptAcc: '✅ 无选装配件，标配 {n} 项已自动包含',
      bomAccCount: '{n} 个配件',
      bomSelected: '{n} 已选',
      // Mapping dynamic
      mpNoResult: '😔 未找到匹配记录，请调整搜索条件',

      // PPM levels
      ppmExcellent: '优秀', ppmGood: '良好', ppmPass: '合格',
      ppmLow: '较低', ppmUnknown: '未知',

      // Reasons
      reasonResOk: '分辨率满足', reasonResNear: '分辨率接近', reasonResLow: '分辨率偏低',
      reasonDistOk: '距离适配', reasonDistFail: '距离不适配',
      reasonFovOk: '视野满足', reasonFovFail: '视野不足',
      reasonCMount: 'C-Mount',

      // Alerts
      alertFillAll: '请完整填写所有必填参数（码制类型、模块尺寸、工作距离、视野宽度、视野高度），且数值必须大于0',
      alertNoDB: '产品数据库未加载，请确保 product_db.js 已引入',

      // Result display
      resultEstFOV: '📐 预估视野 {w}×{h}mm',
      resultPPM: '📊 真实 PPM',
      resultDist: '📏 工作距离 {min}-{max}mm',
      resultNoMatch: '⚠️ 没有找到同时满足所有条件的型号<br>请调整参数后重试',
      resultNoMatchShort: '⚠️ 当前勾选的系列中无匹配型号，请勾选其他系列',
      resultModalEmpty: '暂无满足条件的型号，请调整参数后重新选型',
      resultWaitParam: '等待参数输入...',
      resultFovStatus: '📐 预估视野 {w}×{h}mm',

      // Competitor dynamic
      cpNoMatch: '未找到匹配记录',
      cpNoMatchHint: '尝试其他关键词，支持友商型号 / 海康型号混合搜索',
      cpFeatLabel: '友商特点',
      cpAdvLabel: '我方优势',
      cpRecLabel: '推荐型号',
      cpCollapse: '📁 折叠所有',

      // BOM defaults
      bomUncategorized: '未分类',
      bomUnknownModel: '未知型号',
      bomOther: '其他',
      langBtn: 'EN'
    },
    en: {
      title: 'HIKROBOT · Code Reader Selector',
      status: 'Results are for reference only, please verify with actual tests',
      tab1: 'Selection', tab2: 'Competitor', tab3: 'BOM', tab4: 'Mapping',
      card1: '📋 Core Parameters', card2: '📐 Schematic', card3: '🏆 Best Match',
      sec1: '🔖 Code Type & Module Size', sec2: '📐 Distance & FOV',
      codeType: 'Code Type *', moduleSize: 'Module Size *',
      codeTypePh: '-- Select --',
      codeType2D: 'QR Code (2D)', codeType1D: 'Barcode (1D)',
      workDist: 'Working Distance *', fovW: 'FOV Width *', fovH: 'FOV Height *',
      placeholder: 'Enter value',
      imgCaption: '💡 Code Type & Module Size Guide',
      runBtn: '⚡ Start Selection',
      showModal: '📋 View All Matching Models',
      emptyState: 'Waiting for selection...',
      svgEstW: 'Est. Width', svgEstH: 'Est. Height', svgWd: 'Work Dist.', svgFocal: 'Focal',
      modalTitle: '📌 Matching Models',
      filterLabel: '🔍 Filter by Series', filterReset: 'Select All',
      modalEmpty: 'Run selection first',
      cpSearch: 'Search competitor / HIKROBOT model, e.g. SR-1000, ID3013PM…',
      cpBrandLabel: 'Brand',
      cpBrandAll: 'All Brands',
      cpExpand: '📂 Expand All',
      cpStats: '{n} records',
      cpStatsHint: 'Blue = Competitor Features · Green = HIKROBOT Advantages',
      cpEmpty: '✨ Click "Expand All" to browse, or type keywords to search',
      bomConfig: 'BOM Config',
      bomModelSel: 'Model Selection',
      bomStep1: 'Category', bomStep2: 'Series', bomStep3: 'Model',
      bomCatPh: '-- Select Category --', bomSerPh: '-- Select Category First --', bomModelPh: '-- Select Series First --',
      bomAcc: 'Optional Accessories',
      bomAccEmpty: 'Select a model first',
      bomAdd: '⚡ Generate BOM',
      bomDetail: 'BOM Details',
      bomLegendMain: '■ Main Unit', bomLegendStd: '■ Standard', bomLegendOpt: '■ Optional',
      bomStatTotal: 'Total', bomStatMain: 'Main', bomStatAcc: 'Accessories',
      bomReset: 'Reset', bomExport: '⬇ Export CSV',
      bomThIdx: '#', bomThType: 'Type', bomThName: 'Part Name', bomThDesc: 'Description', bomThCode: 'Part Code', bomThAction: 'Action',
      bomEmpty: 'Select a model to auto-generate BOM',
      bomCount: '{n} rows',
      bomFooterHint: '💡 Blue = Main · Light Blue = Standard · Light Orange = Optional',
      mpSearch: 'Search model name or material code, e.g. MV-ID803, IDA02X…',
      mpCatLabel: 'Series', mpCatAll: 'All Series',
      mpExpand: '📂 Expand All', mpCollapse: '📁 Collapse All',
      mpStats: '{n} records',
      mpStatsHint: 'Baseline = Direct Sales · Distribution = Channel · One-to-one mapping',
      mpThBaseModel: 'Baseline Model', mpThBaseCode: 'Baseline Code',
      mpThDistModel: 'Dist. Model', mpThDistCode: 'Dist. Code',
      mpLoading: 'Loading mapping data…',
      mpCount: '{n} items',
      mpFooterHint: '💡 Search baseline/distribution model names and material codes',
      mpNoMatch: '😔 No matching records found',
      mpRecords: '{n} items',
      accTitle: 'Accessories',
      accHint: 'Click an item to toggle selection',
      accDone: 'Done',
      bomReadHost: 'Code Reader',
      bomNoOptAcc: '✅ No optional accessories, {n} standard items included',
      bomAccCount: '{n} items',
      bomSelected: '{n} selected',
      mpNoResult: '😔 No matching records, adjust search criteria',

      // PPM levels
      ppmExcellent: 'Excellent', ppmGood: 'Good', ppmPass: 'Pass',
      ppmLow: 'Low', ppmUnknown: 'Unknown',

      // Reasons
      reasonResOk: 'Resolution OK', reasonResNear: 'Resolution Near', reasonResLow: 'Resolution Low',
      reasonDistOk: 'Distance OK', reasonDistFail: 'Distance Mismatch',
      reasonFovOk: 'FOV OK', reasonFovFail: 'FOV Insufficient',
      reasonCMount: 'C-Mount',

      // Alerts
      alertFillAll: 'Please fill all required fields (Code Type, Module Size, Working Distance, FOV Width, FOV Height) with values > 0',
      alertNoDB: 'Product database not loaded. Ensure product_db.js is included.',

      // Result display
      resultEstFOV: '📐 Est. FOV {w}×{h}mm',
      resultPPM: '📊 True PPM',
      resultDist: '📏 Distance {min}-{max}mm',
      resultNoMatch: '⚠️ No model matches all criteria.<br>Adjust parameters and retry.',
      resultNoMatchShort: '⚠️ No matching models in selected series.',
      resultModalEmpty: 'No matching models. Adjust parameters and re-run selection.',
      resultWaitParam: 'Waiting for parameters...',
      resultFovStatus: '📐 Est. FOV {w}×{h}mm',

      // Competitor dynamic
      cpNoMatch: 'No matching records',
      cpNoMatchHint: 'Try other keywords. Supports competitor / HIKROBOT model search.',
      cpFeatLabel: 'Competitor Features',
      cpAdvLabel: 'Our Advantages',
      cpRecLabel: 'Recommended Model',
      cpCollapse: '📁 Collapse All',

      // BOM defaults
      bomUncategorized: 'Uncategorized',
      bomUnknownModel: 'Unknown Model',
      bomOther: 'Other',
      langBtn: '中'
    }
  };

  // 获取翻译文本，支持 {n} 占位符
  function t(key, n) {
    var val = (i18n[currentLang] || i18n.zh)[key] || (i18n.zh[key] || key);
    if (n !== undefined) val = val.replace('{n}', n);
    return val;
  }

  // 暴露给 bom.js / mapping_module.js 使用
  window._i18n = {
    t: t,
    getLang: function() { return currentLang; }
  };

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // 1. 处理所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') {
        el.placeholder = val;
      } else if (el.tagName === 'OPTION') {
        el.textContent = val;
      } else {
        el.textContent = val;
      }
    });

    // 2. 处理 data-i18n-ph (placeholder)
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });

    // 2b. 处理 data-i18n-alt (alt text)
    document.querySelectorAll('[data-i18n-alt]').forEach(function(el) {
      el.alt = t(el.getAttribute('data-i18n-alt'));
    });

    // 3. 处理 data-i18n-html (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    // 4. Logo 区域（包含 SVG）
    document.querySelector('.logo-area h1').innerHTML = 
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><rect x="2" y="2" width="9" height="9" rx="1" fill="#f76504"/><rect x="13" y="2" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="2" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.25)"/><rect x="13" y="13" width="9" height="9" rx="1" fill="rgba(255,255,255,0.15)"/></svg> ' + t('title') + ' <span class="badge">V3.0</span>';

    // 5. 更新页面标题
    document.title = t('title');

    // 6. 通知 bom.js 和 mapping_module.js 重新渲染
    if (window.BOM && window.BOM.rerender) window.BOM.rerender();
    if (window.MAPPING && window.MAPPING.rerender) window.MAPPING.rerender();
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
      if (ppm >= 4 && ppm <= 8)  return { score: 30, level: t('ppmExcellent') };
      if (ppm > 8 && ppm <= 12)  return { score: 25, level: t('ppmGood') };
      if (ppm >= 12 || (ppm >= 3 && ppm < 4)) return { score: 15, level: t('ppmPass') };
      if (ppm < 3) return { score: -15, level: t('ppmLow') };
      return { score: 0, level: t('ppmUnknown') };
    } else {
      if (ppm >= 1.4 && ppm <= 2) return { score: 30, level: t('ppmExcellent') };
      if (ppm >= 2 && ppm <= 3)   return { score: 25, level: t('ppmGood') };
      if ((ppm >= 1 && ppm < 1.4) || ppm >= 3) return { score: 15, level: t('ppmPass') };
      if (ppm < 1) return { score: -15, level: t('ppmLow') };
      return { score: 0, level: t('ppmUnknown') };
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

    // 添加 loading 状态
    var runBtn = document.getElementById('runBtn');
    runBtn.classList.add('loading');
    runBtn.textContent = '';

    // 使用 requestAnimationFrame 延迟执行，让 loading 动画先渲染
    requestAnimationFrame(function() {
      setTimeout(function() {

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
      alert(t('alertNoDB'));
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
        reasons.push(t('reasonResOk'));
      } else if (sensorWidthPx >= requiredPixelsW * 0.8 && sensorHeightPx >= requiredPixelsH * 0.8) {
        score += 15;
        reasons.push(t('reasonResNear'));
      } else {
        score -= 20;
        reasons.push(t('reasonResLow'));
      }

      // PPM 评分
      if (ppm !== null) {
        score += ppmScore;
        reasons.push('PPM' + ppmLevel + '(' + ppm.toFixed(2) + ')');
      } else {
        score += 5;
        reasons.push(t('reasonCMount'));
      }

      // 工作距离评分
      if (wdMM >= model.workingDist.min && wdMM <= model.workingDist.max) {
        score += 15;
        reasons.push(t('reasonDistOk'));
      } else {
        score -= 5;
        reasons.push(t('reasonDistFail'));
      }

      // 视野评分
      if (model.focal && fovEst) {
        if (fovEst.width >= fovReqW_mm && fovEst.height >= fovReqH_mm) {
          score += 15;
          reasons.push(t('reasonFovOk'));
        } else {
          score -= 20;
          reasons.push(t('reasonFovFail'));
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
          '<div class="result-card"><strong>' + t('showModal').replace('📋 ', '') + '</strong><span>' + best.model.model + '</span></div>' +
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
        '<div class="warning-badge">' + t('resultNoMatch') + '</div>';
    }

    // 移除 loading 状态
    runBtn.classList.remove('loading');
    runBtn.textContent = t('runBtn');

      }, 80); // setTimeout end
    }); // requestAnimationFrame end
  }

  // ─── Modal 渲染 ───
  function renderModalWithSeriesFilter() {
    if (!cachedFilteredList || cachedFilteredList.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="empty-state">' + t('resultModalEmpty') + '</div>';
      return;
    }

    var checkboxes = document.querySelectorAll('#seriesCheckGroup input[type="checkbox"]');
    var selectedSeries = Array.from(checkboxes).filter(function(cb) { return cb.checked; }).map(function(cb) { return cb.value; });
    var filteredBySeries = cachedFilteredList.filter(function(item) {
      return selectedSeries.indexOf(item.model.series) !== -1;
    });

    if (filteredBySeries.length === 0) {
      document.getElementById('modalModelList').innerHTML = 
        '<div class="warning-badge">' + t('resultNoMatchShort') + '</div>';
      return;
    }

    var html = '';
    filteredBySeries.forEach(function(item, idx) {
      var m = item.model;
      var fovEst = item.fovEst;
      var ppmDisplay = item.ppm !== null ? item.ppm.toFixed(2) : '— (C-Mount)';
      var ppmLevelDisplay = item.ppmLevel ? ' (' + item.ppmLevel + ')' : '';
      var fovStatus = fovEst ? t('resultFovStatus', fovEst.width + '×' + fovEst.height) : '🔧 C-Mount';
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
        '<div class="ppm-value-row"><span>' + t('resultPPM') + '：<span class="ppm-value-highlight">' + ppmDisplay + '</span>' + ppmLevelDisplay + '</span></div>' +
        '<div class="info-row">' +
          '<span class="info-tag">' + t('resultDist', m.workingDist.min + '-' + m.workingDist.max) + '</span>' +
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
    document.getElementById('top1Content').innerHTML = '<div class="empty-state">' + t('emptyState') + '</div>';
    document.getElementById('showModalBtn').disabled = true;

    // 绑定选型按钮
    document.getElementById('runBtn').addEventListener('click', runSelection);

    initModal();

    // 三次点击左上角 logo 跳转 db_editor.html
    var _logoClickCount = 0;
    var _logoClickTimer = null;
    var logoArea = document.querySelector('.logo-area');
    if (logoArea) {
      logoArea.style.cursor = 'pointer';
      logoArea.addEventListener('click', function() {
        _logoClickCount++;
        if (_logoClickTimer) clearTimeout(_logoClickTimer);
        if (_logoClickCount >= 3) {
          _logoClickCount = 0;
          window.location.href = 'db_editor.html';
          return;
        }
        _logoClickTimer = setTimeout(function() { _logoClickCount = 0; }, 600);
      });
    }

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
