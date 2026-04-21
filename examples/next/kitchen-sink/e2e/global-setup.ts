/**
 * Pre-warm Turbopack route compilation before the parallel test phase.
 *
 * Next.js App Router with Turbopack compiles each route on first request. Without this
 * warm-up, the first test to hit each route pays the compile cost (5-10s) and subsequent
 * parallel tests race against ongoing compilations. Hitting every route once serially
 * during globalSetup means all routes are fully compiled before parallel tests start.
 */
export default async function globalSetup() {
  const baseURL = 'http://localhost:3000';
  const routes = ['/', '/posts', '/blog', '/authors'];

  await Promise.all(
    routes.map((route) =>
      fetch(`${baseURL}${route}`).catch(() => {
        /* ignore — if the route fails here, the test will report a real error */
      })
    )
  );
}
