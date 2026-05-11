# Extensão Liberar Cópia

Extensão Chromium (Manifest V3) que permite seleção e cópia de texto em sites que bloqueiam essas ações.

## Como funciona (v2.0)

A ativação é **por domínio** e usa uma arquitetura em três camadas para contornar bloqueios modernos:

1. **CSS via `chrome.scripting.insertCSS` com `origin: 'USER'`** — tem precedência sobre os estilos do site (inclusive `adoptedStyleSheets`).
2. **`main-world.js`** — content script em `world: "MAIN"` rodando em `document_start`. Intercepta `addEventListener` ANTES do site registrar bloqueios em `selectstart`, `copy`, `cut`, `contextmenu`, `mousedown`, `mouseup`, `dragstart`. Neutraliza `preventDefault`/`stopImmediatePropagation` apenas para esses eventos, preservando o resto da página (scroll, clicks, formulários).
3. **`isolated.js`** — limpa atributos `oncopy`/`onselectstart`/etc., remove regras `user-select: none` de Constructable Stylesheets, e **neutraliza overlays transparentes** que capturam o mouse (via `pointer-events: none`, sem deletar o elemento).

## Instalação

1. Baixe o código (ZIP ou clone).
2. Acesse `chrome://extensions/` (ou `edge://extensions/`, `opera://extensions/`).
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta da extensão.

## Uso

1. Navegue até o site onde quer liberar a cópia.
2. Clique no ícone da extensão. O badge mostrará **ON** e o domínio é registrado.
3. (Recomendado) Recarregue a página para aplicar a interceptação completa em `document_start`.
4. Para desativar nesse site, clique novamente no ícone.

O estado é persistido por domínio em `chrome.storage.local`. Sites não ativados não são tocados — a extensão não roda neles.

## O que ela NÃO tenta fazer

- Acessar conteúdo dentro de iframes cross-origin sem permissão (limitação do navegador).
- Quebrar Shadow DOM `mode: 'closed'` (impossível do lado de fora).
- Funcionar em páginas `chrome://`, `edge://`, Chrome Web Store ou outras páginas restritas pelo navegador.
- Burlar DRM ou conteúdo em `<canvas>`/imagem.

## Compatibilidade

- Google Chrome 111+
- Microsoft Edge 111+
- Opera (baseado em Chromium recente)
- Brave, Vivaldi e outros Chromium

## Aviso legal

Esta extensão é fornecida apenas para fins educacionais e de uso pessoal. Respeite os direitos autorais e os termos de uso de cada site.

## Suporte

Problemas ou sites onde a extensão não funciona: abra uma issue com a URL e descrição do bloqueio.
