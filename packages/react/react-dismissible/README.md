Make your components dismissible!

## Example

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
}
```
