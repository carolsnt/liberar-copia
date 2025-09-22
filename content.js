(function() {
  document.oncontextmenu = null;
  document.onselectstart = null;
  document.onmousedown = null;
  document.body.oncopy = null;
  document.body.oncut = null;
  document.body.onpaste = null;
  document.body.onkeydown = null;
  document.body.style.userSelect = "text";
  console.log("✔️ Bloqueio de cópia removido!");
})();
