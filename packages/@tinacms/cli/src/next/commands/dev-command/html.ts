export const devHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
  </head>

  <!-- if development -->
  <script type="module">
    import RefreshRuntime from 'http://localhost:4001/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
  <script type="module" src="http://localhost:4001/@vite/client"></script>
  <script
    type="module"
    src="http://localhost:4001/src/main.tsx"
  ></script>
  <body class="tina-tailwind">
    <div id="root"></div>
  </body>
</html>`
