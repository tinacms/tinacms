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
// @ts-ignore importing css is not recognized
import styles from '../../styles.css'

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      <style>{styles}</style>
      <div
        className="tina-tailwind"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          background: '#F6F6F9',
          fontFamily: "'Inter', sans-serif",
          zIndex: 9999,
        }}
      >
        {children}
      </div>
    </>
  )
}

export default Layout
