/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { radius, color, font } from '@tinacms/styles'

type E = React.ChangeEvent<HTMLInputElement>

interface Props {
  title: string | null
  href: string | null
  onChange(attrs: any): void
  removeLink(): void
  cancel(): void
  style?: {
    [key: string]: string
  }
}

interface State {
  href: string | null
  title: string | null
}

export class LinkForm extends React.Component<Props, State> {
  state = {
    href: this.props.href || '',
    title: this.props.title || '',
  }
  componentDidMount() {
    document.addEventListener('keydown', this.onEscapeCancel)
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.onEscapeCancel)
  }
  componentWillReceiveProps(props: Props) {
    const { href, title } = props

    this.setState(() => ({ href, title }))
  }

  setHref = ({ target: { value } }: E) => this.setState(() => ({ href: value }))
  setTitle = ({ target: { value } }: E) =>
    this.setState(() => ({ title: value }))

  save = () => this.props.onChange(this.state)

  onEnterSave = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.save()
    }
  }
  onEscapeCancel = (e: KeyboardEvent) => {
    if (e.keyCode === 27) {
      this.props.cancel()
    }
  }
  render() {
    const { removeLink, style = {} } = this.props
    const { href, title } = this.state
    return (
      <LinkPopup
        style={{
          ...style,
        }}
      >
        <LinkLabel>Title</LinkLabel>
        <LinkInput
          placeholder="Enter Title"
          autoFocus
          type={'text'}
          value={title}
          onChange={this.setTitle}
          onKeyPress={this.onEnterSave as any}
        />
        <LinkLabel>URL</LinkLabel>
        <LinkInput
          placeholder="Enter URL"
          autoFocus
          type={'text'}
          value={href}
          onChange={this.setHref}
          onKeyPress={this.onEnterSave as any}
        />
        <LinkActions>
          <DeleteLink onClick={removeLink}>Delete</DeleteLink>
          <SaveLink onClick={this.save}>Save</SaveLink>
        </LinkActions>
      </LinkPopup>
    )
  }
}

const LinkPopupKeyframes = keyframes`
  0% {
    transform: scale3d(0.5,0.5,1)
  }
  100% {
    transform: scale3d(1, 1, 1);
  }
`

const LinkPopup = styled.div`
  background-color: #f6f6f9;
  position: relative;
  height: max-content;
  border-radius: ${radius('small')};
  border: 1px solid ${color.grey(2)};
  filter: drop-shadow(0px 4px 8px rgba(48, 48, 48, 0.1))
    drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.12));
  transform-origin: 50% 0;
  animation: ${LinkPopupKeyframes} 85ms ease-out both 1;
  overflow: visible;
  padding: 0.75rem;
  z-index: 10;
`

const LinkLabel = styled.label`
  display: block;
  font-size: ${font.size(1)};
  font-weight: 600;
  letter-spacing: 0.01em;
  color: ${color.grey(8)};
  margin-bottom: 0.2rem;
`

const LinkInput = styled.input`
  position: relative;
  background-color: white;
  border-radius: ${radius('small')};
  font-size: ${font.size(1)};
  line-height: 1.35;
  transition: all 85ms ease-out;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${color.grey(2)};
  width: 100%;
  margin: 0 0 0.5rem 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;

  &:hover {
    box-shadow: 0 0 0 2px ${color.grey(3)};
  }

  &:focus {
    box-shadow: 0 0 0 2px #0084ff;
  }

  &::placeholder {
    font-size: ${font.size(2)};
    color: #cfd3d7;
  }
`

const LinkActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.25rem;
`

const SaveLink = styled.button`
  text-align: center;
  border: 0;
  border-radius: ${radius()};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: #0084ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: ${font.size(0)};
  padding: 0.5rem 1.25rem;
  margin-left: 0.5rem;
  &:hover {
    background-color: #2296fe;
  }
  &:active {
    background-color: #0574e4;
  }
`

const DeleteLink = styled(SaveLink)`
  background-color: white;
  border: 1px solid ${color.grey(2)};
  color: #0084ff;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
`
