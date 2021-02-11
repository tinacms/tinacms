# Tina-Aware React Hooks That can be Used Anywhere

before
```js
//...
import { useCMS } from 'tinacms'

function MyComponent() {
    const cms = useCMS()
    return <h1>The CMS is {cms.enabled ? 'enabled' : 'disabled'}</h1>
}

function EditingPage() {
    const cms = new TinaCMS({
        //...
        enabled: true
    })
    return (
        <TinaProvider cms={cms}>
            <MyComponent /> // "The CMS is enabled"
        </TinaProvider>
    )
}

function ProductionPage() {
    return (
        <MyComponent /> // "Error: useCMS could not find an instance of CMS"
    )
}
```

after
```js
//...
import { useCMSEnabled } from '@tinacms/react-anywhere'

function MyComponent() {
    const enabled = useCMSEnabled()
    return <h1>The CMS is {enabled ? 'enabled' : 'disabled'}</h1>
}

function EditingPage() {
    const cms = new TinaCMS({
        //...
        enabled: true
    })
    return (
        <TinaProvider cms={cms}>
            <MyComponent /> // "The CMS is enabled"
        </TinaProvider>
    )
}

function ProductionPage() {
    return (
        <MyComponent /> // "The CMS is disabled"
    )
}
```