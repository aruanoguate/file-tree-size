import { SizeNode } from '../types';
import { buildWorkerResult } from './result';

interface ParseRequest {
  text: string;
}

export type SizeTreeBuilder = (text: string) => SizeNode;

export function attachBrowserParserWorker(buildSizeTree: SizeTreeBuilder): void {
  const workerScope = globalThis as DedicatedWorkerGlobalScope;

  workerScope.addEventListener('message', (event: MessageEvent<ParseRequest>) => {
    workerScope.postMessage(buildWorkerResult(() => buildSizeTree(event.data.text)));
  });
}