# HIKROBOT 读码器选型工具 V3.1

海康机器人读码器（Code Reader）智能选型 / 竞品对标 / 配单生成 / 基线-经销对照查询工具。

纯前端实现，无需服务器，双击 `index.html` 即可在浏览器中打开使用。

---

## 目录结构

```
├── index.html                  # 主页面，包含四个功能页签
├── db_editor.html              # 数据库编辑器（可视化编辑全部数据文件）
├── code-type-desc.png          # 码制类型说明图（明亮模式）
├── code-t…dark.png             # 码制类型说明图（暗黑模式）
├── css/
│   └── style.css               # 全局样式（PC + 移动端响应式）
└── js/
    ├── app.js                  # 智能选型：导航切换 + PPM/视野计算 + i18n
    ├── bom.js                  # 配单表：型号树、选配件弹窗、自动生成配单、导出 CSV
    ├── mapping_module.js       # 对照表：搜索、筛选、分组折叠
    └── data/
        ├── product_db.js       # 选型产品数据库（PRODUCT_DB）
        ├── competitor.js       # 竞品对标数据（39 条）
        ├── peidan.js           # 配单数据（型号 + 标配/选配配件）
        └── mapping.js          # 对照表数据（424 条，41 个系列）
```

---

## 功能说明

### ⚡ 智能选型

输入码制类型（QR / Code39）、模块尺寸、工作距离、视野宽高，自动计算 PPM（Pixels Per Module），从产品库中推荐最佳型号。

- 2D 码 PPM 4-8 为优秀，1D 码 PPM 1.4-2 为优秀
- 综合评分：分辨率 + PPM + 工作距离 + 视野
- 支持查看所有满足条件的型号清单（可按系列筛选）
- SVG 示意图实时展示工作距离、视野、焦距
- 点击「开始智能选型」按钮带有 loading 动画反馈

### 🔬 竞品对标

39 条友商型号与海康对应型号的对标信息，覆盖 7 个品牌：

| 品牌 | 对标型号 |
|---|---|
| Cognex | DM70/80、DM150/260、DM280/290、DM370、DM470、DM380/390 |
| Keyence | SR-700/750、SR-1000、SR-2000、SR-X300/X100/X80、SR-5000 |
| Datalogic | Matrix 100/120/220/320、AV500/900 |
| 思谋 | VS600、VS800P/900、VS1000P、VS2000P |
| 华睿 | R3000、R4000、R5000、R7000 |
| 视界 | ICW 61/62/64E/72/74EP/76P |
| 新大陆 | FM415、NVF200/230/800、Soldier100/160/180/300 |

支持关键词搜索（自动忽略 `MV-` 前缀及大小写）、品牌筛选、卡片展开/收起。

### 📋 配单表

三级联动选型：**产品大类 → 产品系列 → 具体型号**

- 选定型号后自动生成 BOM（主机 + 全部标配）
- 选配配件按类别分组（线缆、电源、安装、光源等 16 类），点击弹窗勾选
- 支持导出 CSV、重置、删除单行
- 数据持久化到 localStorage

### 🔄 对照表

424 条基线型号 ↔ 经销型号的物料代码对照，按系列分组折叠显示。

- 基线 = 直销物料，经销 = 渠道物料
- 支持按型号名称、物料代码混合搜索
- 搜索时自动展开有结果的系列

---

## 数据库编辑器

`db_editor.html` 是一个独立的可视化编辑工具，支持编辑全部四种数据。

**打开方式**：双击直接打开，或在主页面 **连续点击左上角 logo 图标 3 次** 跳转。

| 标签 | 编辑内容 | 导出格式 |
|---|---|---|
| 📋 配单数据 | 产品大类/系列/型号、标配/选配配件 | `peidan.js` |
| 🔄 对照表 | 系列分类、基线/经销型号及代码 | `mapping.js` |
| 🔬 竞品对标 | 品牌、型号、友商特点、海康优势 | `competitor_data.js` |
| ⚡ 选型产品库 | 分辨率、焦距、像素尺寸、工作距离 | `product_db.js` |

功能：
- **自动加载**：打开即自动读取 `js/data/` 下全部 4 个数据文件，无需手动导入
- 导入 JS/JSON 文件、导出标准格式
- 新建/复制/删除条目、搜索筛选
- Ctrl+S 快捷保存
- 左上角「← 返回」按钮回到主页面

---

## 数据更新方式

### 方式一：使用编辑器（推荐）

1. 双击打开 `db_editor.html`（数据自动加载）
2. 在界面中编辑数据
3. 点击「导出」生成新的 `.js` 文件
4. 替换 `js/data/` 下的对应文件
5. 刷新 `index.html` 查看效果

### 方式二：直接编辑 JS 文件

所有数据文件通过 `<script>` 标签以全局变量形式加载，直接用文本编辑器修改后刷新 `index.html` 即可生效（兼容 `file://` 本地打开）。

各文件的数据格式如下：

**配单数据** `js/data/peidan.js`

