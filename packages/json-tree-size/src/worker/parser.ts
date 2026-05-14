import { WorkerToExtensionMessage } from '../types';
import { buildSizeTree } from '../parser';

export { buildSizeTree };

// ---- Worker thread entry point ----
// When this file is run as a worker, parse the file at workerData.filePath
// and post the resulting SizeNode back to the parent.
import { workerData, parentPort, isMainThread } from 'node:worker_threads';
import * as fs from 'node:fs';

/* istanbul ignore next -- worker-only bootstrap, not reachable in unit tests */
if (!isMainThread) {
  try {
    const text = fs.readFileSync(workerData.filePath as string, 'utf8');
    const tree = buildSizeTree(text);
    // NOTE: baseColor and isDark are added by panel.ts before the message reaches the webview — see _loadFile enrichment.
    (parentPort!.postMessage as (msg: WorkerToExtensionMessage) => void)({ type: 'tree', data: tree });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    parentPort!.postMessage({ type: 'error', message });
  }
}
