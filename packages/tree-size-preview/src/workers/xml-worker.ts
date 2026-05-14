import { buildSizeTree } from '../../../xml-tree-size/src/parser';
import { attachBrowserParserWorker } from '../../../tree-size-core/src/worker/browserBootstrap';

attachBrowserParserWorker(buildSizeTree);