```js
window.PEIDAN_DATA = {
  modelList: [
    {
      productCategory: "ID800 工业读码器",
      productSeries: "ID800",
      productModel: "MV-ID803M-U(基线)",
      standardAccessories: [
        { category: "大类", name: "U 口线缆", code: "101523961", detail: "10P10C转OPEN+USB-AM,2m" }
      ],
      optionalAccessories: [
        { category: "线缆", name: "串口线缆", code: "101523962", detail: "10P10C转OPEN+DB9F,1.5m" },
        { category: "电源", name: "电源适配器", code: "310100899", detail: "12V2A,AC100-240V" }
      ]
    }
  ]
};
```

- `standardAccessories`：标配，自动包含在配单中
- `optionalAccessories`：选配，用户手动勾选
- `category` 决定选配页的分组显示，支持 16 类：线缆、网线、电源线、电源、安装、安装板、镜头、测试镜头、镜头罩、光源、微码光源、爆闪光源、灯板、外置配件、大类、其他

**竞品数据** `js/data/competitor.js`

```js
var competitorDB = [
  {
    brand: "Cognex",
    model: "DM70 / DM80",
    competitorDesc: "DM70:0.36/1.2MP 算法分为S/QL/Q；DM80:1.6MP液态对焦",
    hikModel: "ID2013EMI",
    advantageDesc: "超高性价比，IO接口更丰富，算法性能无差别对标Q系列"
  }
];
```

**对照表** `js/data/mapping.js`

```js
window.MAPPING_DATA = [
  {
    cat: "ID803M系列",
    seq: 1,
    baseName: "MV-ID803M-03S",
    baseCode: "101523961",
    distName: "MV-ID803M-03S(经销)",
    distCode: "101523970"
  }
];
```

- `cat` 相同的记录自动分组为可折叠系列
- 无对应经销型号的字段留空 `""`

**选型产品库** `js/data/product_db.js`

```js
const PRODUCT_DB = [
  {
    model: "ID803M-03M",
    series: "ID800",
    resolution: { w: 640, h: 480 },
    pixelSize: 3.7,
    focal: 3.1,
    interface: "USB2.0、RS232、RJ45",
    protection: "IP54",
    workingDist: { min: 120, max: 120 }
  },
  {
    model: "ID3040RM-00C-12",
    series: "ID3000",
    resolution: { w: 2688, h: 1536 },
    pixelSize: 2,
    // C-Mount 型号无 focal，不参与 PPM/视野计算
    interface: "Fast Ethernet、RS232",
    protection: "IP67",
    workingDist: { min: 100, max: 2000 }
  }
];
```

- `focal` / `pixelSize`：C-Mount 型号可省略，仅按分辨率和工作距离打分
- `workingDist`：工作距离范围（mm）

---

## 功能特点

- **暗黑模式**：点击 🌙 按钮切换，自动持久化到 localStorage
- **中英文切换**：点击 EN/中 按钮切换界面语言，全部 UI 文本均支持双语
- **方案示意图暗黑适配**：SVG 示意图在暗黑模式下自动切换深色背景 + 浅色文字
- **码制说明图主题适配**：明亮/暗黑模式各有一张专属配色的码制说明图

---

## V3.1 更新内容

### 加载速度优化
- 移除 `Cache-Control: no-cache`，允许浏览器缓存静态资源
- 添加 `<link rel="preload">` 预加载关键数据文件（product_db.js、peidan.js）
- 调整 script 加载顺序：数据文件优先，模块在后，消除轮询等待
- 图片添加 `loading="lazy" decoding="async"` 延迟加载

### 过渡动画
- **页面切换**：Tab 切换时内容渐入 + 上滑动画（0.3s）
- **Tab 指示器**：弹性 scaleY 展开动画 + 按压微缩放反馈
- **Modal 弹窗**：回弹弹性动画（cubic-bezier 弹簧曲线）
- **列表项**：Modal 内列表项交错延迟渐入
- **按钮**：点击涟漪效果 + 选型按钮 loading spinner
- **卡片**：右侧面板卡片依次延迟渐入
- **配件弹窗**：毛玻璃背景 + 弹性弹出

### 全量中英文国际化
- 基于 `data-i18n` 属性机制，覆盖全部 UI 文本
- 包括：标题栏、导航、表单标签、SVG 文字、表格表头、弹窗、按钮、统计、提示信息
- 动态内容（PPM 等级、选型理由、配件统计等）均支持双语
- 子模块（bom.js、mapping_module.js、competitor.js）通过 `window._i18n` 接入

### 数据库编辑器增强
- 打开即自动加载全部 4 个数据文件，无需手动导入
- 左上角新增「← 返回」按钮回到主页面

### 快捷入口
- 主页面 **连续点击左上角 logo 图标 3 次**（600ms 内）跳转到数据库编辑器

### Bug 修复
- 修复 `mapping_module.js` 中 `reset` 函数未定义的引用错误
- 修复 HTML 中 `</body>` 后存在 `<script>` 标签的结构问题

---

## 技术特点

- **纯前端、零依赖**：不需要 Node / 构建工具 / 服务器，所有数据通过 `<script>` 标签注入
- **响应式适配**：桌面端左右分栏，移动端底部 Tab 栏 + 统一滚动
- **搜索归一化**：统一 `MV-` 前缀剥离 + 大小写不敏感
- **样式一致**：12px 外边距 + 10px 圆角卡片 + 38px 统一控件高度

---

## 版本

V3.1 · 最后更新 2026-06-28
