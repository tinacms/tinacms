const errorHTML = `<style type="text/css">
#no-assets-placeholder body {
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1.4;
  color: #333;
  background-color: #f5f5f5;
}
#no-assets-placeholder {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  background-color: #fff;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
}
#no-assets-placeholder h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
#no-assets-placeholder p {
  margin-bottom: 10px;
}
#no-assets-placeholder a {
  color: #0077cc;
  text-decoration: none;
}
#no-assets-placeholder a:hover {
  text-decoration: underline;
}
</style>
<div id="no-assets-placeholder">
<h1>Failed loading TinaCMS assets</h1>
<p>
  Your TinaCMS configuration may be misconfigured, and we could not load
  the assets for this page.
</p>
<p>
  Please visit <a href="https://tina.io/docs/tina-cloud/faq/#how-do-i-resolve-failed-loading-tinacms-assets-error">this doc</a> for help.
</p>
</div>
</div>`
  .trim()
  .replace(/[\r\n\s]+/g, ' ')

export const devHTML = (port: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
  </head>

  <!-- if development -->
  <script type="module">
    import RefreshRuntime from 'http://localhost:${port}/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
  <script type="module" src="http://localhost:${port}/@vite/client"></script>
  <script>
  function handleLoadError() {
    // Assets have failed to load
    document.getElementById('root').innerHTML = '${errorHTML}';
  }
  </script>
  <script
    type="module"
    src="http://localhost:${port}/src/main.tsx"
    onerror="handleLoadError()"
  ></script>
  <body class="tina-tailwind">
    <div id="root"></div>
  </body>
</html>`
