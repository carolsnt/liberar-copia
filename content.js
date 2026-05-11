(() => {

  console.log("✔️ Liberar Cópia ativo");

  // =========================
  // BLOQUEIA listeners anti-cópia
  // =========================

  const blockedEvents = [
    "copy",
    "cut",
    "paste",
    "contextmenu",
    "selectstart",
    "mousedown",
    "mouseup",
    "keydown"
  ];

  const originalAddEventListener =
    EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function(
    type,
    listener,
    options
  ) {

    if (blockedEvents.includes(type)) {
      console.log("🚫 Evento bloqueado:", type);
      return;
    }

    return originalAddEventListener.call(
      this,
      type,
      listener,
      options
    );
  };

  // =========================
  // Força seleção
  // =========================

  const style = document.createElement("style");

  style.id = "lc-style";

  style.innerHTML = `
    * {
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      -webkit-touch-callout: default !important;
    }

    ::selection {
      background: rgba(0, 140, 255, 0.45) !important;
      color: #000 !important;
    }

    ::-moz-selection {
      background: rgba(0, 140, 255, 0.45) !important;
      color: #000 !important;
    }
  `;

  document.documentElement.appendChild(style);

  // =========================
  // Limpa handlers inline
  // =========================

  const clearHandlers = el => {

    if (!el) return;

    el.oncopy = null;
    el.oncut = null;
    el.onpaste = null;
    el.oncontextmenu = null;
    el.onselectstart = null;
    el.onmousedown = null;
    el.onmouseup = null;
    el.onkeydown = null;
  };

  clearHandlers(document);
  clearHandlers(document.body);
  clearHandlers(document.documentElement);

  // =========================
  // Modo força bruta
  // =========================

  document.body.contentEditable = true;
  document.designMode = "on";

  // =========================
  // Badge visual
  // =========================

  const badge = document.createElement("div");

  badge.innerText = "Liberar Cópia ON";

  Object.assign(badge.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "999999999",
    padding: "10px 14px",
    background: "rgba(0,140,255,0.9)",
    color: "#fff",
    borderRadius: "12px",
    fontFamily: "sans-serif",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,.2)"
  });

  document.body.appendChild(badge);

  setTimeout(() => {
    badge.remove();
  }, 2500);

})();