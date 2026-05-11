// Liberar Cópia — Background (Service Worker, MV3)
// Gerencia ativação por domínio e injeção dinâmica em document_start.

const STORAGE_KEY = 'enabledHosts';
const SCRIPT_ID_PREFIX = 'liberar-copia-';

async function getEnabledHosts() {
  const { [STORAGE_KEY]: hosts = [] } = await chrome.storage.local.get(STORAGE_KEY);
  return new Set(hosts);
}

async function setEnabledHosts(set) {
  await chrome.storage.local.set({ [STORAGE_KEY]: [...set] });
}

function hostFromUrl(url) {
  try { return new URL(url).hostname; } catch { return null; }
}

function matchPatternForHost(host) {
  // cobre subdomínios também
  return [`*://${host}/*`, `*://*.${host}/*`];
}

async function registerForHost(host) {
  const id = SCRIPT_ID_PREFIX + host;
  try { await chrome.scripting.unregisterContentScripts({ ids: [id, id + '-iso'] }); } catch {}
  await chrome.scripting.registerContentScripts([
    {
      id,
      js: ['main-world.js'],
      matches: matchPatternForHost(host),
      runAt: 'document_start',
      world: 'MAIN',
      allFrames: true,
      persistAcrossSessions: true
    },
    {
      id: id + '-iso',
      js: ['isolated.js'],
      matches: matchPatternForHost(host),
      runAt: 'document_start',
      world: 'ISOLATED',
      allFrames: true,
      persistAcrossSessions: true
    }
  ]);
}

async function unregisterForHost(host) {
  const id = SCRIPT_ID_PREFIX + host;
  try { await chrome.scripting.unregisterContentScripts({ ids: [id, id + '-iso'] }); } catch {}
}

async function applyImmediateToTab(tab) {
  // Aplica bypass imediato sem precisar de F5 (versão best-effort: document_idle).
  // O registro acima é que garante document_start no próximo carregamento.
  if (!tab?.id || !tab.url || !/^https?:/.test(tab.url)) return;
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id, allFrames: true },
      origin: 'USER',
      css: USER_CSS
    });
  } catch (e) { /* páginas restritas (chrome://, store, etc.) */ }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: 'MAIN',
      files: ['main-world.js']
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: 'ISOLATED',
      files: ['isolated.js']
    });
  } catch (e) {}
}

async function removeImmediateFromTab(tab) {
  if (!tab?.id) return;
  try {
    await chrome.scripting.removeCSS({
      target: { tabId: tab.id, allFrames: true },
      origin: 'USER',
      css: USER_CSS
    });
  } catch (e) {}
}

const USER_CSS = `
*, *::before, *::after {
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  user-select: text !important;
  -webkit-touch-callout: default !important;
}
html, body {
  -webkit-user-select: text !important;
  user-select: text !important;
}
`;

async function updateBadge(tabId, host, hosts) {
  const enabled = host && hosts.has(host);
  await chrome.action.setBadgeText({ tabId, text: enabled ? 'ON' : '' });
  await chrome.action.setBadgeBackgroundColor({ tabId, color: enabled ? '#2e7d32' : '#999' });
  await chrome.action.setTitle({
    tabId,
    title: enabled
      ? `Liberar Cópia ATIVO em ${host} — clique para desativar`
      : `Liberar Cópia — clique para ativar${host ? ' em ' + host : ''}`
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const host = hostFromUrl(tab.url);
  if (!host) return;
  const hosts = await getEnabledHosts();
  if (hosts.has(host)) {
    hosts.delete(host);
    await setEnabledHosts(hosts);
    await unregisterForHost(host);
    await removeImmediateFromTab(tab);
  } else {
    hosts.add(host);
    await setEnabledHosts(hosts);
    await registerForHost(host);
    await applyImmediateToTab(tab);
  }
  await updateBadge(tab.id, host, hosts);
});

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'loading' && info.status !== 'complete') return;
  const host = hostFromUrl(tab.url);
  const hosts = await getEnabledHosts();
  await updateBadge(tabId, host, hosts);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) return;
  const host = hostFromUrl(tab.url);
  const hosts = await getEnabledHosts();
  await updateBadge(tabId, host, hosts);
});

chrome.runtime.onInstalled.addListener(async () => {
  // Re-registra tudo que estava habilitado (caso o navegador tenha limpado).
  const hosts = await getEnabledHosts();
  for (const h of hosts) {
    try { await registerForHost(h); } catch {}
  }
});
