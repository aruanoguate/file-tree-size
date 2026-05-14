import { createPreviewHost } from '../src/previewHost';

describe('createPreviewHost', () => {
  it('forwards outbound messages from the shared app', () => {
    const outbound = jest.fn();
    const host = createPreviewHost(outbound);

    host.postMessage({ type: 'ready' });

    expect(outbound).toHaveBeenCalledWith({ type: 'ready' });
  });

  it('delivers inbound messages to registered listeners', () => {
    const host = createPreviewHost(jest.fn());
    const listener = jest.fn();

    host.onMessage(listener);
    host.emit({ type: 'loading' });

    expect(listener).toHaveBeenCalledWith({ type: 'loading' });
  });
});