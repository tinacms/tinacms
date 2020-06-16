Make your components dismissible!

## Usage

### Example 1: The `useDismissible` hook

```jsx
import { useDismissible } from 'react-dismissible'

import { SomeModal } from './some-modal' // not real

function ComfirmButton(props) {
  let [isVisible, setModalVisibiility] = React.useState(false)

  const dismissible = useDismissible({
    onDismiss: () => setModalVisibility(false)
    click: true,  // call onDismiss if clicking outside of this modal
    escape: true, // call onDismiss if the user presses escape
  })

  return (
    <>
      <button {...props} onClick={() => setModalVisiblity(true)} />
      {isVisible && (
        <SomeModal ref={dismissible}>
          <button onClick={() => setModalVisiblity(false)}>Cancel</button>
          <button onClick={props.onClick}>Do it!</button>
        </SomeModal>
      )}
    </>
  )
}
```

### Example 2: The `Dismissible` component

```jsx
import { Dismissible } from 'react-dismissible'

import { SomeModal } from './some-modal' // not real

function ComfirmButton(props) {
  let [isVisible, setModalVisibiility] = React.useState(false)

  return (
    <>
      <button {...props} onClick={() => setModalVisiblity(true)} />
      {isVisible && (
        <SomeModal>
          <Dismissible
            click // call onDismiss if clicking outside of this modal
            escape // call onDismiss if the user presses escape
            onDismiss={() => {
              setModalVisibility(false)
            }}
          >
            <button onClick={() => setModalVisiblity(false)}>Cancel</button>
            <button onClick={props.onClick}>Do it!</button>
          </Dismissible>
        </SomeModal>
      )}
    </>
  )
}
```

## Dismissible Props

```typescript
interface DismissibleProps {
  onDismiss: Function
  click?: boolean
  escape?: boolean
  disabled?: boolean
  document?: Document
  allowClickPropagation?: boolean
}
```
