import { WorkerToExtensionMessage } from '../types';
import { buildSizeTree } from '../parser';

export { buildSizeTree };

import { workerData, parentPort, isMainThread } from 'node:worker_threads';
import * as fs from 'node:fs';

/* istanbul ignore next -- worker-only bootstrap, not reachable in unit tests */
if (!isMainThread) {
  try {
    const text = fs.readFileSync(workerData.filePath as string, 'utf8');
    const tree = buildSizeTree(text);
    (parentPort!.postMessage as (msg: WorkerToExtensionMessage) => void)({ type: 'tree', data: tree });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    parentPort!.postMessage({ type: 'error', message });
  }
}
