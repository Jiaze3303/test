/**
 * 竞品分析模块
 * 依赖：index.html 中 id="page-competitor" 页面结构
 */

(function() {
  'use strict';

  // ─── i18n 辅助 ───
  function _t(key, n) {
    if (window._i18n && window._i18n.t) return window._i18n.t(key, n);
    return key;
  }

  // ======================= 竞品数据库 =======================
  var competitorDB = [
    { brand: "Cognex", model: "DM70 / DM80", competitorDesc: "DM70:0.36/1.2MP 算法分为S/QL/Q；DM80:1.6MP液态对焦，支持HDR，紧凑小型化", hikModel: "ID2013EMI", advantageDesc: "超高性价比，IO接口更丰富（2入2出），算法性能无差别对标Q系列，工业协议标配，光源颜色可选多" },
    { brand: "Cognex", model: "DM150 / DM260", competitorDesc: "0.36/1.2MP支持液态对焦，算法分S/QL/Q/X，USB或PoE，尾部旋转出线", hikModel: "ID2000M / ID2023XM", advantageDesc: "最大1.6MP分辨率完全对标，无级调焦更灵活；液态对焦场景可用ID2023XM应对，一体化线缆安装便捷" },
    { brand: "Cognex", model: "DM280 / DM290", competitorDesc: "DM280:1.6MP手动/液态/C口，HDR；DM290:AI增强型1.6MP三路多重照明，AI滤镜", hikModel: "ID2023XM", advantageDesc: "超高性价比，高度集成线缆，支持机械/液态调焦，疑难码场景算法性能更优，提供旋转尾部出线" },
    { brand: "Cognex", model: "DM370", competitorDesc: "3.1/5MP，液态/C口，HDR技术，HPIL/HPIT高亮配件，工业场景顶尖配置", hikModel: "ID3050PM / ID5050XM", advantageDesc: "高性价比，集成线缆体积小巧；爆闪/高亮场景可用ID5050XM应对，支持多色光源选择" },
    { brand: "Cognex", model: "DM470", competitorDesc: "高端型号3.1/5MP，HDR+，Xpand视野扩展技术，HPIT高功率光源", hikModel: "ID5000M系列", advantageDesc: "海康最大25MP分辨率型号丰富，C口镜头灵活性更高，超高性价比可单台替换多台竞品" },
    { brand: "Cognex", model: "DM390", competitorDesc: "AI增强型，3.1/5MP，液态/C口，HDR+，AI滤镜，主要处理高速大视野疑难码", hikModel: "ID5050M", advantageDesc: "高性价比，机械镜头兼顾易用性和成本，爆闪/高亮需求可用ID5050XM应对，一体化方案灵活" },
    { brand: "Cognex", model: "DM380", competitorDesc: "超大分辨率8/12/16MP，C口，HDR+AI定位条码，面向物流/轮胎大视野场景", hikModel: "ID5120/ID5200/ID5250", advantageDesc: "海康分辨率最大25MP覆盖更广，超高性能价格优势明显，爆闪场景可用ID5120XM应对" },
    { brand: "Keyence", model: "SR-700 / SR-750", competitorDesc: "SR-700最小型0.36MP三款工作距；SR-750紧凑型0.36MP六种工作距，光源配件较少", hikModel: "ID2000M系列", advantageDesc: "最大1.6MP，无级调焦应用更灵活，提供长焦/偏振/YAG型号，一体化线缆集成度高" },
    { brand: "Keyence", model: "SR-1000", competitorDesc: "1.3MP自动对焦，4颗红光，偏光滤镜，双核，一键调参易用性标杆", hikModel: "ID3013PM", advantageDesc: "性价比极高，支持红白蓝红外紫外多色光源，一体化线缆，算法性能同梯度，国产替代首选" },
    { brand: "Keyence", model: "SR-2000", competitorDesc: "3.1MP自动对焦，14颗红光，三核处理器，大视野大景深/极小码场景", hikModel: "ID3050PM / ID5050M", advantageDesc: "超高性价比，光源/配件灵活搭配，疑难码读取能力不输竞品，型号选择更丰富" },
    { brand: "Keyence", model: "SR-X300", competitorDesc: "2.3MP六核，三路多重照明，SR-X Drive算法，AI滤镜，超小型一体化机身", hikModel: "ID3030XM / ID3050XM", advantageDesc: "性能完全对标，配件更丰富(扩散/偏振/高亮)，价格优势明显，支持机械/液态多种调焦" },
    { brand: "Keyence", model: "SR-X100", competitorDesc: "1.4MP五核，体积小巧，SR-1000升级款，不支持高级照明", hikModel: "ID3016XM", advantageDesc: "性价比高，旋转连接器安装灵活，支持扩散照明及多种镜头选配，交付周期短" },
    { brand: "Keyence", model: "SR-X80", competitorDesc: "0.8MP低价对ID3000系列，食品医药行业，光源功能简化", hikModel: "ID2023XM", advantageDesc: "整体性能更优，一体化线缆，机械/液态调焦覆盖更广工作距，光源分控独立" },
    { brand: "Keyence", model: "SR-5000系列", competitorDesc: "5/8.9/16.8MP，一体化光源(48~192LED)，面向物流/汽车大视野", hikModel: "ID5000M / ID5000XM", advantageDesc: "最大25MP超高性价比，C口镜头方案灵活性高，支持外置高亮光源，安装空间要求更低" },
    { brand: "Datalogic", model: "Matrix 100", competitorDesc: "1MP入门级标准工作距，单颗红光LED照明，蓝点瞄准", hikModel: "ID813M", advantageDesc: "基本功能完全对标，体积小巧，十字激光瞄准更直观，提供偏振/网口/宽温型号" },
    { brand: "Datalogic", model: "Matrix 120", competitorDesc: "0.3/1.2MP，手动无级调焦，2颗LED白光，可选偏光", hikModel: "ID2000M", advantageDesc: "光学照明设计更优(多颗LED/分控)，复杂码识别能力不弱于竞品，IP65防护更耐用" },
    { brand: "Datalogic", model: "Matrix 220", competitorDesc: "1.2MP液态调焦，一体化DPM照明(全透/偏振/漫射)，XAI升级AI解码", hikModel: "ID2023XM / ID3013PM", advantageDesc: "ID2023XM突出性价比和体积小巧；ID3013PM疑难码解码能力更强，配件覆盖面更广" },
    { brand: "Datalogic", model: "Matrix 320 (2MP)", competitorDesc: "2MP液态/C口，14/36颗LED灯珠，360°多色反馈，90°弯折结构", hikModel: "ID3050PM", advantageDesc: "分辨率更大，算法性能强，性价比高；爆闪/大景深场景可用ID5050XM应对，集成度更优" },
    { brand: "Datalogic", model: "Matrix 320 (5MP)", competitorDesc: "5MP C口，36/72颗一体化光源，多色反馈", hikModel: "ID5060M / ID5050XM", advantageDesc: "ID5060M性价比高，性能完全对标；一体化高亮需求可用ID5050XM搭配高亮光源实现" },
    { brand: "Datalogic", model: "AV500 / AV900", competitorDesc: "物流面阵5/9MP，32fps动态聚焦，PackTrack专利技术", hikModel: "ID5000M", advantageDesc: "算法能力强，分辨率更大(可达25MP)，C口镜头+配件选择多，超高性价比替换方案" },
    { brand: "思谋", model: "VS600", competitorDesc: "1MP极小型，大景深定焦，红/白光，偏振选件，2路非隔离IO", hikModel: "ID2013EMI", advantageDesc: "整体性能更优，软件功能更全，光源分控且两入两出光耦隔离，通用性强，提供侧出线型号" },
    { brand: "思谋", model: "VS800P / VS900", competitorDesc: "1.4MP手动/液态对焦，红/白光，勾光罩/放大镜配件", hikModel: "ID2016M / ID2023XM", advantageDesc: "性能更优，光源/焦距选择更多，提供YAG/U口型号；液态需求用ID2023XM应对，一体化线缆" },
    { brand: "思谋", model: "VS1000P", competitorDesc: "1/2.3/5MP机械对焦，4组光源独立控制，蜂鸣器", hikModel: "ID2023XM / ID3060RM", advantageDesc: "一体化线缆走线方便，5MP高分辨率可用ID3060RM应对，光源/镜头灵活搭配，性价比高" },
    { brand: "思谋", model: "VS2000P", competitorDesc: "2.3/5/20MP液态/C口，TOF测距，16/34LED", hikModel: "ID5060M / ID5200M", advantageDesc: "最大25MP分辨率覆盖更广，一体化需求可配爆闪光源，算法性能和软件稳定性更优" },
    { brand: "华睿", model: "R3000", competitorDesc: "0.4/1.3/1.6MP紧凑型，定焦/手动，红/白/双色", hikModel: "ID2013EMI", advantageDesc: "整体性能优，软件易用性更高，IO接口更丰富，支持蜂鸣器，长焦场景可用ID2000M应对" },
    { brand: "华睿", model: "R4000", competitorDesc: "1.3MP，3路多重照明(全透/偏振/扩散)，可旋转接口", hikModel: "ID2023XM", advantageDesc: "算法同梯度，性价比高，体积小巧，扩散光源可搭配扩散罩，提供液态/机械多种对焦" },
    { brand: "华睿", model: "R5000", competitorDesc: "1.3~6MP多色光源独立控制，新款体积优化", hikModel: "ID2023XM / ID3060RM", advantageDesc: "液态对焦一体化线缆，高分辨率(5/6MP)用ID3060RM应对，光源/配件选择更丰富" },
    { brand: "华睿", model: "R7000", competitorDesc: "20/25MP超大分辨率，C口，深度学习", hikModel: "ID5200M", advantageDesc: "整体性能更优，软件功能全面，ID6000EM可应对低价竞争，长期稳定性验证" },
    { brand: "视界", model: "ICW 61/62", competitorDesc: "0.3MP经济款，高亮红/蓝/白光，ROI解码", hikModel: "ID803M", advantageDesc: "体积更小巧，多一路可配置IO，瞄准灯标配，网口协议齐全" },
    { brand: "视界", model: "ICW 64E", competitorDesc: "1MP，8颗高亮光源，Aimer点，RJ45网口", hikModel: "ID813M", advantageDesc: "体积更小巧，提供U口/串口多种选择，IO可配置性更强" },
    { brand: "视界", model: "ICW 72", competitorDesc: "1MP，高亮红/蓝/白，80/120/200mm对焦，ESD防护", hikModel: "ID2013EMI", advantageDesc: "光源分控独立，3mm侧出线型号灵活，通用性强，支持偏振选件" },
    { brand: "视界", model: "ICW 74EP AI", competitorDesc: "1.3/2.3/5MP液态镜头双核，Vericode支持", hikModel: "ID2023XM", advantageDesc: "体积小巧，2.3MP/液态需求完全应对，IO输出更丰富，支持多色光源" },
    { brand: "视界", model: "ICW 76P", competitorDesc: "1.3/2.3/5MP，28颗双色光源，动态读取6m/s", hikModel: "ID3000XM", advantageDesc: "更高读取速度(10m/s)，IO接口3入3出更丰富，配件涵盖偏振/扩散，性价比胜出" },
    { brand: "新大陆", model: "FM415 / NVF200", competitorDesc: "0.3/1MP经济款固定焦距，单颗白光照明", hikModel: "ID803M / ID813M", advantageDesc: "整体性能更优，支持网口协议及工业IO，1入1出1可配，提供多种焦距选择" },
    { brand: "新大陆", model: "NVF230 AI", competitorDesc: "1MP，十字激光，扩散罩/放大镜配件", hikModel: "ID2013EMI", advantageDesc: "光源分控，2入2出光耦隔离，通用性强，支持红白蓝多色光源" },
    { brand: "新大陆", model: "Soldier100/160", competitorDesc: "0.36/1.2MP，20颗环形/单颗白色光源", hikModel: "ID2013EMI", advantageDesc: "算法同梯度，一体化线缆，性价比高，长焦/偏振型号可选" },
    { brand: "新大陆", model: "Soldier180 AI", competitorDesc: "1.2/2MP半偏照明，多色可选，AI读码", hikModel: "ID2023XM", advantageDesc: "体积小巧，镜头/对焦方式选择性多，提供U口/串口/网口，高度集成线缆" },
    { brand: "新大陆", model: "Soldier300", competitorDesc: "2.3/5MP液态对焦，14颗半偏照明，OCR功能", hikModel: "ID2023XM / ID3060RM", advantageDesc: "3入3出IO更丰富，一体化线缆，软件功能全，5MP型号用ID3060RM应对" },
    { brand: "新大陆", model: "NVF800", competitorDesc: "1MP AI手动对焦，半偏照明，视场角42°/27°", hikModel: "ID2023XM", advantageDesc: "疑难码性能更优，自动对焦灵活，2入2出接口，性价比优势显著" }
  ];

  var currentDisplayData = competitorDB.slice();
  var allCardsExpanded = false;

  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .replace(/^mv-?/i, '')       // 去掉 MV- 前缀
      .replace(/[\s\-_\/]+/g, '') // 去掉空格、横线、下划线、斜杠
      .replace(/^id/i, 'id');      // 统一 ID 大小写
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  }

  function autoFilter() {
    var brand = document.getElementById('cpBrandSelect').value;
    var kw = normalize(document.getElementById('cpSearchInput').value.trim());
    var filtered = competitorDB.filter(function(item) {
      var brandOK = (brand === 'all') || (item.brand === brand);
      var kwOK = !kw ||
        normalize(item.brand + ' ' + item.model + ' ' + item.competitorDesc).indexOf(kw) !== -1 ||
        normalize(item.hikModel).indexOf(kw) !== -1;
      return brandOK && kwOK;
    });
    currentDisplayData = filtered;
    renderCardList();
  }

  function renderCardList() {
    var resultArea = document.getElementById('cpResultArea');
    var statsMsg = document.getElementById('cpStatsMsg');
    var expandBtn = document.getElementById('cpExpandAllBtn');

    if (!resultArea) return;

    if (currentDisplayData.length === 0) {
      resultArea.innerHTML = '<div class="cp-empty">😔 ' + _t('cpNoMatch') + '<br><span>' + _t('cpNoMatchHint') + '</span></div>';
      if (statsMsg) statsMsg.textContent = _t('cpStats', 0);
      return;
    }

    var html = '<div class="cp-grid">';
    currentDisplayData.forEach(function(item, idx) {
      var cardId = 'cpcard_' + idx;
      var isOpen = allCardsExpanded;
      html += '<div class="cp-card">' +
        '<div class="cp-card-header" data-card="' + cardId + '">' +
          '<div class="cp-card-left">' +
            '<span class="cp-brand-tag">' + escapeHtml(item.brand) + '</span>' +
            '<span class="cp-model-name">' + escapeHtml(item.model) + '</span>' +
            '<span class="cp-hik-badge">🔗 ' + escapeHtml(item.hikModel) + '</span>' +
          '</div>' +
          '<span class="cp-expand-icon" id="icon_' + cardId + '">' + (isOpen ? '▼' : '▶') + '</span>' +
        '</div>' +
        '<div class="cp-card-detail' + (isOpen ? ' open' : '') + '" id="' + cardId + '">' +
          '<div class="cp-detail-row">' +
            '<div class="cp-detail-label competitor">📌 ' + _t('cpFeatLabel') + '</div>' +
            '<div class="cp-detail-value competitor-desc">' + escapeHtml(item.competitorDesc) + '</div>' +
          '</div>' +
          '<div class="cp-detail-row">' +
            '<div class="cp-detail-label advantage">✨ ' + _t('cpAdvLabel') + '</div>' +
            '<div class="cp-detail-value advantage-text">' + escapeHtml(item.advantageDesc) + '</div>' +
          '</div>' +
          '<div class="cp-detail-row last">' +
            '<div class="cp-detail-label">🎯 ' + _t('cpRecLabel') + '</div>' +
            '<div class="cp-detail-value"><strong class="cp-hik-model">' + escapeHtml(item.hikModel) + '</strong></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    resultArea.innerHTML = html;

    if (statsMsg) {
      statsMsg.textContent = _t('cpStats', currentDisplayData.length);
    }
    if (expandBtn) {
      expandBtn.textContent = allCardsExpanded ? _t('cpCollapse') : _t('cpExpand');
    }

    // 事件委托绑定展开/折叠
    resultArea.querySelectorAll('.cp-card-header').forEach(function(header) {
      header.addEventListener('click', function() {
        var cardId = header.dataset.card;
        var detail = document.getElementById(cardId);
        var icon = document.getElementById('icon_' + cardId);
        if (!detail) return;
        var isOpen = detail.classList.toggle('open');
        if (icon) icon.textContent = isOpen ? '▼' : '▶';
        if (allCardsExpanded && !isOpen) {
          allCardsExpanded = false;
          if (expandBtn) expandBtn.textContent = _t('cpExpand');
        }
      });
    });
  }

  function resetAll() {
    document.getElementById('cpSearchInput').value = '';
    document.getElementById('cpBrandSelect').value = 'all';
    allCardsExpanded = false;
    autoFilter();
  }

  function initCompetitor() {
    var searchInput = document.getElementById('cpSearchInput');
    var brandSelect = document.getElementById('cpBrandSelect');
    var expandBtn = document.getElementById('cpExpandAllBtn');

    if (!searchInput) return; // 页面未就绪

    searchInput.addEventListener('input', function() {
      allCardsExpanded = false;
      autoFilter();
    });
    brandSelect.addEventListener('change', function() {
      allCardsExpanded = false;
      autoFilter();
    });
    expandBtn.addEventListener('click', function() {
      allCardsExpanded = !allCardsExpanded;
      renderCardList();
    });

    resetAll();
    console.log('✅ 竞品分析模块初始化，共 ' + competitorDB.length + ' 条记录');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompetitor);
  } else {
    initCompetitor();
  }

  window.COMPETITOR = { reset: resetAll, getData: function() { return competitorDB; } };

})();
