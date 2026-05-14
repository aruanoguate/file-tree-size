import * as fs from 'node:fs';
import { isMainThread, parentPort, workerData } from 'node:worker_threads';
import { SizeNode, WorkerToExtensionMessage } from '../types';
import { buildWorkerResult } from './result';

export type SizeTreeBuilder = (text: string) => SizeNode;

/* istanbul ignore next -- worker-only bootstrap, not reachable in unit tests */
export function runNodeParserWorker(buildSizeTree: SizeTreeBuilder): void {
  if (isMainThread) {
    return;
  }

  const result = buildWorkerResult(() => {
    const text = fs.readFileSync(workerData.filePath as string, 'utf8');
    return buildSizeTree(text);
  });

  (parentPort!.postMessage as (msg: WorkerToExtensionMessage) => void)(result);
}