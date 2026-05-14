import { SizeNode, WorkerToExtensionMessage } from '../types';

export type WorkerTask = () => SizeNode;

export function buildWorkerResult(task: WorkerTask): WorkerToExtensionMessage {
  try {
    return { type: 'tree', data: task() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { type: 'error', message };
  }
}