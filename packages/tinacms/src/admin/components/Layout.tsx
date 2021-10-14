import React from 'react'

const Layout = ({ children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background: 'white',
        zIndex: 9999,
      }}
    >
      {children}
    </div>
  )
}

export default Layout
