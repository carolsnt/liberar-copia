(() => {

  console.log("✔️ Liberar Cópia Nuclear ativo");

  // =========================
  // Intercepta preventDefault
  // =========================

  const originalPreventDefault = Event.prototype.preventDefault;

  Event.prototype.preventDefault = function () {

    const blocked = [
      "copy",
      "cut",
      "paste",
      "contextmenu",
      "selectstart",
      "mousedown",
      "mouseup",
      "keydown"
    ];

    if (blocked.includes(this.type)) {
      console.log("🚫 preventDefault bloqueado:", this.type);
      return;
    }

    return originalPreventDefault.call(this);
  };

  // =========================
  // Intercepta addEventListener
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

  EventTarget.prototype.addEventListener = function (
    type,
    listener,
    options
  ) {

    if (blockedEvents.includes(type)) {
      console.log("🚫 Listener bloqueado:", type);
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

  style.innerHTML = `
    * {
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      pointer-events: auto !important;
    }

    ::selection {
      background: rgba(0,140,255,.45) !important;
      color: #000 !important;
    }
  `;

  document.documentElement.appendChild(style);

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

  const cleanAll = () => {

    clearHandlers(document);
    clearHandlers(document.body);
    clearHandlers(document.documentElement);

    document.querySelectorAll("*").forEach(clearHandlers);
  };

  cleanAll();

  // =========================
  // Reexecuta limpeza
  // =========================

  setInterval(cleanAll, 1000);

  // =========================
  // MutationObserver
  // =========================

  const observer = new MutationObserver(() => {
    cleanAll();
  });

  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // =========================
  // Força modo editável
  // =========================

  document.designMode = "on";

  if (document.body) {
    document.body.contentEditable = true;
  }

})();