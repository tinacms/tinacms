/**

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
