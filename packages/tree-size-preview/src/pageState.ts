import { PreviewFormat } from './format';

export type PreviewPage = 'landing' | 'lab';

export function resolveInitialPage(search: string): PreviewPage {
  const params = new URLSearchParams(search);
  return params.get('page') === 'lab' ? 'lab' : 'landing';
}

export function buildPreviewUrl(pathname: string, page: PreviewPage, format: PreviewFormat): string {
  const params = new URLSearchParams();
  params.set('page', page === 'lab' ? 'lab' : 'home');
  params.set('format', format);
  return `${pathname}?${params.toString()}`;
}