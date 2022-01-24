/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react'

export function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = React.useState<boolean>(false)
  function downHandler(event) {
    if (event.key === targetKey) {
      event.preventDefault()
      setKeyPressed(true)
    }
  }
  const upHandler = (event) => {
    if (event.key == targetKey) {
      event.preventDefault()
      setKeyPressed(false)
    }
  }
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [])
  return keyPressed
}
