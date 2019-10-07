import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { Menu } from './Menu'
import { EditorView } from 'prosemirror-view'
import { Plugin } from 'prosemirror-state'
import { Translator } from '../../../Translator'
import { TranslatorContext } from './TranslatorContext'

export class MenuView {
  dom: HTMLElement

  constructor(
    private view: EditorView,
    private translator: Translator,
    private bottom?: boolean,
    private format: 'markdown' | 'html' | 'html-blocks' = 'html'
  ) {
    this.dom = document.createElement('div')
    this.render()
  }

  render() {
    render(
      <TranslatorContext.Provider value={this.translator}>
        <Menu view={this.view} bottom={this.bottom} format={this.format} />
      </TranslatorContext.Provider>,
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

export function menu(translator: Translator, bottom?: boolean) {
  return new Plugin({
    view(view: EditorView) {
      const menuView = new MenuView(view, translator, bottom)
      const richTextNode = view.dom.parentNode
      const parentElement = richTextNode!.parentElement
      parentElement!.insertBefore(menuView.dom, richTextNode)
      return menuView
    },
    // TODO: Fix
  } as any)
}
