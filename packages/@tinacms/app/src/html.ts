export const devHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/tina.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
  </head>

  <!-- if development -->
  <script type="module">
    import RefreshRuntime from 'http://localhost:5173/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
  <script type="module" src="http://localhost:5173/@vite/client"></script>
  <script
    type="module"
    src="http://localhost:5173/INSERT_OUTPUT_FOLDER_NAME/src/main.tsx"
  ></script>
  <body class="tina-tailwind">
    <div id="root"></div>
  </body>
</html>`

export const prodHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
