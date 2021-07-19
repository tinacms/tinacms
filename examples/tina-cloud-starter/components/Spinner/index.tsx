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

import styles from './spinner.module.css'

export const Spinner: React.FC = () => {
  return (
    <div className={styles['lds-ellipsis']}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export const LoadingPage: React.FC<{ text?: string }> = ({
  text = 'Wait a bit, Tina is loading data...',
  children,
}) => (
  <>
    <div
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 40,
        pointerEvents: 'none',
        background: 'rgba(255,255, 255, .85)',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: '50%',
          bottom: '50%',
          textAlign: 'center',
          width: '100vw',
          height: '100vh',
          zIndex: 50,
          color: 'black',
        }}
      >
        {text}
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Spinner />
        </div>
      </div>
    </div>
    <div
      style={{
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  </>
)
