import { WorkerToExtensionMessage, WebviewToExtensionMessage } from '../../tree-size-core/src/types';
import { createTreeSizeWebviewApp } from '../../tree-size-core/src/webview/app';
import { PREVIEW_FORMATS, PreviewFormat, inferFormatFromFileName, resolveInitialFormat } from './format';
import { buildPreviewUrl, PreviewPage, resolveInitialPage } from './pageState';
import { createPreviewHost } from './previewHost';
import { buildSourcePreview, formatSourceMeta } from './sourcePreview';

interface PreviewState {
  page: PreviewPage;
  format: PreviewFormat;
  requestId: number;
  currentSource: string;
  currentFileName: string;
  bootstrapped: boolean;
  hostReady: boolean;
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`Required element #${id} not found`);
  }
  return element as T;
}

const state: PreviewState = {
  page: resolveInitialPage(globalThis.location.search),
  format: resolveInitialFormat(globalThis.location.search),
  requestId: 0,
  currentSource: '',
  currentFileName: '',
  bootstrapped: false,
  hostReady: false,
};

const formatButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-format]'));
const openLabButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-open-lab-format]'));
const productCards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
const landingView = getRequiredElement<HTMLElement>('landing-view');
const labView = getRequiredElement<HTMLElement>('lab-view');
const backHomeBtn = getRequiredElement<HTMLButtonElement>('back-home-btn');
const fileInput = getRequiredElement<HTMLInputElement>('file-input');
const loadDemoBtn = getRequiredElement<HTMLButtonElement>('load-demo-btn');
const statusText = getRequiredElement<HTMLElement>('status-text');
const fileMeta = getRequiredElement<HTMLElement>('file-meta');
const currentFormatLabel = getRequiredElement<HTMLElement>('current-format-label');
const labMarketplaceLink = getRequiredElement<HTMLAnchorElement>('lab-marketplace-link');
const labOpenVsxLink = getRequiredElement<HTMLAnchorElement>('lab-openvsx-link');
const sourceTitle = getRequiredElement<HTMLElement>('source-title');
const sourceMeta = getRequiredElement<HTMLElement>('source-meta');
const sourceView = getRequiredElement<HTMLElement>('source-view');

const host = createPreviewHost(handleOutboundMessage);
createTreeSizeWebviewApp(host);

formatButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const format = button.dataset.format;
    if (!format || format === state.format) {
      return;
    }
    void setFormat(format as PreviewFormat, true);
  });
});

openLabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const format = button.dataset.openLabFormat;
    if (!format) {
      return;
    }
    void openLab(format as PreviewFormat, true);
  });
});

backHomeBtn.addEventListener('click', () => {
  setPage('landing');
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    return;
  }

  const inferredFormat = inferFormatFromFileName(file.name);
  if (inferredFormat) {
    await setFormat(inferredFormat, false);
  }

  setPage('lab');
  const text = await file.text();
  await analyzeText(text, file.name);
  fileInput.value = '';
});

loadDemoBtn.addEventListener('click', () => {
  void loadDemo(state.format);
});

applyFormatUi();
setPage(state.page);

async function setFormat(format: PreviewFormat, shouldLoadDemo: boolean): Promise<void> {
  state.format = format;
  applyFormatUi();
  syncUrl();

  if (state.page === 'lab' && state.bootstrapped && shouldLoadDemo) {
    await loadDemo(format);
  }
}

function applyFormatUi(): void {
  const config = PREVIEW_FORMATS[state.format];
  document.documentElement.style.setProperty('--active-accent', config.accent);
  document.documentElement.style.setProperty('--active-accent-soft', `${config.accent}26`);
  fileInput.accept = config.accept;
  loadDemoBtn.textContent = `Load ${config.label} sample`;
  currentFormatLabel.textContent = config.label;
  labMarketplaceLink.href = config.marketplaceUrl;
  labOpenVsxLink.href = config.openVsxUrl;
  if (!state.currentFileName) {
    statusText.textContent = `Ready to preview ${config.label}.`;
  }

  formatButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.format === state.format);
  });
  productCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.productCard === state.format);
  });
}

function setPage(page: PreviewPage): void {
  state.page = page;
  landingView.classList.toggle('hidden', page !== 'landing');
  labView.classList.toggle('hidden', page !== 'lab');
  syncUrl();

  if (page === 'lab' && state.hostReady && !state.currentFileName) {
    void loadDemo(state.format);
  }
}

