import { SizeNode, ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../types';
import { hexToHsl, heatColor } from './color';
import { formatSize, pct, escHtml } from './helpers';
import { isExtensionToWebviewMessage } from './messages';

export interface TreeSizeWebviewHost {
  postMessage(msg: WebviewToExtensionMessage): void;
  onMessage(listener: (msg: ExtensionToWebviewMessage) => void): void;
}

function show(el: HTMLElement): void {
  el.classList.remove('hidden');
}

function hide(el: HTMLElement): void {
  el.classList.add('hidden');
}

/**
 * Starts the shared tree-size webview UI against an injected host bridge.
 * The host can be VS Code, a browser preview page, or a test double.
 */
export function createTreeSizeWebviewApp(
  host: TreeSizeWebviewHost,
  doc: Document = document
): void {
  // ── Localized strings (passed from the host via data attributes) ──
  const body = doc.body;
  const L = {
    expanding: body.dataset.l10nExpanding ?? 'Expanding…',
    collapsing: body.dataset.l10nCollapsing ?? 'Collapsing…',
    errorTemplate: body.dataset.l10nError ?? 'Error: __MSG__',
    total: body.dataset.l10nTotal ?? 'total',
    items: body.dataset.l10nItems ?? 'items',
    keys: body.dataset.l10nKeys ?? 'keys',
    openInEditor: body.dataset.l10nOpenInEditor ?? 'Open in editor ↗',
  };

  // Signal to the host that the webview JS is loaded and ready
  host.postMessage({ type: 'ready' });

  /**
   * Safely retrieve a DOM element by ID, throwing if not found.
   * @param id - The element ID to look up.
   * @returns The matching HTMLElement.
   * @throws Error if the element does not exist in the DOM.
   */
  function getRequiredElement(id: string): HTMLElement {
    const el = doc.getElementById(id);
    if (!el) {
      throw new Error(`Required element #${id} not found`);
    }
    return el;
  }

  // ── DOM refs ──
  const loadingEl = getRequiredElement('loading');
  const errorEl = getRequiredElement('error');
  const splitEl = getRequiredElement('split');
  const treePaneEl = getRequiredElement('tree-pane');
  const detailPlaceholderEl = getRequiredElement('detail-placeholder');
  const detailContentEl = getRequiredElement('detail-content');
  const expandAllBtn = getRequiredElement('expand-all-btn');
  const collapseAllBtn = getRequiredElement('collapse-all-btn');

  // ── State ──
  let colorState: { h: number; s: number; l: number; isDark: boolean } | null = null;

  // ── Toolbar ──
  /**
   * Disables toolbar buttons, shows a busy label, executes the given work function,
   * then re-enables the buttons after the browser has painted the result.
   * @param btn - The toolbar button that triggered the action.
   * @param label - Temporary label to display while the work is in progress.
   * @param work - Synchronous function to execute (e.g. expand/collapse all nodes).
   */
  function withToolbarBusy(btn: HTMLElement, label: string, work: () => void): void {
    const original = btn.textContent ?? '';
    expandAllBtn.setAttribute('disabled', '');
    collapseAllBtn.setAttribute('disabled', '');
    btn.textContent = label;
    setTimeout(() => {
      work();
      requestAnimationFrame(() => {
        btn.textContent = original;
        expandAllBtn.removeAttribute('disabled');
        collapseAllBtn.removeAttribute('disabled');
      });
    }, 0);
  }

  expandAllBtn.addEventListener('click', () => {
    withToolbarBusy(expandAllBtn, L.expanding, () => {
      treePaneEl.querySelectorAll<HTMLElement>('.tree-children').forEach(el => {
        el.classList.remove('hidden');
      });
      treePaneEl.querySelectorAll<HTMLElement>('.tree-toggle').forEach(el => {
        if (el.textContent === '▶') el.textContent = '▼';
      });
    });
  });

  collapseAllBtn.addEventListener('click', () => {
    withToolbarBusy(collapseAllBtn, L.collapsing, () => {
      treePaneEl.querySelectorAll<HTMLElement>('.tree-children').forEach((el, i) => {
        if (i > 0) el.classList.add('hidden');
      });
      treePaneEl.querySelectorAll<HTMLElement>('.tree-toggle').forEach((el, i) => {
        if (i > 0 && el.textContent === '▼') el.textContent = '▶';
      });
    });
  });

  host.onMessage((msg) => {
    if (!isExtensionToWebviewMessage(msg)) {
      return;
    }
    if (msg.type === 'loading') {
      show(loadingEl); hide(splitEl); hide(errorEl);
    } else if (msg.type === 'error') {
      hide(loadingEl); hide(splitEl);
      show(errorEl);
      errorEl.textContent = L.errorTemplate.replace('__MSG__', msg.message);
    } else if (msg.type === 'tree') {
      hide(loadingEl); hide(errorEl);
      show(splitEl);
      const { h, s, l } = hexToHsl(msg.baseColor);
      colorState = { h, s, l, isDark: msg.isDark };
      renderTree(msg.data);
    }
  });

  // ── Tree rendering ──
  function renderTree(root: SizeNode): void {
    treePaneEl.innerHTML = '';
    treePaneEl.appendChild(buildTreeRow(root, root.size, true));
  }

  function buildTreeRow(node: SizeNode, rootSize: number, expanded: boolean, parentSize?: number): HTMLElement {
    const wrapper = doc.createElement('div');

    const row = doc.createElement('div');
    row.className = 'tree-row';
    row.dataset.line = String(node.line);
    row.dataset.col = String(node.col);

    const top = doc.createElement('div');
    top.className = 'tree-row-top';

    const toggle = doc.createElement('span');
    toggle.className = 'tree-toggle';
    const hasChildren = node.children.length > 0;
    if (hasChildren) {
      toggle.textContent = expanded ? '▼' : '▶';
    } else {
      toggle.textContent = '';
    }

    const keyEl = doc.createElement('span');
    keyEl.className = 'tree-key';
    keyEl.textContent = node.key;

    const sizeEl = doc.createElement('span');
    sizeEl.className = 'tree-size';
    sizeEl.textContent = formatSize(node.size);

    top.append(toggle, keyEl, sizeEl);

    const effectiveParent = parentSize ?? rootSize;
    const miniBarWidth = pct(node.size, effectiveParent);
    const miniBarPct = effectiveParent > 0 ? (node.size / effectiveParent * 100).toFixed(1) + '%' : '';
    const barTrack = doc.createElement('div');
    barTrack.className = 'tree-mini-bar-track';
    const barFill = doc.createElement('div');
    barFill.className = 'tree-mini-bar-fill';
    barFill.style.width = miniBarWidth + '%';
    if (colorState) {
      const miniL = colorState.isDark ? 75 : 30;
      barFill.style.background = `hsl(${colorState.h},${colorState.s}%,${miniL}%)`;
    }
    barTrack.appendChild(barFill);

    const barRow = doc.createElement('div');
    barRow.className = 'tree-bar-row';
    const pctLabel = doc.createElement('span');
    pctLabel.className = 'tree-pct';
    pctLabel.textContent = miniBarPct;
    barRow.append(barTrack, pctLabel);

    row.append(top, barRow);

    const childrenEl = doc.createElement('div');
    childrenEl.className = 'tree-children';
    if (!expanded) childrenEl.classList.add('hidden');

    if (hasChildren) {
      node.children.forEach(child => {
        childrenEl.appendChild(buildTreeRow(child, rootSize, false, node.size));
      });
    }

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      doc.querySelectorAll('.tree-row.selected').forEach(el => el.classList.remove('selected'));
      row.classList.add('selected');
      renderDetail(node);

      if (hasChildren) {
        const open = !childrenEl.classList.contains('hidden');
        childrenEl.classList.toggle('hidden', open);
        toggle.textContent = open ? '▶' : '▼';
      }
    });

    wrapper.append(row, childrenEl);
    return wrapper;
  }

  function renderDetail(node: SizeNode): void {
    show(detailContentEl);
    hide(detailPlaceholderEl);
    detailContentEl.innerHTML = '';

    const header = doc.createElement('div');
    header.className = 'detail-header';
    header.innerHTML = `
    <h2>${escHtml(node.key)}</h2>
    <div class="detail-meta">
      ${formatSize(node.size)} ${L.total}
      · ${node.children.length} ${node.type === 'array' ? L.items : L.keys}
      · ${node.type}
    </div>`;
    detailContentEl.appendChild(header);

    const maxChildSize = node.children.length > 0
      ? Math.max(...node.children.map(c => c.size))
      : 1;

    node.children.forEach(child => {
      const ofParent = node.size > 0 ? child.size / node.size : 0;
      const ofMax = maxChildSize > 0 ? child.size / maxChildSize : 0;
      const percentage = (ofParent * 100).toFixed(1);
      const barWidth = Math.max(ofMax * 100, 0.5);

      const row = doc.createElement('div');
      row.className = 'bar-row';
      row.style.cursor = 'pointer';

      const rowTop = doc.createElement('div');
      rowTop.className = 'bar-row-top';
      const keySpan = doc.createElement('span');
      keySpan.className = 'bar-key';
      keySpan.textContent = child.key;
      const metaSpan = doc.createElement('span');
      metaSpan.className = 'bar-meta';
      metaSpan.textContent = `${formatSize(child.size)} · ${percentage}%`;
      rowTop.append(keySpan, metaSpan);

      const track = doc.createElement('div');
      track.className = 'bar-track';
      const fill = doc.createElement('div');
      fill.className = 'bar-fill';
      fill.style.width = barWidth + '%';
      if (colorState) {
        fill.style.background = heatColor(ofMax, colorState.h, colorState.s, colorState.l, colorState.isDark);
      }
      track.appendChild(fill);

      row.append(rowTop, track);
      row.addEventListener('click', () => {
        renderDetail(child);
        selectTreeNode(child);
      });

      detailContentEl.appendChild(row);
    });

    const btn = doc.createElement('button');
    btn.className = 'goto-btn';
    btn.textContent = L.openInEditor;
    btn.addEventListener('click', () => {
      host.postMessage({ type: 'goToEditor', line: node.line, col: node.col });
    });
    detailContentEl.appendChild(btn);
  }

  function selectTreeNode(node: SizeNode): void {
    const target = treePaneEl.querySelector<HTMLElement>(
      `.tree-row[data-line="${node.line}"][data-col="${node.col}"]`
    );
    if (!target) return;

    let el: HTMLElement | null = target.parentElement;
    while (el && el !== treePaneEl) {
      if (el.classList.contains('tree-children') && el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        const parentRow = el.previousElementSibling;
        if (parentRow instanceof HTMLElement && parentRow.classList.contains('tree-row')) {
          const toggle = parentRow.querySelector<HTMLElement>('.tree-toggle');
          if (toggle) toggle.textContent = '▼';
        }
      }
      el = el.parentElement;
    }

    doc.querySelectorAll('.tree-row.selected').forEach(r => r.classList.remove('selected'));
    target.classList.add('selected');
    target.scrollIntoView({ block: 'nearest' });
  }
}