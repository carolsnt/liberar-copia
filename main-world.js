// Liberar Cópia — MAIN world script
// Roda no mundo principal da página (acessa as APIs reais do site).
// Carregado em document_start para interceptar listeners ANTES do site registrar os dele.

(() => {
  if (window.__liberarCopiaMainLoaded) return;
  window.__liberarCopiaMainLoaded = true;

  const BLOCKED_EVENTS = new Set([
    'selectstart',
    'select',
    'copy',
    'cut',
    'beforecopy',
    'beforecut',
    'contextmenu',
    'dragstart',
    'mousedown',
    'mouseup'
  ]);

  // 1) Envolve addEventListener: para eventos bloqueados, neutraliza preventDefault/stopPropagation
  const origAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, opts) {
    if (typeof type === 'string' && BLOCKED_EVENTS.has(type.toLowerCase()) && typeof listener === 'function') {
      const wrapped = function (event) {
        // Para mousedown/mouseup, só neutralizamos se o alvo NÃO é um input/textarea
        // (assim não quebramos drag-and-drop de UI legítima).
        const t = event.target;
        const tag = (t && t.tagName) ? t.tagName.toLowerCase() : '';
        const isFormField = tag === 'input' || tag === 'textarea' || tag === 'select' || (t && t.isContentEditable);
        if (!isFormField) {
          try {
            event.preventDefault = function () {};
            event.stopPropagation = function () {};
            event.stopImmediatePropagation = function () {};
            Object.defineProperty(event, 'defaultPrevented', { configurable: true, get: () => false });
            Object.defineProperty(event, 'returnValue', { configurable: true, get: () => true, set: () => {} });
          } catch {}
        }
        try { return listener.apply(this, arguments); }
        catch (e) { /* não propaga erros do site */ }
      };
      try { return origAdd.call(this, type, wrapped, opts); }
      catch { return origAdd.call(this, type, listener, opts); }
    }
    return origAdd.call(this, type, listener, opts);
  };

  // 2) Neutraliza handlers inline (oncopy, onselectstart, etc.)
  const targets = [Document.prototype, HTMLElement.prototype, Window.prototype];
  for (const evt of BLOCKED_EVENTS) {
    const prop = 'on' + evt;
    for (const proto of targets) {
      try {
        Object.defineProperty(proto, prop, {
          configurable: true,
          get() { return null; },
          set() { /* ignora */ }
        });
      } catch {}
    }
  }

  // 3) Bloqueia limpeza forçada de seleção (selectionchange -> removeAllRanges)
  try {
    const origRemove = Selection.prototype.removeAllRanges;
    let userInteractingUntil = 0;
    const markUser = () => { userInteractingUntil = Date.now() + 1500; };
    origAdd.call(document, 'mousedown', markUser, true);
    origAdd.call(document, 'mousemove', () => { if (window.getSelection && window.getSelection().toString()) markUser(); }, true);
    origAdd.call(document, 'keydown', (e) => {
      // qualquer atalho com Ctrl/Cmd ou shift+seta indica interação do usuário
      if (e.ctrlKey || e.metaKey || e.shiftKey) markUser();
    }, true);
    Selection.prototype.removeAllRanges = function () {
      if (Date.now() < userInteractingUntil) return; // ignora limpezas durante interação
      return origRemove.apply(this, arguments);
    };
  } catch {}

  // 4) Garante que clipboard API não seja sequestrada
  try {
    if (navigator.clipboard) {
      const cb = navigator.clipboard;
      const origWrite = cb.writeText && cb.writeText.bind(cb);
      if (origWrite) {
        Object.defineProperty(navigator.clipboard, 'writeText', {
          configurable: true,
          value: (txt) => origWrite(txt)
        });
      }
    }
  } catch {}

  // 5) document.onkeydown / onkeyup ignoram Ctrl+C, Ctrl+X, Ctrl+A
  const KEY_EVENTS = ['keydown', 'keyup', 'keypress'];
  const origAdd2 = origAdd;
  for (const proto of [Document.prototype, HTMLElement.prototype, Window.prototype]) {
    for (const k of KEY_EVENTS) {
      try {
        Object.defineProperty(proto, 'on' + k, {
          configurable: true,
          get() { return this['__lc_' + k] || null; },
          set(fn) {
            this['__lc_' + k] = (typeof fn === 'function') ? function (e) {
              if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'a', 'v', 'p', 'C', 'X', 'A', 'V', 'P'].includes(e.key)) {
                return; // ignora completamente o handler do site para esses atalhos
              }
              return fn.apply(this, arguments);
            } : fn;
          }
        });
      } catch {}
    }
  }

  // Sinaliza prontidão para o mundo isolado (via CustomEvent)
  try { document.dispatchEvent(new CustomEvent('__liberarCopiaReady')); } catch {}
})();
