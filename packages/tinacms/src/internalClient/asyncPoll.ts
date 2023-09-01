/**
 * The function you pass to `asyncPoll` should return a promise
 * that resolves with object that satisfies this interface.
 *
 * The `done` property indicates to the async poller whether to
 * continue polling or not.
 *
 * When done is `true` that means you've got what you need
 * and the poller will resolve with `data`.
 *
 * When done is `false` taht means you don't have what you need
 * and the poller will continue polling.
 */
export interface AsyncData<T> {
  done: boolean
  data?: T
}

/**
 * Your custom function you provide to the async poller should
 * satisfy this interface. Your function returns a promise that
 * resolves with `AsyncData` to indicate to the poller whether
 * you have what you need or we should continue polling.
 */
export interface AsyncFunction<T> extends Function {
  (): PromiseLike<AsyncData<T>>
}

/**
  * How to repeatedly call an async function until get a desired result.
  *
  * Inspired by the following gist:
  * https://gist.github.com/twmbx/2321921670c7e95f6fad164fbdf3170e#gistcomment-3053587
  * https://davidwalsh.name/javascript-polling
  *
  * Usage:
    asyncPoll(
        async (): Promise<AsyncData<any>> => {
            try {
                const result = await getYourAsyncResult();
                if (result.isWhatYouWant) {
                    return Promise.resolve({
                        done: true,
                        data: result,
                    });
                } else {
                    return Promise.resolve({
                        done: false
                    });
                }
            } catch (err) {
                return Promise.reject(err);
            }
        },
        500,    // interval
        15000,  // timeout
    );
  */
export function asyncPoll<T>(
  /**
   * Function to call periodically until it resolves or rejects.
   *
   * It should resolve as soon as possible indicating if it found
   * what it was looking for or not. If not then it will be reinvoked
   * after the `pollInterval` if we haven't timed out.
   *
   * Rejections will stop the polling and be propagated.
   */
  fn: AsyncFunction<T>,
  /**
   * Milliseconds to wait before attempting to resolve the promise again.
   * The promise won't be called concurrently. This is the wait period
   * after the promise has resolved/rejected before trying again for a
   * successful resolve so long as we haven't timed out.
   *
   * Default 5 seconds.
   */
  pollInterval: number = 5 * 1000,
  /**
   * Max time to keep polling to receive a successful resolved response.
   * If the promise never resolves before the timeout then this method
   * rejects with a timeout error.
   *
   * Default 30 seconds.
   */
  pollTimeout: number = 30 * 1000
) {
  const endTime = new Date().getTime() + pollTimeout
  let stop = false
  const cancel = () => {
    stop = true
  }
  const checkCondition = (resolve: Function, reject: Function): void => {
    Promise.resolve(fn())
      .then((result) => {
        const now = new Date().getTime()
        if (stop) {
          reject(new Error('AsyncPoller: cancelled'))
        } else if (result.done) {
          resolve(result.data)
        } else if (now < endTime) {
          setTimeout(checkCondition, pollInterval, resolve, reject)
        } else {
          reject(new Error('AsyncPoller: reached timeout'))
        }
      })
      .catch((err) => {
        reject(err)
      })
  }
  return [new Promise(checkCondition) as Promise<T>, cancel]
}
