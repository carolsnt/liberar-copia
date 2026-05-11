(() => {
  console.log("✔️ Liberar Cópia ativo");

  // =========================
  // CSS de desbloqueio + seleção visual
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

    /* Marca-texto azul transparente */

    ::selection {
      background: rgba(0, 140, 255, 0.45) !important;
      color: #000 !important;
    }

    ::-moz-selection {
      background: rgba(0, 140, 255, 0.45) !important;
      color: #000 !important;
    }

    img,
    video {
      pointer-events: auto !important;
    }
  `;

  document.documentElement.appendChild(style);

  // =========================
  // Reinjeta CSS se site remover
  // =========================

  setInterval(() => {
    if (!document.getElementById("lc-style")) {
      document.documentElement.appendChild(style);
    }
  }, 2000);

  // =========================
  // Mata eventos de bloqueio
  // =========================

  const blockEvents = [
    "copy",
    "cut",
    "paste",
    "contextmenu",
    "selectstart",
    "mousedown",
    "mouseup",
    "keydown"
  ];

  blockEvents.forEach(event => {
    window.addEventListener(
      event,
      e => {
        e.stopPropagation();
      },
      true
    );
  });

  // =========================
  // Remove handlers inline
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

})();