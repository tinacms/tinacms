This is a document for the high level trace of how media works in the v4 of TinaCMS 

### The App Entry Point 

Each TinaCMS app must have a config defined by the `defineConfig({})` func. This function takes in parameters of the shape `TinaConfig` 

```ts
export interface TinaConfig {
  plugins?: PluginManifest[];
  schema: TinaSchema;
  build?: TinaBuildConfig;
}
```

In the `plugins: [ ... ]` declaration a mediaPlugin needs to be defined. 

Note: the `media` capability is a single-provider capability; so we can only ever have 1 active  media provider. An example of how this is used in an app could be: 

```ts
plugins: [
  localContentPlugin(),
  isLocal ? localMediaPlugin() : tinaCloud({ clientId, getToken }),
]
```

### The Media Plugin

A media plugin takes the generic plugin shape, and provides capability `media`

In the media plugin's Client Segment returns a `default.slice` holding the media functions which must match the `MediaProvider` contract (`src/core/media/contract.ts`): 
  - upload(file, folder?): saves a file, returns its media path
  - list(folder, { cursor, limit }?): one page of files and folders
  - delete(path): deletes one file
  - resolveUrl(path): turns a media path into a URL

A plugin that provides `media` has its slice mounted at `store.media` in  the `TinaStore`. This can be accessed anywhere else in the application without needing to know which plugin is providing the brains of the media - via `useMediaSlice`. 

The media plugin provides the backend functionality of media for the TinaCMS app, no UI. 

### The Media UI - The Media Manager

The Media Manager is a separate plugin, and only provides the UI. It uses whatever media plugin is installed. 

It declares `dependsOn: ['media']` so the admin refuses to start if no media plugin is installed. 

In it's Client Segment, the Media Manager plugin needs to provide: 
- An entry on a slot (for the sidebar)
- A screen to render when that entry is chosen 

Ex: 

```ts
client: async () => ({
      default: defineClientPlugin({
        screens: [{ name: 'media', label: 'Media', component: MediaManagerScreen }],
        slots: {
          globalNav: [
            { label: 'Media', icon: ImageIcon, target: { kind: 'screen', screen: 'media' } },
          ],
        },
      }),
```

The screen (here, MediaManagerScreen) will use `useMediaSlice` to hook into the brains of the app's media. 




