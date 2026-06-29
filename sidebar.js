/* ── Shared Sidebar Component ── sidebar.js ───────────────────────
   使用方式（在 </head> 前）：
     <script>window.SIDEBAR_PAGE = 'archive';</script>
     <script src="sidebar.js" defer></script>
   SIDEBAR_PAGE 可選值：'home' | 'archive' | 'commission' | 'signal' | 'curio'
   自訂 footer：window.SIDEBAR_FOOTER = 'LINE 1<br>LINE 2';
   ──────────────────────────────────────────────────────────────── */

(function () {
  if (!window.SIDEBAR_PAGE) return;

  const NAV = [
    { id: 'home',       en: 'HOME',       zh: '首頁',     icon: 'assets/icon/Home.png',        href: 'index.html' },
    {
      id: 'archive',    en: 'ARCHIVE',    zh: '作品集',   icon: 'assets/icon/File.png',        href: 'works_v3.html',
      children: [
        { en: 'ALL',          zh: '全部作品',  href: 'works_v3.html' },
        { en: 'THIS ARCHIVE', zh: '此網站',    href: 'project_archive.html' },
        { en: 'BOOKROOM',     zh: '魔法書房',  href: 'project_bookroom.html' },
        { en: 'PROJECT API',  zh: 'API 專案',  href: 'project_api.html' },
        { en: 'ILLUST',       zh: '插畫集',    href: 'project_illust.html' },
        { en: 'VTUBER',       zh: 'VTuber',    href: 'project_vtuber.html' },
      ]
    },
    { id: 'commission', en: 'COMMISSION', zh: '委託',     icon: 'assets/icon/Pay.png',         href: 'commission.html' },
    { id: 'signal',     en: 'SIGNAL',     zh: 'SIGNAL',   icon: 'assets/icon/Comment.png',     href: 'signal.html' },
    {
      id: 'curio',      en: 'CURIO',      zh: '奇物陣列', icon: 'assets/icon/LittleWorld.png', href: 'curio.html',
      children: [
        { en: 'DATA SEA',  zh: 'Data Sea',  href: 'project_datasea.html' },
        { en: 'TAROT',     zh: 'Tarot',     href: 'project_tarot.html' },
        { en: 'HOLOCARD',  zh: 'Holo Card', href: 'project_holocard.html' },
        { en: 'FIELD',     zh: '數域',      href: 'project_field.html' },
      ]
    },
  ];

  function buildItem(n) {
    const isAct = n.id === window.SIDEBAR_PAGE;
    const niClass = 'ni' + (isAct ? ' act' : '');

    if (n.children) {
      const subItems = n.children.map(c =>
        `<a class="ni-sub-item" href="${c.href}">` +
        `<span class="ni-sub-dot"></span>` +
        `<div class="ni-sub-text"><span class="ni-sub-en">${c.en}</span><span class="ni-sub-zh">${c.zh}</span></div>` +
        `</a>`
      ).join('');

      return `<div class="ni-wrap has-sub" data-id="${n.id}">` +
        `<a class="${niClass}" href="${n.href}">` +
        `<img class="ni-icon" src="${n.icon}" alt="">` +
        `<div class="ni-text"><span class="ni-en">${n.en}</span><span class="ni-zh">${n.zh}</span></div>` +
        `<span class="ni-chevron">›</span>` +
        `</a>` +
        `<div class="ni-sub"><div class="ni-sub-label">${n.en}</div>${subItems}</div>` +
        `</div>`;
    }

    return `<a class="${niClass}" href="${n.href}">` +
      `<img class="ni-icon" src="${n.icon}" alt="">` +
      `<div class="ni-text"><span class="ni-en">${n.en}</span><span class="ni-zh">${n.zh}</span></div>` +
      `</a>`;
  }

  /* Flyout logic — desktop: panels move to <body> as fixed flyout.
     Touch: panels stay inline, toggled by tap on parent item. */
  function initSubmenus() {
    const sidebar = document.getElementById('sidebar');
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    document.querySelectorAll('.ni-wrap.has-sub').forEach(wrap => {
      const panel = wrap.querySelector('.ni-sub');

      if (isTouch) {
        // Mobile: inline dropdown — panel stays in sidebar, toggled by click
        const link = wrap.querySelector('a.ni');
        link.addEventListener('click', e => {
          if (!panel.classList.contains('visible')) {
            e.preventDefault();
            // Close other open panels
            document.querySelectorAll('.ni-sub.visible').forEach(p => {
              if (p !== panel) p.classList.remove('visible');
            });
            panel.classList.add('visible');
          }
          // If already open: allow navigation (tap again = navigate to parent page)
        });
      } else {
        // Desktop: reparent to body so position:fixed is viewport-relative
        panel.style.position = 'fixed';
        document.body.appendChild(panel);

        let hideTimer = null;

        const show = () => {
          if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
          document.querySelectorAll('.ni-sub.visible').forEach(p => {
            if (p !== panel) p.classList.remove('visible');
          });
          const sbRect = sidebar.getBoundingClientRect();
          const wrapRect = wrap.getBoundingClientRect();
          panel.style.left = (sbRect.right - 1) + 'px';
          panel.style.top  = wrapRect.top + 'px';
          panel.classList.add('visible');
          sidebar.classList.add('sb-locked');
        };

        const hide = (delay = 200) => {
          hideTimer = setTimeout(() => {
            panel.classList.remove('visible');
            if (!document.querySelector('.ni-sub.visible')) {
              sidebar.classList.remove('sb-locked');
            }
            hideTimer = null;
          }, delay);
        };

        wrap.addEventListener('mouseenter', show);
        wrap.addEventListener('mouseleave', () => hide());
        panel.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
        panel.addEventListener('mouseleave', () => hide(0));
      }
    });
  }

  function render() {
    const sb = document.getElementById('sidebar');
    if (!sb) return;

    const navHTML = NAV.map(buildItem).join('');
    const footer = window.SIDEBAR_FOOTER || 'VTUBER · BACKEND<br>◇ 吳言 · WUYAN';

    sb.innerHTML =
      `<div class="sb-head">` +
        `<div class="sb-info">` +
          `<div class="sb-title">WUYAN'S ARCHIVE</div>` +
          `<div class="sb-sub">PORTFOLIO</div>` +
          `<div class="sb-pulse"><div class="sb-dot"></div><span class="sb-online">ONLINE</span></div>` +
        `</div>` +
      `</div>` +
      `<nav>${navHTML}</nav>` +
      `<div class="sb-footer"><div class="sb-footer-text">${footer}</div></div>`;

    initSubmenus();
  }

  function initTouchToggle() {
    const sb = document.getElementById('sidebar');
    if (!sb) return;
    // Only on touch-primary devices
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let startX = 0, startY = 0;
    sb.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    sb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      // Ignore swipes — only handle taps
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) return;
      // Only open when tapping the collapsed 16px strip (left screen edge)
      // The sidebar is translateX(calc(-100%+16px)), so only ~16px is visible.
      // Sidebar element still spans 220px in the fixed layer — restrict to first 20px.
      if (!sb.classList.contains('sb-open') && startX <= 20) {
        sb.classList.add('sb-open');
      }
      // When open: do nothing here so nav link taps navigate normally
    }, { passive: true });

    // Tap anywhere outside sidebar to close
    document.addEventListener('touchstart', e => {
      if (!sb.contains(e.target)) sb.classList.remove('sb-open');
    }, { passive: true });
  }

  const MOBILE_NAV = [
    { id: 'home',    en: 'HOME',    icon: 'assets/icon/Home.png',        href: 'index.html' },
    { id: 'archive', en: 'ARCHIVE', icon: 'assets/icon/File.png',        href: 'works_v3.html' },
    { id: 'curio',   en: 'CURIO',   icon: 'assets/icon/LittleWorld.png', href: 'curio.html' },
    { id: 'signal',  en: 'SIGNAL',  icon: 'assets/icon/Comment.png',     href: 'signal.html' },
  ];

  function renderMobileNav() {
    if (document.getElementById('mobile-nav')) return;
    const nav = document.createElement('nav');
    nav.id = 'mobile-nav';
    nav.setAttribute('aria-label', 'mobile navigation');
    nav.innerHTML = MOBILE_NAV.map(item =>
      `<a class="mn-item${item.id === window.SIDEBAR_PAGE ? ' mn-act' : ''}" href="${item.href}">` +
      `<img class="mn-icon" src="${item.icon}" alt="">` +
      `<span class="mn-label">${item.en}</span>` +
      `</a>`
    ).join('');
    document.body.appendChild(nav);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { render(); initTouchToggle(); renderMobileNav(); });
  } else {
    render();
    initTouchToggle();
    renderMobileNav();
  }
})();
