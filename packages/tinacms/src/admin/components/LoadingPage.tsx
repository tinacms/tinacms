/**

*/

import React from 'react'

const LoadingPage = () => (
  <>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
        opacity: '0.8',
        display: 'flex',
        alignItems: 'start',
        justifyContent: 'center',
        padding: '120px 40px 40px 40px',
      }}
    >
      <div
        style={{
          background: '#FFF',
          border: '1px solid #EDECF3',
          boxShadow:
            '0px 2px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '32px 24px',
          width: '460px',
          maxWidth: '90%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <svg
          style={{
            width: '64px',
            color: '#2296fe',
            marginTop: '-8px',
            marginBottom: '16px',
          }}
          version="1.1"
          id="L5"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 100 64"
          enableBackground="new 0 0 0 0"
          xmlSpace="preserve"
        >
          <circle fill="currentColor" stroke="none" cx={6} cy={32} r={6}>
            <animateTransform
              attributeName="transform"
              dur="1s"
              type="translate"
              values="0 15 ; 0 -15; 0 15"
              calcMode="spline"
              keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
              repeatCount="indefinite"
              begin="0.1"
            />
          </circle>
          <circle fill="currentColor" stroke="none" cx={30} cy={32} r={6}>
            <animateTransform
              attributeName="transform"
              dur="1s"
              type="translate"
              values="0 15 ; 0 -10; 0 15"
              calcMode="spline"
              keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
              repeatCount="indefinite"
              begin="0.2"
            />
          </circle>
          <circle fill="currentColor" stroke="none" cx={54} cy={32} r={6}>
            <animateTransform
              attributeName="transform"
              dur="1s"
              type="translate"
              values="0 15 ; 0 -5; 0 15"
              calcMode="spline"
              keySplines="0.8 0 0.4 1; 0.4 0 0.2 1"
              repeatCount="indefinite"
              begin="0.3"
            />
          </circle>
        </svg>
        <p
          style={{
            fontSize: '16px',
            color: '#716c7f',
            textAlign: 'center',
            lineHeight: '1.3',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 'normal',
          }}
        >
          Please wait, Tina is loading data...
        </p>
      </div>
    </div>
  </>
)

export default LoadingPage
