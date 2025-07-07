/**

*/

import React from 'react';
import { ProgressIndicatorTest } from '../../toolkit/form-builder/ProgressIndicatorTest';

const Layout = ({ children }: { children: any }) => {
  return (
    <>
      {/* Progress Indicator Test Component - Always visible for development */}
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 10000 }}>
        <ProgressIndicatorTest />
      </div>
      
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
  );
};

export default Layout;
