# HIKROBOT 读码器选型工具 V3.0

海康机器人读码器（Code Reader）智能选型 / 竞品对标 / 配单生成 / 基线-经销对照查询工具。

纯前端实现，无需服务器，双击 `index.html` 即可在浏览器中打开使用。

---

## 目录结构

```
├── index.html                  # 主页面，包含四个功能页签
├── db_editor.html              # 数据库编辑器（可视化编辑全部数据文件）
├── code-type-desc.png          # 码制类型说明图
├── css/
│   └── style.css               # 全局样式（PC + 移动端响应式）
└── js/
    ├── app.js                  # 智能选型：导航切换 + PPM/视野计算
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

`db_editor.html` 是一个独立的可视化编辑工具，支持编辑全部四种数据：

| 标签 | 编辑内容 | 导出格式 |
|---|---|---|
| 📋 配单数据 | 产品大类/系列/型号、标配/选配配件 | `peidan.js` |
| 🔄 对照表 | 系列分类、基线/经销型号及代码 | `mapping.js` |
| 🔬 竞品对标 | 品牌、型号、友商特点、海康优势 | `competitor_data.js` |
| ⚡ 选型产品库 | 分辨率、焦距、像素尺寸、工作距离 | `product_db.js` |

功能：导入 JS/JSON 文件、导出标准格式、新建/复制/删除条目、搜索筛选、Ctrl+S 快捷保存。

---

## 数据更新方式

### 方式一：使用编辑器（推荐）

1. 双击打开 `db_editor.html`
2. 点击「导入」加载对应的 `.js` 文件
3. 在界面中编辑数据
4. 点击「导出」生成新的 `.js` 文件
5. 替换 `js/data/` 下的对应文件
6. 刷新 `index.html` 查看效果

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
  { cat: "ID803M系列", seq: 1, baseName: "MV-ID803M-03S", baseCode: "101523961", distName: "MV-ID803M-03S(经销)", distCode: "101523970" }
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

## 技术特点

- **纯前端、零依赖**：不需要 Node / 构建工具 / 服务器，所有数据通过 `<script>` 标签注入
- **响应式适配**：桌面端左右分栏，移动端底部 Tab 栏 + 统一滚动
- **搜索归一化**：统一 `MV-` 前缀剥离 + 大小写不敏感
- **样式一致**：12px 外边距 + 10px 圆角卡片 + 38px 统一控件高度

---

## 版本

V3.0 · 最后更新 2026-06-27
