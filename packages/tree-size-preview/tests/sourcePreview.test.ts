import { buildSourcePreview, formatSourceMeta } from '../src/sourcePreview';

describe('source preview helpers', () => {
  it('shows the first window when no line is selected', () => {
    const preview = buildSourcePreview('a\nb\nc', null, 1, 2);

    expect(preview.activeLine).toBeNull();
    expect(preview.lines.map((line) => line.lineNumber)).toEqual([1, 2]);
  });

  it('centers the preview window around the selected line', () => {
    const preview = buildSourcePreview('1\n2\n3\n4\n5\n6', 3, 1, 2);

    expect(preview.activeLine).toBe(3);
    expect(preview.startLine).toBe(2);
    expect(preview.lines.map((line) => line.lineNumber)).toEqual([3, 4, 5]);
  });

  it('formats source meta for both default and focused views', () => {
    expect(formatSourceMeta(buildSourcePreview('x\ny', null, 1, 2), null)).toBe('Showing lines 1-2 of 2');
    expect(formatSourceMeta(buildSourcePreview('x\ny\nz', 1, 1, 2), 4)).toBe('Line 2, col 5 · showing lines 1-3 of 3');
  });
});