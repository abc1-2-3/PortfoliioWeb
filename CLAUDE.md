# WUYAN's Archive — 專案規格文件

## 專案概述

Wuyan 的個人作品集網站。**Wuyan 不寫前端程式碼，所有 HTML/CSS/JS 由 Claude 負責撰寫與維護。** 角色分工：Wuyan 提供設計方向、素材、文案；Claude 實作。

目前架構：純靜態 HTML，無 build system，無框架。每個頁面是一個獨立的 `.html` 單檔。

---

## 頁面清單

| 檔案 | 用途 | 狀態 |
|---|---|---|
| `homepage_final.html` | 首頁（房間場景、角色動畫） | 存在，未大改 |
| `works_v3.html` | 作品導覽頁（三個 Portal 入口） | 已更新配色 + sidebar |
| `project_bookroom.html` | 作品詳情：緣界串接・魔法書房 | 已完成 |
| `curio.html` | 奇物陣列：觀測庫（卡片列表） | 已完成 |
| `project_datasea.html` | 奇物系列：數樸之海 | 已完成 |
| `project_holocard.html` | 奇物系列：全息撲克牌 | 已完成 |
| `project_tarot.html` | 奇物系列：塔羅抽卡機 | 已完成 |
| `project_field.html` | 奇物系列：數域（整數3D觀測） | 已完成 |

---

## 雙層架構：主線作品集 vs 奇物陣列

### 主線作品集頁面（有 sidebar）
- 使用共用元件：`sidebar.css` + `sidebar.js`
- `<link rel="stylesheet" href="sidebar.css">` + `<script>window.SIDEBAR_PAGE = 'xxx';</script><script src="sidebar.js" defer></script>`
- SIDEBAR_PAGE 可選值：`'home' | 'archive' | 'commission' | 'signal' | 'curio'`
- 頁面有 `#sidebar`、`#shell`（grid 1fr）、自己的 topbar

### 奇物陣列系列頁面（**無 sidebar**）
- 頁面：`project_datasea` / `project_holocard` / `project_tarot` / `project_field`
- **不引入** sidebar.css / sidebar.js
- 有獨立 topnav（height 48px，fixed）格式統一：
  ```html
  <nav id="topnav">
    <div class="tnav-left">
      <a href="curio.html" class="tnav-back">← CURIO</a>
      <div class="tnav-sep"></div>
      <div class="tnav-brand">
        <span class="tnav-brand-mark">◆</span>
        <div class="tnav-brand-text">
          <div class="tnav-brand-en">PAGE NAME</div>
          <div class="tnav-brand-zh">中文名</div>
        </div>
      </div>
    </div>
  </nav>
  ```
- topnav CSS 核心：`background: rgba(~dark~ .90); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(167,139,250,.16); height: 48px;`
- 新增奇物頁面後需同步更新 `sidebar.js` 的 curio children 列表 + `curio.html` 的卡片列表（aside-rail + card-row）

---

## 設計系統

### 色彩

背景底色：`#04020e`（極深紫黑）

**三色點綴系統（粉 × 藍 × 金）：**
- 粉：`rgba(240,165,205,X)` 主 / `rgba(215,120,170,X)` 暗
- 藍：`rgba(165,215,255,X)` 主 / `rgba(120,190,240,X)` 暗
- 金：`#d4a84e` 主 / `#e8c880` 亮 / `#c09030` 暗（標題用）
- 紫（原底色保留，降權）：`rgba(180,140,255,X)`

文字可讀性基準：主文 opacity ≥ `.80`，次要文字 ≥ `.55`，標籤 ≥ `.42`

**星星顏色（JS 生成）：**
```js
const colors = ['#ffffff', 'rgba(255,185,215,1)', 'rgba(165,215,255,1)', 'rgba(255,220,140,1)'];
```

### 字體

- 內文、UI 標籤：`'Courier New', monospace`
- 大標題（中文）：`'Noto Serif TC', Georgia, serif` weight 200，漸層色依頁面主題決定
  - Google Fonts：`https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@200;300&display=swap`
- 金色標題漸層（bookroom 用，因頁面有暖黃元素）：`linear-gradient(135deg, #f5e8c2 0%, #e8c87a 18%, #d4a84e 38%, #c09030 52%, #d4a84e 66%, #e8c87a 82%, #f5e8c2 100%)`

### 游標

```css
#cursor-dot { background:#fff; box-shadow:0 0 8px rgba(255,180,220,.9) }
#cursor-ring { border:1px solid rgba(240,160,200,.4) }
body.hov #cursor-ring { border-color:rgba(240,160,205,.75); box-shadow:0 0 12px rgba(220,120,175,.22) }
```

---

## Sidebar 規格（各頁統一）

**行為：** 平時收縮至 16px 寬，靠近左邊展開，離開收回。**配色：紫色系（violet）**，與 works 頁 design-drafts 一致。

