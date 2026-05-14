import { buildPreviewUrl, resolveInitialPage } from '../src/pageState';

describe('page state helpers', () => {
  it('defaults to the landing page when the query is missing or invalid', () => {
    expect(resolveInitialPage('')).toBe('landing');
    expect(resolveInitialPage('?page=other')).toBe('landing');
  });

  it('resolves the lab page when requested explicitly', () => {
    expect(resolveInitialPage('?page=lab')).toBe('lab');
  });

  it('builds preview urls with page and format state', () => {
    expect(buildPreviewUrl('/file-tree-size/', 'landing', 'json')).toBe('/file-tree-size/?page=home&format=json');
    expect(buildPreviewUrl('/file-tree-size/', 'lab', 'xml')).toBe('/file-tree-size/?page=lab&format=xml');
  });
});