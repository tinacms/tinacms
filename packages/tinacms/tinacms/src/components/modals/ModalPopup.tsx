import styled, { keyframes } from 'styled-components'

const ModalPopupKeyframes = keyframes`
  0% {
    transform: translate3d( 0, -2rem, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`

export const ModalPopup = styled.div`
  display: block;
  z-index: 1;
  overflow: visible; /* Keep this as "visible", select component needs to overflow */
  background-color: #fefefe;
  border-radius: 1.5rem;
  margin: 2.5rem auto;
  width: 460px;
  max-width: 90%;
  animation: ${ModalPopupKeyframes} 150ms ease-out 1;
`
