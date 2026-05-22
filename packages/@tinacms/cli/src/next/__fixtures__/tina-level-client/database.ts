// `@tinacms/datalayer` re-exports `createLocalDatabase` from `@tinacms/graphql`
// (see packages/@tinacms/datalayer/src/index.ts). The CLI declares
// `@tinacms/graphql` directly but not `@tinacms/datalayer`, so we import the
// function from its source package — same behavior, but resolvable from the
// CLI's node_modules tree during the adapter-matrix build.
import { createLocalDatabase } from '@tinacms/graphql';

export default createLocalDatabase({
  port: Number(process.env.TEST_DATALAYER_PORT ?? 9099),
});
