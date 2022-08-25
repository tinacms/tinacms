import React from 'react'
import styled from 'styled-components'
import DocsRichText from '../styles/DocsRichText'
import { useRouter } from 'next/router'
import { FallbackPlaceholder } from 'components/fallback-placeholder'

/* Styles rich text (markdown output)
 */

export const DocsTextWrapper = ({ children }) => {
  const router = useRouter()

  React.useEffect(() => {
    /* https://codepen.io/chriscoyier/pen/YzXeXjK */

    var players = ['iframe[src*="youtube.com"]', 'iframe[src*="vimeo.com"]']
    var fitVids = document.querySelectorAll(players.join(','))

    if (fitVids.length) {
      // Loop through videos
      for (var i = 0; i < fitVids.length; i++) {
        // Get Video Information
        var fitVid = fitVids[i]
        var width = fitVid.getAttribute('width')
        var height = fitVid.getAttribute('height')
        // @ts-ignore
        var aspectRatio = height / width
        var parentDiv = fitVid.parentNode

        // Wrap it in a DIV
        var div = document.createElement('div')
        div.className = 'fitVids-wrapper'
        div.style.paddingBottom = aspectRatio * 100 + '%'
        parentDiv.insertBefore(div, fitVid)
        fitVid.remove()
        div.appendChild(fitVid)

        // Clear height/width from fitVid
        fitVid.removeAttribute('height')
        fitVid.removeAttribute('width')
      }
    }
  }, [])

  return router.isFallback ? (
    <FallbackPlaceholder
      wrapperStyles={{ paddingLeft: 0, paddingRight: 0 }}
      placeholderStyles={{ marginTop: '1rem' }}
    />
  ) : (
    <TextWrapper>{children}</TextWrapper>
  )
}

const TextWrapper = styled.div`
  ${DocsRichText}
`
