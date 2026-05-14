import { buildSizeTree } from '../parser';
import { runNodeParserWorker } from '../../../tree-size-core/src/worker/nodeBootstrap';

export { buildSizeTree };

runNodeParserWorker(buildSizeTree);
