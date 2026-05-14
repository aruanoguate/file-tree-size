import { buildSizeTree } from '../../../json-tree-size/src/parser';
import { attachBrowserParserWorker } from '../../../tree-size-core/src/worker/browserBootstrap';

attachBrowserParserWorker(buildSizeTree);