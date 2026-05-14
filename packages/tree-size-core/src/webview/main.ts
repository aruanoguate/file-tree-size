import { WebviewToExtensionMessage } from '../types';
import { createTreeSizeWebviewApp } from './app';

declare function acquireVsCodeApi(): {
  postMessage(msg: WebviewToExtensionMessage): void;
};

const vscode = acquireVsCodeApi();

createTreeSizeWebviewApp({
  postMessage: (msg) => {
    vscode.postMessage(msg);
  },
  onMessage: (listener) => {
    window.addEventListener('message', (event: MessageEvent<unknown>) => {
      listener(event.data as never);
    });
  },
});
