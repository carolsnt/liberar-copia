// Liberar Cópia — ISOLATED world script
// Roda no mundo isolado da extensão. Mexe no DOM (CSS, overlays, adoptedStyleSheets).

(() => {
  if (window.__liberarCopiaIsoLoaded) return;
  window.__liberarCopiaIsoLoaded = true;

  // 1) Injeta CSS de reforço (caso o insertCSS USER do background não tenha chegado ainda)
  function injectCSS() {
    if (document.getElementById('__liberar-copia-style')) return;
    const style = document.createElement('style');
    style.id = '__liberar-copia-style';
    style.textContent = `
      *, *::before, *::after {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }
  if (document.documentElement) injectCSS();
  else document.addEventListener('readystatechange', injectCSS, { once: true });

  // 2) Remove user-select:none de adoptedStyleSheets (Constructable Stylesheets)
  function purgeAdoptedStyleSheets(root) {
    try {
      if (!root || !('adoptedStyleSheets' in root)) return;
      const filtered = root.adoptedStyleSheets.filter(sheet => {
        try {
          for (const rule of sheet.cssRules) {
            if (/user-select\s*:\s*none/i.test(rule.cssText)) return false;
          }
        } catch { /* cross-origin sheet */ }
        return true;
      });
      if (filtered.length !== root.adoptedStyleSheets.length) {
        root.adoptedStyleSheets = filtered;
      }
    } catch {}
  }
  function purgeAll() {
    purgeAdoptedStyleSheets(document);
    document.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) purgeAdoptedStyleSheets(el.shadowRoot);
    });
  }

  // 3) Detecta overlays transparentes que capturam pointer-events
  function neutralizeBlockingOverlays() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const viewportArea = vw * vh;
    if (!viewportArea) return;
    const candidates = document.querySelectorAll('div, section, main, span, a');
    for (const el of candidates) {
      if (el.dataset.__lcChecked === '1') continue;
      try {
        const cs = getComputedStyle(el);
        if (cs.pointerEvents === 'none') continue;
        if (!['absolute', 'fixed', 'sticky'].includes(cs.position)) continue;
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area < viewportArea * 0.25) continue;
        // sem texto próprio relevante
        const text = (el.innerText || '').trim();
        if (text.length > 20) continue;
        // transparente OU z-index alto OU não tem filhos significativos
        const opacity = parseFloat(cs.opacity);
        const bg = cs.backgroundColor;
        const isTransparent = opacity < 0.05 || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
        const hasHighZ = parseInt(cs.zIndex, 10) >= 100;
        if (!isTransparent && !hasHighZ) continue;
        el.dataset.__lcChecked = '1';
        el.style.setProperty('pointer-events', 'none', 'important');
      } catch {}
    }
  }

  // 4) Remove atributos inline bloqueadores em elementos existentes e futuros
  const BLOCKING_ATTRS = ['oncopy', 'oncut', 'onpaste', 'onselectstart', 'oncontextmenu', 'ondragstart', 'onmousedown', 'unselectable'];
  function stripAttrs(root) {
    try {
      const all = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (const el of all) {
        for (const a of BLOCKING_ATTRS) {
          if (el.hasAttribute && el.hasAttribute(a)) el.removeAttribute(a);
        }
        if (el.style) {
          if (el.style.userSelect === 'none') el.style.userSelect = '';
          if (el.style.webkitUserSelect === 'none') el.style.webkitUserSelect = '';
        }
      }
    } catch {}
  }

  function fullSweep() {
    purgeAll();
    stripAttrs(document);
    neutralizeBlockingOverlays();
  }

  // Sweep inicial e periódico inicial (alguns sites instalam bloqueios após o load)
  fullSweep();
  const earlyTimer = setInterval(fullSweep, 500);
  setTimeout(() => clearInterval(earlyTimer), 5000);

  // MutationObserver focado: só atributos bloqueadores e novos nodes
  try {
    const mo = new MutationObserver((mutations) => {
      let needSweep = false;
      for (const m of mutations) {
        if (m.type === 'attributes') needSweep = true;
        if (m.addedNodes && m.addedNodes.length) needSweep = true;
      }
      if (needSweep) {
        purgeAll();
        stripAttrs(document);
      }
    });
    mo.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: BLOCKING_ATTRS.concat(['style', 'class'])
    });
  } catch {}

  // Re-checa overlays em interações
  window.addEventListener('mousedown', () => setTimeout(neutralizeBlockingOverlays, 0), true);
  window.addEventListener('scroll', () => { /* throttled */ if (!window.__lcScrollT) { window.__lcScrollT = setTimeout(() => { window.__lcScrollT = 0; neutralizeBlockingOverlays(); }, 250); } }, true);

  console.log('[Liberar Cópia] ativo neste documento.');
})();
