import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { Menu } from './Menu'
import { EditorView } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import { Translator } from '../../../Translator'
import { TranslatorContext } from './TranslatorContext'
import styled from 'styled-components'

// @ts-ignore TODO: add to package.json
import { FrameContext } from 'react-frame-component'
import { StyleSheetManager } from 'styled-components'
import { useContext, FC } from 'react'

export class MenuView {
  dom: HTMLElement

  constructor(
    private view: EditorView,
    private translator: Translator,
    private bottom?: boolean,
    private frame?: any,
    private theme?: any
  ) {
    this.dom = document.createElement('div')
    this.render()
  }

  render() {
    render(
      <ViewContainer frame={this.frame}>
        <TranslatorContext.Provider value={this.translator}>
          <Menu
            view={this.view}
            bottom={this.bottom}
            format={'markdown'}
            frame={this.frame}
            theme={this.theme}
          />
        </TranslatorContext.Provider>
      </ViewContainer>,
      this.dom
    )
  }

  update() {
    this.render()
  }

  destroy() {
    unmountComponentAtNode(this.dom)
    this.dom.remove()
  }
}

export function menu(
  translator: Translator,
  bottom?: boolean,
  frame?: any,
  theme?: any
) {
  return new Plugin({
    view(view: EditorView) {
      const menuView = new MenuView(view, translator, bottom, frame, theme)
      const richTextNode = view.dom.parentNode
      const parentElement = richTextNode!.parentElement
      parentElement!.insertBefore(menuView.dom, richTextNode)
      return menuView
    },
    // TODO: Fix
  } as any)
}

const ViewContainer: FC<{ frame: any }> = ({ frame, children }) => {
  if (!frame) return <>{children}</>
  return (
    <StyleSheetManager target={frame.document.head}>
      {children}
    </StyleSheetManager>
  )
}
