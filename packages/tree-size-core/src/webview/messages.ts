import { ExtensionToWebviewMessage } from '../types';

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Performs lightweight runtime validation for incoming host-to-webview messages.
 * This keeps the shared browser UI independent from any specific host transport.
 */
export function isExtensionToWebviewMessage(value: unknown): value is ExtensionToWebviewMessage {
  if (!isObjectRecord(value) || typeof value.type !== 'string') {
    return false;
  }

  if (value.type === 'loading') {
    return true;
  }

  if (value.type === 'error') {
    return typeof value.message === 'string';
  }

  if (value.type === 'tree') {
    return isObjectRecord(value.data)
      && typeof value.baseColor === 'string'
      && typeof value.isDark === 'boolean';
  }

  return false;
}