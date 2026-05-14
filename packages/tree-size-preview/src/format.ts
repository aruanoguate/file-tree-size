import { DEFAULT_BASE_COLOR, DEFAULT_XML_BASE_COLOR } from '../../tree-size-core/src/utils';

export type PreviewFormat = 'json' | 'xml';

export interface PreviewFormatConfig {
  label: string;
  accent: string;
  accept: string;
  demoPath: string;
  demoFileName: string;
  workerPath: string;
  marketplaceUrl: string;
  openVsxUrl: string;
}

export const PREVIEW_FORMATS: Record<PreviewFormat, PreviewFormatConfig> = {
  json: {
    label: 'JSON Tree Size',
    accent: DEFAULT_BASE_COLOR,
    accept: '.json,application/json',
    demoPath: './assets/demo.json',
    demoFileName: 'demo.json',
    workerPath: './workers/json-worker.js',
    marketplaceUrl: 'https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.json-treesize',
    openVsxUrl: 'https://open-vsx.org/extension/AlvaroEnriqueRuano/json-treesize',
  },
  xml: {
    label: 'XML Tree Size',
    accent: DEFAULT_XML_BASE_COLOR,
    accept: '.xml,application/xml,text/xml',
    demoPath: './assets/demo.xml',
    demoFileName: 'demo.xml',
    workerPath: './workers/xml-worker.js',
    marketplaceUrl: 'https://marketplace.visualstudio.com/items?itemName=AlvaroEnriqueRuano.xml-tree-size',
    openVsxUrl: 'https://open-vsx.org/extension/AlvaroEnriqueRuano/xml-tree-size',
  },
};

export function isPreviewFormat(value: string | null | undefined): value is PreviewFormat {
  return value === 'json' || value === 'xml';
}

export function inferFormatFromFileName(fileName: string): PreviewFormat | null {
  const normalized = fileName.trim().toLowerCase();
  if (normalized.endsWith('.json')) {
    return 'json';
  }
  if (normalized.endsWith('.xml')) {
    return 'xml';
  }
  return null;
}

export function resolveInitialFormat(search: string): PreviewFormat {
  const params = new URLSearchParams(search);
  const value = params.get('format');
  return isPreviewFormat(value) ? value : 'json';
}