import { inferFormatFromFileName, isPreviewFormat, resolveInitialFormat } from '../src/format';

describe('preview format helpers', () => {
  it('infers supported formats from file names', () => {
    expect(inferFormatFromFileName('payload.json')).toBe('json');
    expect(inferFormatFromFileName('payload.XML')).toBe('xml');
  });

  it('returns null for unsupported file names', () => {
    expect(inferFormatFromFileName('payload.txt')).toBeNull();
    expect(inferFormatFromFileName('')).toBeNull();
  });

  it('validates preview format identifiers', () => {
    expect(isPreviewFormat('json')).toBe(true);
    expect(isPreviewFormat('xml')).toBe(true);
    expect(isPreviewFormat('yaml')).toBe(false);
  });

  it('defaults to json when the query string is missing or invalid', () => {
    expect(resolveInitialFormat('')).toBe('json');
    expect(resolveInitialFormat('?format=yaml')).toBe('json');
    expect(resolveInitialFormat('?format=xml')).toBe('xml');
  });
});