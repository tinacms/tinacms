/**

*/
/**
 * Iterate through an array of promises sequentially, ensuring the order
 * is preserved.
 *
 * ```js
 * await sequential(templates, async (template) => {
 *   await doSomething(template)
 * })
 * ```
 */
export declare const sequential: <A, B>(items: A[], callback: (args: A, idx: number) => Promise<B>) => Promise<B[]>;
