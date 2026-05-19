/* ── Shared Sidebar Component ── sidebar.js ───────────────────────
   使用方式（在 </head> 前）：
     <script>window.SIDEBAR_PAGE = 'archive';</script>
     <script src="sidebar.js" defer></script>
   SIDEBAR_PAGE 可選值：'home' | 'archive' | 'commission' | 'signal' | 'curio'
   自訂 footer：window.SIDEBAR_FOOTER = 'LINE 1<br>LINE 2';
   ──────────────────────────────────────────────────────────────── */

(function () {
  if (!window.SIDEBAR_PAGE) return; // 未設定則略過，不影響使用自訂邏輯的頁面

  const NAV = [
    { id: 'home',       en: 'HOME',       zh: '首頁',     icon: 'assets/icon/Home.png',        href: 'homepage_final.html' },
    { id: 'archive',    en: 'ARCHIVE',    zh: '作品集',   icon: 'assets/icon/File.png',        href: 'works_v3.html' },
    { id: 'commission', en: 'COMMISSION', zh: '委託',     icon: 'assets/icon/Pay.png',         href: 'commission.html' },
    { id: 'signal',     en: 'SIGNAL',     zh: 'SIGNAL',   icon: 'assets/icon/Comment.png',     href: 'signal.html' },
    { id: 'curio',      en: 'CURIO',      zh: '奇物陣列', icon: 'assets/icon/LittleWorld.png', href: 'curio.html' },
  ];

  function render() {
    const sb = document.getElementById('sidebar');
    if (!sb) return;

    const navHTML = NAV.map(n =>
      `<a class="ni${n.id === window.SIDEBAR_PAGE ? ' act' : ''}" href="${n.href}">` +
      `<img class="ni-icon" src="${n.icon}" alt="">` +
      `<div class="ni-text"><span class="ni-en">${n.en}</span><span class="ni-zh">${n.zh}</span></div>` +
      `</a>`
    ).join('');

    const footer = window.SIDEBAR_FOOTER || 'VTUBER · BACKEND<br>◇ 吳言 · WUYAN';

    sb.innerHTML =
      `<div class="sb-head">` +
        `<div class="sb-cat"><img src="assets/icon/Cat.png" alt=""></div>` +
        `<div class="sb-info">` +
          `<div class="sb-title">WUYAN'S ARCHIVE</div>` +
          `<div class="sb-sub">PORTFOLIO</div>` +
          `<div class="sb-pulse"><div class="sb-dot"></div><span class="sb-online">ONLINE</span></div>` +
        `</div>` +
      `</div>` +
      `<nav>${navHTML}</nav>` +
      `<div class="sb-footer"><div class="sb-footer-text">${footer}</div></div>`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
