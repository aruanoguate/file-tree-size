import { ExtensionToWebviewMessage, WebviewToExtensionMessage } from '../../tree-size-core/src/types';
import { TreeSizeWebviewHost } from '../../tree-size-core/src/webview/app';

export interface PreviewHost extends TreeSizeWebviewHost {
  emit(msg: ExtensionToWebviewMessage): void;
}

export function createPreviewHost(onOutboundMessage: (msg: WebviewToExtensionMessage) => void): PreviewHost {
  const listeners: Array<(msg: ExtensionToWebviewMessage) => void> = [];

  return {
    postMessage(msg) {
      onOutboundMessage(msg);
    },
    onMessage(listener) {
      listeners.push(listener);
    },
    emit(msg) {
      listeners.forEach((listener) => listener(msg));
    },
  };
}