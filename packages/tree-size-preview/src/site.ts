import { WorkerToExtensionMessage, WebviewToExtensionMessage } from '../../tree-size-core/src/types';
import { createTreeSizeWebviewApp } from '../../tree-size-core/src/webview/app';
import { PREVIEW_FORMATS, PreviewFormat, inferFormatFromFileName, resolveInitialFormat } from './format';
import { createPreviewHost } from './previewHost';
import { buildSourcePreview, formatSourceMeta } from './sourcePreview';

interface PreviewState {
  format: PreviewFormat;
  requestId: number;
  currentSource: string;
  currentFileName: string;
  bootstrapped: boolean;
}

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Required element #${id} not found`);
  }
  return element as T;
}

const state: PreviewState = {
  format: resolveInitialFormat(window.location.search),
  requestId: 0,
  currentSource: '',
  currentFileName: '',
  bootstrapped: false,
};

const formatButtons = Array.from(document.querySelectorAll<HTMLElement>('[data-format]'));
const previewLinks = Array.from(document.querySelectorAll<HTMLElement>('[data-preview-format]'));
const productCards = Array.from(document.querySelectorAll<HTMLElement>('[data-product-card]'));
const fileInput = getRequiredElement<HTMLInputElement>('file-input');
const loadDemoBtn = getRequiredElement<HTMLButtonElement>('load-demo-btn');
const statusText = getRequiredElement<HTMLElement>('status-text');
const fileMeta = getRequiredElement<HTMLElement>('file-meta');
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

previewLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const format = link.dataset.previewFormat;
    if (!format) {
      return;
    }
    void setFormat(format as PreviewFormat, true);
  });
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

  const text = await file.text();
  await analyzeText(text, file.name);
  fileInput.value = '';
});

loadDemoBtn.addEventListener('click', () => {
  void loadDemo(state.format);
});

void setFormat(state.format, false);

async function setFormat(format: PreviewFormat, loadDemo: boolean): Promise<void> {
  state.format = format;
  const config = PREVIEW_FORMATS[format];
  document.documentElement.style.setProperty('--active-accent', config.accent);
  document.documentElement.style.setProperty('--active-accent-soft', `${config.accent}26`);
  fileInput.accept = config.accept;
  loadDemoBtn.textContent = `Load ${config.label} sample`;
  statusText.textContent = `Ready to preview ${config.label}.`;

  formatButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.format === format);
  });
  productCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.productCard === format);
  });

  const params = new URLSearchParams(window.location.search);
  params.set('format', format);
  const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);

  if (state.bootstrapped && loadDemo) {
    await loadDemo(format);
  }
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

  const worker = new Worker(new URL(config.workerPath, window.location.href));

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
    if (!state.bootstrapped) {
      state.bootstrapped = true;
      void loadDemo(state.format);
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