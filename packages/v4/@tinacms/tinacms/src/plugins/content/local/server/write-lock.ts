interface Waiter {
  exclusive: boolean;
  start: () => void;
}

/**
 * A first-in, first-out lock. A save takes it shared and runs with other saves.
 * A structural operation takes it exclusive and runs alone, so a save cannot land
 * between the compute and the apply of a rename.
 */
export const createWriteLock = () => {
  let saves = 0;
  let structural = false;
  const waiting: Waiter[] = [];

  const admit = () => {
    while (waiting.length > 0) {
      const next = waiting[0] as Waiter;
      const free = next.exclusive ? saves === 0 && !structural : !structural;
      if (!free) return;
      waiting.shift();
      if (next.exclusive) {
        structural = true;
      } else {
        saves += 1;
      }
      next.start();
    }
  };

  const run = async <T>(exclusive: boolean, task: () => Promise<T>) => {
    await new Promise<void>((resolve) => {
      waiting.push({ exclusive, start: resolve });
      admit();
    });
    try {
      return await task();
    } finally {
      if (exclusive) {
        structural = false;
      } else {
        saves -= 1;
      }
      admit();
    }
  };

  return {
    shared: <T>(task: () => Promise<T>) => run(false, task),
    exclusive: <T>(task: () => Promise<T>) => run(true, task),
  };
};

export type WriteLock = ReturnType<typeof createWriteLock>;
