/* sidebar.js — shared collapsible sidebar for all pages */
(function () {
  'use strict';

  const PAGES = [
    { id: 'dashboard', label: 'Dashboard',     href: '/',                   icon: 'home'   },
    { id: 'sketch',    label: 'Sketch',         href: '/sketch.html',         icon: 'canvas' },
    { id: 'browser',   label: 'Motif Browser',  href: '/motif_browser.html', icon: 'grid'   },
    { id: 'studio',    label: 'Motif Studio',   href: '/motif_studio.html',  icon: 'studio' },
    { id: 'viewer',    label: 'Motif Viewer',   href: '/motif_viewer.html',  icon: 'viewer' },
  ];

  const SVG = {
    home:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12L12 3l9 9"/><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>`,
    canvas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="3.5"/><line x1="12" y1="2" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="2" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="22" y2="12"/></svg>`,
    grid:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    studio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    viewer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="8" x2="21" y2="8"/><line x1="8" y1="3" x2="8" y2="8"/><line x1="8" y1="21" x2="8" y2="8"/></svg>`,
    saves: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
    chevD:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
    chevL:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
    chevR:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  };

  const W_OPEN = 220;
  const W_COLL = 52;

  const CSS = `
    :root { --sb-w: ${W_OPEN}px; --sb-wc: ${W_COLL}px; --sb-dur: 0.2s; }

    #_sb {
      position: fixed; top: 0; left: 0; bottom: 0;
      width: var(--sb-w);
      background: #12111c;
      border-right: 1px solid rgba(196,154,32,0.14);
      display: flex; flex-direction: column;
      transition: width var(--sb-dur) ease;
      z-index: 200;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
    }
    #_sb.collapsed { width: var(--sb-wc); }
    #_sb * { box-sizing: border-box; }

    /* header */
    ._sb-hd {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 12px 13px 14px;
      border-bottom: 1px solid rgba(196,154,32,0.09);
      flex-shrink: 0; min-height: 52px;
    }
    ._sb-logo {
      width: 26px; height: 26px; flex-shrink: 0;
      background: #c49a20; border-radius: 5px;
      display: flex; align-items: center; justify-content: center;
      color: #12111c; font-weight: 800; font-size: 12px; letter-spacing: 0;
    }
    ._sb-appname {
      flex: 1; font-size: 12px; font-weight: 600;
      color: #d4c8a8; letter-spacing: 0.03em;
      white-space: nowrap; overflow: hidden;
    }
    ._sb-toggle {
      flex-shrink: 0; width: 24px; height: 24px;
      background: none; border: none; cursor: pointer; padding: 0;
      color: #5a4a3a; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.12s, background 0.12s;
    }
    ._sb-toggle:hover { color: #c49a20; background: rgba(196,154,32,0.1); }
    ._sb-toggle svg { width: 15px; height: 15px; }

    /* nav */
    ._sb-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 6px 0; }
    ._sb-nav::-webkit-scrollbar { width: 3px; }
    ._sb-nav::-webkit-scrollbar-thumb { background: rgba(196,154,32,0.18); border-radius: 2px; }

    ._sb-link {
      display: flex; align-items: center; gap: 11px;
      padding: 9px 14px; text-decoration: none;
      color: #7a6a58; font-size: 12.5px; font-weight: 500;
      white-space: nowrap;
      border-left: 2px solid transparent;
      transition: color 0.12s, background 0.12s, border-color 0.12s;
    }
    ._sb-link:hover { color: #d4c8a8; background: rgba(255,255,255,0.04); }
    ._sb-link.active { color: #c49a20; border-left-color: #c49a20; background: rgba(196,154,32,0.08); }
    ._sb-link svg { width: 17px; height: 17px; flex-shrink: 0; }
    ._sb-lbl { overflow: hidden; text-overflow: ellipsis; }

    /* saved-motifs collapsible */
    ._sb-sec-hd {
      display: flex; align-items: center; gap: 11px;
      padding: 9px 14px;
      color: #5a4a3a; font-size: 12px; font-weight: 500;
      cursor: pointer; user-select: none; white-space: nowrap;
      transition: color 0.12s;
    }
    ._sb-sec-hd:hover { color: #d4c8a8; }
    ._sb-sec-hd svg { width: 17px; height: 17px; flex-shrink: 0; }
    ._sb-chev { margin-left: auto; transition: transform 0.2s; flex-shrink: 0; }
    ._sb-chev svg { width: 13px; height: 13px; }
    ._sb-open ._sb-chev { transform: rotate(180deg); }

    ._sb-motif-list { overflow: hidden; max-height: 0; transition: max-height 0.25s ease; }
    ._sb-open ._sb-motif-list { max-height: 500px; }

    ._sb-mitem {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 12px 6px 40px;
      color: #6a5840; font-size: 11.5px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      text-decoration: none;
      transition: color 0.1s, background 0.1s;
    }
    ._sb-mitem:hover { color: #d4c8a8; background: rgba(255,255,255,0.04); }
    ._sb-mname { overflow: hidden; text-overflow: ellipsis; }
    ._sb-empty { padding: 6px 12px 6px 40px; color: #3a2a18; font-size: 11.5px; font-style: italic; }

    /* footer */
    ._sb-ft {
      padding: 10px 14px;
      border-top: 1px solid rgba(196,154,32,0.09);
      font-size: 10px; color: #2e2418;
      white-space: nowrap; overflow: hidden; flex-shrink: 0;
    }

    /* hide labels when collapsed */
    #_sb.collapsed ._sb-appname,
    #_sb.collapsed ._sb-lbl,
    #_sb.collapsed ._sb-chev,
    #_sb.collapsed ._sb-ft,
    #_sb.collapsed ._sb-motif-list { display: none; }
    #_sb.collapsed ._sb-sec-hd ._sb-lbl { display: none; }

    /* body offset */
    body._sbody {
      padding-left: var(--sb-w) !important;
      transition: padding-left var(--sb-dur) ease;
    }
    body._sbody._scoll { padding-left: var(--sb-wc) !important; }
  `;

  function activeId() {
    const p = window.location.pathname;
    if (p === '/' || p.endsWith('/dashboard.html')) return 'dashboard';
    if (p.includes('motif_studio'))   return 'studio';
    if (p.includes('motif_viewer'))   return 'viewer';
    if (p.includes('motif_browser'))  return 'browser';
    if (p.includes('sketch.html'))     return 'sketch';
    return '';
  }

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const coll = localStorage.getItem('_sb_collapsed') === '1';
    const act  = activeId();

    const el = document.createElement('div');
    el.id = '_sb';
    if (coll) el.classList.add('collapsed');

    el.innerHTML = `
      <div class="_sb-hd">
        <div class="_sb-logo">M</div>
        <span class="_sb-appname">Motif Studio</span>
        <button class="_sb-toggle" id="_sb_tog" title="Toggle sidebar">${coll ? SVG.chevR : SVG.chevL}</button>
      </div>
      <nav class="_sb-nav">
        ${PAGES.map(p => `
          <a class="_sb-link${act === p.id ? ' active' : ''}" href="${p.href}">
            ${SVG[p.icon]}<span class="_sb-lbl">${p.label}</span>
          </a>`).join('')}
        <div id="_sb_saved">
          <div class="_sb-sec-hd" id="_sb_sec_hd">
            ${SVG.saves}<span class="_sb-lbl">Saved Sketches</span>
            <span class="_sb-chev">${SVG.chevD}</span>
          </div>
          <div class="_sb-motif-list" id="_sb_mlist">
            <div class="_sb-empty">Loading…</div>
          </div>
        </div>
      </nav>
      <div class="_sb-ft">p5 · Motif Studio</div>`;

    document.body.prepend(el);
    document.body.classList.add('_sbody');
    if (coll) document.body.classList.add('_scoll');

    document.getElementById('_sb_tog').addEventListener('click', () => {
      const now = el.classList.toggle('collapsed');
      document.body.classList.toggle('_scoll', now);
      localStorage.setItem('_sb_collapsed', now ? '1' : '0');
      document.getElementById('_sb_tog').innerHTML = now ? SVG.chevR : SVG.chevL;
      if (!now) loadMotifs(); // refresh list when expanding
    });

    document.getElementById('_sb_sec_hd').addEventListener('click', () => {
      document.getElementById('_sb_saved').classList.toggle('_sb-open');
    });

    loadMotifs();
  }

  async function loadMotifs() {
    const list = document.getElementById('_sb_mlist');
    if (!list) return;
    try {
      const { sketches } = await fetch('/api/sketches').then(r => r.json());
      if (!sketches.length) {
        list.innerHTML = '<div class="_sb-empty">No saves yet</div>';
        return;
      }
      list.innerHTML = sketches.map(s => `
        <a class="_sb-mitem" href="/sketch.html?s=saves/${encodeURIComponent(s.file)}" title="${s.file}">
          <span class="_sb-mname">${s.label}</span>
        </a>`).join('');
    } catch {
      list.innerHTML = '<div class="_sb-empty">—</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
