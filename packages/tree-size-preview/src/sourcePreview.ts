export interface PreviewLine {
  lineNumber: number;
  text: string;
}

export interface SourcePreviewWindow {
  totalLines: number;
  startLine: number;
  activeLine: number | null;
  lines: PreviewLine[];
}

/**
 * Keeps the source preview bounded so large payloads remain responsive in the browser.
 */
export function buildSourcePreview(
  text: string,
  activeLine: number | null,
  contextRadius = 40,
  defaultMaxLines = 160
): SourcePreviewWindow {
  const normalized = text.replace(/\r\n/g, '\n');
  const allLines = normalized.split('\n');
  const totalLines = allLines.length;

  if (activeLine === null) {
    return buildDefaultPreviewWindow(allLines, totalLines, defaultMaxLines);
  }

  if (activeLine < 0 || activeLine >= totalLines) {
    return buildDefaultPreviewWindow(allLines, totalLines, defaultMaxLines);
  }

  const startLine = Math.max(activeLine - contextRadius, 0);
  const endLine = Math.min(activeLine + contextRadius + 1, totalLines);
  return {
    totalLines,
    startLine,
    activeLine,
    lines: allLines.slice(startLine, endLine).map((line, index) => ({
      lineNumber: startLine + index + 1,
      text: line,
    })),
  };
}

function buildDefaultPreviewWindow(
  allLines: string[],
  totalLines: number,
  defaultMaxLines: number
): SourcePreviewWindow {
  const endLine = Math.min(defaultMaxLines, totalLines);
  return {
    totalLines,
    startLine: 0,
    activeLine: null,
    lines: allLines.slice(0, endLine).map((line, index) => ({
      lineNumber: index + 1,
      text: line,
    })),
  };
}

export function formatSourceMeta(preview: SourcePreviewWindow, activeCol: number | null): string {
  const previewEndLine = preview.startLine + preview.lines.length;
  if (preview.activeLine !== null) {
    const columnText = activeCol !== null ? `, col ${activeCol + 1}` : '';
    return `Line ${preview.activeLine + 1}${columnText} · showing lines ${preview.startLine + 1}-${previewEndLine} of ${preview.totalLines}`;
  }

  return `Showing lines 1-${previewEndLine} of ${preview.totalLines}`;
}