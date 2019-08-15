# Xserver plugin for Gatsby

This plugin starts xserver and provides a way for child plugins to modify the underlying express server to provide backend support for xedtor cms

## Adding the plugin

Install the plugin:

```
npm install @forestryio/gatsby-plugin-xserver
```

Add the plugin to `gatsby-config.js`:

```javascript
// gatsby-config.js

  plugins: [
    {
      resolve: "@forestryio/gatsby-plugin-xserver",
      options: {
        routePrefix: '/__xeditor',
        envPrefix: 'XEDITOR_',
        port: 4567,
        plugins: [
          // add server plugins here
        ],
      },
    },

```

### Plugin options

- `routePrefix`: Prefix for xserver routes. Must include leading slash. Optional, defaults to `/__xeditor`.
- `envPrefix`: Prefix for environment variabls. Optional, defaults to `XEDITOR_`.
- `port`: Port to run xserver on. Optional, defaults to `4567`.
- `plugins`: Add server plugins here. See below on [creating server plugins](#creating-server-plugins).

## Creating server plugins

Xserver uses Express, and exposes the Express server to child plugins so they can add their own routes and middleware. To customize Xserver, create a module that exports a function called `extendXserver`. The function signature is as follows:

```javascript
extendXServer: (server, config) => void
```

`server` contains the express server object, and `config` includes the xserver configuration.

### Creating a custom route

Custom routes should be prepended with `config.routePrefix` in most cases.

```javascript
exports.extendXserver = (server, config) => {
  server.get(`${config.routePrefix}/my-custom-route`, (req, res) => {
    res.send('Hello xserver!')
  })
}
```
