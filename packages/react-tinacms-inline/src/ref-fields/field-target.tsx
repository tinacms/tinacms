/**

Copyright 2019 Forestry.io Inc

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

import * as React from 'react'

export function FieldTarget({ onClick }: { onClick: () => void }) {
  const [opacity, setOpacity] = React.useState('0.0')
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setOpacity('0.3')}
      onMouseLeave={() => setOpacity('0.0')}
      style={{
        position: 'absolute',
        cursor: 'pointer',
        width: 'calc(100% + 32px)',
        height: 'calc(100% + 32px)',
        top: '-16px',
        left: '-16px',
        border: '1px solid var(--tina-color-primary)',
        borderRadius: 'var(--tina-radius-medium)',
        boxShadow: 'var(--tina-shadow-big)',
        opacity,
      }}
    ></div>
  )
}