**導覽項目含三層：** `<img class="ni-icon">` + `.ni-en`（英文大寫）+ `.ni-zh`（中文）

```css
#sidebar {
  position: fixed; left:0; top:0; bottom:0; width:220px;
  background: rgba(7,5,15,.97);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(167,139,250,.22);
  z-index: 50;
  transform: translateX(calc(-100% + 16px));
  transition: transform .38s cubic-bezier(.25,.46,.45,.94), box-shadow .38s;
}
#sidebar:hover {
  transform: translateX(0);
  box-shadow: 4px 0 44px rgba(0,0,0,.75), 0 0 0 1px rgba(167,139,250,.1);
}
/* 收縮時的紫→藍光條提示 */
#sidebar::before {
  content:''; position:absolute; right:0; top:22%; bottom:22%; width:2px;
  background: linear-gradient(to bottom, transparent, rgba(167,139,250,.72) 40%, rgba(165,215,255,.58) 60%, transparent);
  transition: opacity .25s;
}
#sidebar:hover::before { opacity:0 }
/* 軌跡線（展開後可見）*/
#sidebar::after {
  content:''; position:absolute; left:36px; top:80px; bottom:80px; width:1.5px;
  background: linear-gradient(to bottom, transparent, rgba(167,139,250,.5) 20%, rgba(196,181,253,.85) 50%, rgba(167,139,250,.5) 80%, transparent);
  box-shadow: 0 0 6px rgba(167,139,250,.28);
}
```

`#shell` grid：`grid-template-columns: 1fr`（sidebar 不佔格）
主要內容 `grid-column: 1`

---

## Scene 互動區規格

```css
.scene-wrap {
  aspect-ratio: 2/1;
  min-height: 200px;
  max-height: clamp(260px, 44vh, 480px);
  overflow: hidden;
}
```
圖片用 `object-fit: cover; object-position: center top`

---

## Assets 清單

```
assets/
├── icon/                     ← 共用 UI 圖示（PNG，白底可用 filter:invert）
│   ├── Home / File / OverView / Detail / Mission / Comment / LittleWorld
│   ├── Experiment / Dot3 / Idea / Concept / Process / Code / Github / Rocket
│   ├── Backend / Frontend / Website / CrackedEgg / MagicWand / Live / Crown
│   ├── StarTalk / Reward / Pay / Link / Google / Lamp / Pen / Book / FillForm
│   ├── PaperAirplane / Unlocked / Gift / IntroductionTips / Cat
│   └── CrescentMoon / Star / Sun / Cloud / Cube / Multi-faceteddice / CircleExclamationMark / CircleQuestionMark
├── Dividers/                 ← 裝飾分隔線 Divider1~4.png（橫向，filter 可染色）
├── ClickHint/                ← 點擊提示圖 ClickHint1~5.png
├── DonationPagePic/          ← project_bookroom 用
│   ├── BGtransparentedges.webp
│   ├── BG.webp
│   ├── form.webp
│   ├── paper.webp
│   └── pen.webp
├── fullBGwebp/               ← homepage 用（房間場景分層）
│   ├── bg_room_dark_webp.webp / bg_room_webp.webp
│   ├── chair / character / lamp / light / middlescreen / screen_side 等
└── gif/
    ├── bg_room_web.gif
    └── character_breathing_web.gif
```

**Sidebar icon 對應慣例：**
- 頁面導覽：Home→Home, PROFILE→OverView, ARCHIVE→File, PROJECT→Detail, COMMISSION→Pay, SIGNAL→Comment, LAB→Experiment, OTHERS→Dot3
- 作品分類（rail）：ALL→Crown, VTUBER→Live, WEB→Website, PAYMENT→Pay, AI·BOT→Code, ILLUST→Pen, OTHERS→Experiment

新頁面素材建議放 `assets/[頁面名稱]/`

---

## 引入 Claude Design 生成頁面的流程

Claude Design 可能輸出 HTML / JSX / CSS / JS。

- **目前專案（純 HTML）**：只能直接用 HTML 版本；JSX 需要我轉換為 vanilla JS
- 做法：整包原封不動丟進 `design-drafts/[頁面名稱]/`，告訴我哪一頁要整合，我負責轉換並套入現有設計語言（sidebar、配色、字體等）
- 如果未來頁面增多、元件重複率高，考慮升級至 Vite + React，屆時 JSX 可直接使用

---

## 新增頁面 Checklist

新 project detail 頁面需包含：
- [ ] Google Fonts link（Noto Serif TC）
- [ ] 統一游標 CSS + JS
- [ ] 彩色星星 JS（4色混合）
- [ ] Sidebar（fixed，收縮行為）
- [ ] `#shell` grid 為 `1fr`
- [ ] Topbar（sticky，粉色點綴邊框）
- [ ] 標題用 Noto Serif TC 200 + 金色漸層
- [ ] Scene wrap 用 aspect-ratio
