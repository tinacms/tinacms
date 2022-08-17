const withSvgr = require("next-svgr");

module.exports = withSvgr({
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/home",
      },
      {
        source: "/tina",
        destination: `http://127.0.0.1:5173/tina/tina`,
      },
      {
        source: "/tina/:path*",
        destination: `http://127.0.0.1:5173/tina/:path*`,
      },
    ];
  },
});
