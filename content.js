(() => {
  // Remove bloqueios inline
  document.oncontextmenu = null;
  document.onselectstart = null;
  document.onmousedown = null;
  document.oncopy = null;
  document.oncut = null;
  document.onpaste = null;
  document.onkeydown = null;

  // CSS da extensão
  const style = document.createElement("style");

  style.innerHTML = `
    * {
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
    }

    ::selection {
      background: rgba(0, 140, 255, 0.35) !important;
      color: inherit !important;
    }

    ::-moz-selection {
      background: rgba(0, 140, 255, 0.35) !important;
      color: inherit !important;
    }
  `;

  document.head.appendChild(style);

  console.log("✔️ Liberar Cópia ativado");

  // Indicador visual no canto
  const badge = document.createElement("div");

  badge.innerText = "Liberar Cópia ON";

  badge.style.position = "fixed";
  badge.style.bottom = "20px";
  badge.style.right = "20px";
  badge.style.zIndex = "999999";
  badge.style.padding = "10px 14px";
  badge.style.background = "rgba(0, 140, 255, 0.9)";
  badge.style.color = "#fff";
  badge.style.fontSize = "14px";
  badge.style.fontFamily = "sans-serif";
  badge.style.borderRadius = "12px";
  badge.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  badge.style.backdropFilter = "blur(6px)";

  document.body.appendChild(badge);

  setTimeout(() => {
    badge.remove();
  }, 2500);
})();