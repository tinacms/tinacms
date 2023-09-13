/**

*/

import React from 'react'

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      <div
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
