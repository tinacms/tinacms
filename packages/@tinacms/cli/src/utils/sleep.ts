function timeout(ms): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
export async function sleepAndCallFunc<T>({
  fn,
  ms,
}: {
  fn: () => Promise<T>
  ms: number
}) {
  await timeout(ms)
  const res = await fn()
  return res
}
