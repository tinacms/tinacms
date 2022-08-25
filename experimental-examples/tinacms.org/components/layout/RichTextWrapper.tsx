import React from 'react'
import styled from 'styled-components'
import RichText from '../styles/RichText'

/* Styles rich text (markdown output)
 */

export const RichTextWrapper = React.memo(styled.div`
  ${RichText}
`)
