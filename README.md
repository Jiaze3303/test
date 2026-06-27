# HIKROBOT 读码器选型工具 V3.0

海康机器人读码器（Code Reader）智能选型 / 竞品对标 / 配单生成 / 基线-经销对照查询工具，纯前端实现，无需服务器，双击 `index.html` 即可在浏览器中打开使用。

---

## 目录结构

```
hik/
├── index.html              # 主页面，包含四个功能页签
├── db_editor.html           # 数据库编辑器（可视化编辑全部数据文件）
├── style.css                # 全局样式（含 PC 端 / 移动端响应式）
├── code-type-desc.png        # 码制类型说明图（选型页用，缺失时自动用占位 SVG 兜底）
└── js/
    ├── app.js                 # 智能选型模块：导航切换 + PPM/视野计算逻辑
    ├── bom.js                  # 配单表模块：型号树、选配件弹窗、自动生成配单、导出 CSV
    ├── mapping_module.js        # 基线-经销对照表模块：搜索/筛选/分组折叠
    └── data/
        ├── product_db.js         # 读码器产品数据库（PRODUCT_DB，供 app.js 选型用）
        ├── competitor.js          # 竞品对标数据：39 条品牌对标记录
        ├── peidan.js             # 配单数据源：型号 + 标配/选配配件清单（按 productModel 维度）
        └── mapping.js            # 对照表数据源：424 条基线↔经销型号映射（41 个系列）
```

> 也提供了一个独立的**配单数据编辑器** `peidan_editor.html`（导出/导入 `peidan.js` 格式），用于后续在不写代码的情况下更新配单数据。

---

## 四个功能页签

| 页签 | 功能 |
|---|---|
| ⚡ 智能选型 | 输入码制类型、模块尺寸、工作距离、视野宽高，自动计算 PPM 并从 `PRODUCT_DB` 中推荐最佳型号，支持查看所有满足条件的型号清单（含系列筛选） |
| 🔬 竞品对标 | 39 条友商（Cognex/Keyence/Datalogic/思谋/华睿/视界/新大陆）型号与海康对应型号的对标信息，支持关键词搜索（自动忽略 `MV-` 前缀及大小写）、品牌筛选、卡片展开/收起 |
| 📋 配单表 | 选择产品大类 → 系列 → 具体型号后自动生成配单（含全部标配），选配配件按大类分组、点击弹窗勾选；支持导出 CSV |
| 🔄 对照表 | 424 条基线型号↔经销型号的物料代码对照，按系列分组折叠显示，支持型号名称/物料代码混合搜索 |

---

## 数据更新指南

### 1. 更新配单数据（`js/data/peidan.js`）

格式：

```js
window.PEIDAN_DATA = {
  "modelList": [
    {
      "productCategory": "ID800 工业读码器",
      "productSeries": "ID800",
      "productModel": "MV-ID803M-03S-WBN/WBP-SR-U(线)",
      "standardAccessories": [
        { "name": "U 口线缆", "code": "101523961", "detail": "..." }
      ],
      "optionalAccessories": [
        { "category": "线缆", "name": "串口线缆", "code": "101523962", "detail": "..." }
      ]
    }
  ]
};
if (window.BOM && window.BOM.applyData) { window.BOM.applyData(window.PEIDAN_DATA); }
```

- 每个 `productModel` 的标配 / 选配相互独立，互不影响其他型号
- `optionalAccessories` 的 `category` 字段决定配单页左侧"选装配件"按哪些大类分组展示（如「线缆」「电源」「安装」，留空则归入「其他」）
- **推荐用 `peidan_editor.html` 编辑后导出**，自动生成正确格式，避免手写 JSON 出错
- 改完后直接刷新 `index.html`，配单表会自动加载新数据（无需服务器，纯 `<script>` 标签加载，兼容 `file://` 本地打开）

### 2. 更新对照表数据（`js/data/mapping.js`）

格式：

```js
window.MAPPING_DATA = [
  { cat: '系列名', seq: 1, baseName: '基线型号', baseCode: '物料代码', distName: '经销型号', distCode: '物料代码' },
  ...
];
if (window.MAPPING && window.MAPPING.applyData) { window.MAPPING.applyData(window.MAPPING_DATA); }
```

- `cat` 相同的记录会被自动分组为一个可折叠的系列
- 没有对应经销型号/代码的字段留空字符串 `''` 即可，页面会显示 `—`

### 3. 更新竞品数据（`js/competitor.js`）

直接编辑文件顶部的 `competitorDB` 数组，每条记录格式：

```js
{ brand: "Cognex", model: "DM70 / DM80", competitorDesc: "...", hikModel: "ID2013EMI", advantageDesc: "..." }
```

### 4. 更新选型产品库（`js/product_db.js`）

每个型号需包含 `model`、`series`、`resolution {w,h}`、`workingDist {min,max}`、`interface`、`protection`，C-Mount 型号无 `focal`/`pixelSize` 字段（不参与 PPM/视野计算，仅按分辨率和工作距离打分）。

---

## 技术实现要点

- **纯前端、零依赖**：不需要 Node / 构建工具 / 服务器，所有数据通过 `<script>` 标签以 `window.XXX_DATA` 全局变量形式注入，规避了 `file://` 协议下 `fetch()` 被浏览器拦截的限制
- **响应式适配**：`style.css` 内置 `@media (max-width: 768px)` 完整移动端布局，桌面端为左右分栏，移动端改为底部 Tab 栏 + 整页统一滚动（避免内层嵌套滚动导致的触摸冲突）
- **配单页选配交互**：选配配件按 `category` 分组为可点击卡片，点击后弹出 Modal 勾选，避免配件项过多时挤占界面空间
- **对照表/竞品搜索**：统一做了 `MV-` 前缀剥离 + 大小写归一化，保证 `MV-ID3013` 与 `id3013` 搜索结果一致
- **样式一致性**：所有页面统一 12px 外边距 + 10px 圆角卡片设计，搜索框/筛选框统一 38px 高度

---

## 已知限制

- `PRODUCT_DB`、`competitorDB` 目前为静态内置数据，更新需直接编辑对应 `.js` 文件（无可视化编辑器）
- 选型计算结果仅供参考，建议实测验证（页面右上角已标注）
- 对照表数据从原始 `.xls`（BIFF8 二进制格式）解析而来，如后续仍用此格式导出，需用专门脚本重新提取 SST 字符串表（含 CONTINUE 记录跨段处理），不能直接用标准 Excel 库读取

---

## 版本

V3.0 · 最后更新 2026-06-21
