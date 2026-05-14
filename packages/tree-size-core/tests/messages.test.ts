import { isExtensionToWebviewMessage } from '../src/webview/messages';

describe('isExtensionToWebviewMessage', () => {
  it('accepts loading messages', () => {
    expect(isExtensionToWebviewMessage({ type: 'loading' })).toBe(true);
  });

  it('accepts error messages with a string payload', () => {
    expect(isExtensionToWebviewMessage({ type: 'error', message: 'boom' })).toBe(true);
  });

  it('accepts tree messages with transport metadata', () => {
    expect(isExtensionToWebviewMessage({
      type: 'tree',
      data: { key: 'root', size: 1, type: 'object', children: [], line: 0, col: 0 },
      baseColor: '#4a9eda',
      isDark: false,
    })).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isExtensionToWebviewMessage(null)).toBe(false);
    expect(isExtensionToWebviewMessage({})).toBe(false);
    expect(isExtensionToWebviewMessage({ type: 'error', message: 123 })).toBe(false);
    expect(isExtensionToWebviewMessage({ type: 'tree', data: null, baseColor: '#fff', isDark: false })).toBe(false);
    expect(isExtensionToWebviewMessage({ type: 'other' })).toBe(false);
  });
});