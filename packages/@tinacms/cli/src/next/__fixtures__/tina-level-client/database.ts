import { createLocalDatabase } from '@tinacms/datalayer';

export default createLocalDatabase({
  port: Number(process.env.TEST_DATALAYER_PORT ?? 9099),
});
