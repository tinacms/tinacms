import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // vitest 0.32's threaded worker pool aborts the process on node >=24: the workers
    // trip node's fd accounting ("opened in unmanaged mode twice"), which corrupts test
    // output and then raises SIGABRT. Running in-process avoids it, at some wall-clock
    // cost. The real fix is upgrading vitest, which v4 already runs on.
    threads: false,
    include: ['src/**/*.test.ts'],
  },
});
