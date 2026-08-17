import { createLocalDatabase } from '@tinacms/graphql';

export default createLocalDatabase({
  port: Number(process.env.TEST_DATALAYER_PORT ?? 9099),
});
