import { WebviewToExtensionMessage } from '../types';
import { createTreeSizeWebviewApp } from './app';
import { isExtensionToWebviewMessage } from './messages';

declare function acquireVsCodeApi(): {
  postMessage(msg: WebviewToExtensionMessage): void;
};

const vscode = acquireVsCodeApi();

createTreeSizeWebviewApp({
  postMessage: (msg) => {
    vscode.postMessage(msg);
  },
  onMessage: (listener) => {
    globalThis.addEventListener('message', (event: MessageEvent<unknown>) => {
      if (event.origin !== globalThis.location.origin || !isExtensionToWebviewMessage(event.data)) {
        return;
      }
      listener(event.data);
    });
  },
});