async function openLab(format: PreviewFormat, shouldLoadDemo: boolean): Promise<void> {
  if (format !== state.format) {
    await setFormat(format, false);
  }
  setPage('lab');
  if (shouldLoadDemo && state.hostReady) {
    await loadDemo(state.format);
  }
}

function syncUrl(): void {
  const nextUrl = buildPreviewUrl(globalThis.location.pathname, state.page, state.format);
  globalThis.history.replaceState({}, '', nextUrl);
}

async function loadDemo(format: PreviewFormat): Promise<void> {
  const config = PREVIEW_FORMATS[format];
  statusText.textContent = `Loading ${config.label} sample…`;
  const response = await fetch(config.demoPath);
  if (!response.ok) {
    throw new Error(`Failed to load sample payload for ${config.label}.`);
  }

  const text = await response.text();
  await analyzeText(text, config.demoFileName);
}

async function analyzeText(text: string, fileName: string): Promise<void> {
  const config = PREVIEW_FORMATS[state.format];
  const requestId = ++state.requestId;
  state.currentSource = text;
  state.currentFileName = fileName;

  renderSourcePreview(null, null);
  host.emit({ type: 'loading' });
  statusText.textContent = `Analyzing ${fileName} with ${config.label}…`;
  fileMeta.textContent = `${fileName} · ${(new Blob([text]).size / 1024).toFixed(1)} KB`;

  const worker = new Worker(new URL(config.workerPath, globalThis.location.href));

  worker.addEventListener('message', (event: MessageEvent<WorkerToExtensionMessage>) => {
    if (requestId !== state.requestId) {
      worker.terminate();
      return;
    }

    const msg = event.data;
    if (msg.type === 'tree') {
      host.emit({
        ...msg,
        baseColor: config.accent,
        isDark: false,
      });
      statusText.textContent = `${config.label} ready for ${fileName}.`;
      renderSourcePreview(null, null);
    } else {
      host.emit(msg);
      statusText.textContent = `Could not analyze ${fileName}.`;
    }
    worker.terminate();
  }, { once: true });

  worker.addEventListener('error', () => {
    if (requestId !== state.requestId) {
      worker.terminate();
      return;
    }
    host.emit({ type: 'error', message: `The ${config.label} worker failed unexpectedly.` });
    statusText.textContent = `Could not analyze ${fileName}.`;
    worker.terminate();
  }, { once: true });

  worker.postMessage({ text });
}

function handleOutboundMessage(msg: WebviewToExtensionMessage): void {
  if (msg.type === 'ready') {
    state.hostReady = true;
    if (!state.bootstrapped) {
      state.bootstrapped = true;
      if (state.page === 'lab') {
        void loadDemo(state.format);
      }
    }
    return;
  }

  if (msg.type === 'goToEditor') {
    renderSourcePreview(msg.line, msg.col);
  }
}

function renderSourcePreview(activeLine: number | null, activeCol: number | null): void {
  if (!state.currentSource) {
    sourceTitle.textContent = 'Source Preview';
    sourceMeta.textContent = 'Load a demo or upload a file to inspect the original payload.';
    sourceView.innerHTML = '';
    return;
  }

  const preview = buildSourcePreview(state.currentSource, activeLine);
  sourceTitle.textContent = state.currentFileName;
  sourceMeta.textContent = formatSourceMeta(preview, activeCol);
  sourceView.innerHTML = '';

  const fragment = document.createDocumentFragment();
  preview.lines.forEach((line) => {
    const lineEl = document.createElement('div');
    lineEl.className = 'source-line';
    if (preview.activeLine !== null && line.lineNumber === preview.activeLine + 1) {
      lineEl.classList.add('active');
    }

    const numberEl = document.createElement('span');
    numberEl.className = 'source-line-number';
    numberEl.textContent = String(line.lineNumber);

    const textEl = document.createElement('span');
    textEl.className = 'source-line-text';
    textEl.textContent = line.text.length > 0 ? line.text : ' ';

    lineEl.append(numberEl, textEl);
    fragment.appendChild(lineEl);
  });

  sourceView.appendChild(fragment);

  const activeElement = sourceView.querySelector<HTMLElement>('.source-line.active');
  activeElement?.scrollIntoView({ block: 'center' });
}