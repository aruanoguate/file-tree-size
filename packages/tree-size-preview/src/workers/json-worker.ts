import { WorkerToExtensionMessage } from '../../../tree-size-core/src/types';
import { buildSizeTree } from '../../../json-tree-size/src/parser';

interface ParseRequest {
  text: string;
}

const workerScope = globalThis as DedicatedWorkerGlobalScope;

workerScope.addEventListener('message', (event: MessageEvent<ParseRequest>) => {
  try {
    const tree = buildSizeTree(event.data.text);
    const message: WorkerToExtensionMessage = { type: 'tree', data: tree };
    workerScope.postMessage(message);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    workerScope.postMessage({ type: 'error', message });
  }
});