import * as React from 'react'
import styled, { keyframes } from 'styled-components'

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
  border-radius: 0.3rem;
  border: 1px solid #edecf3;
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
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #433e52;
  margin-bottom: 0.2rem;
`

const LinkInput = styled.input`
  position: relative;
  background-color: white;
  border-radius: 0.3rem;
  font-size: 0.8rem;
  line-height: 1.35;
  transition: all 85ms ease-out;
  padding: 0.5rem 0.75rem;
  border: 1px solid #edecf3;
  width: 100%;
  margin: 0 0 0.5rem 0;
  outline: none;
  box-shadow: 0 0 0 2px transparent;

  &:hover {
    box-shadow: 0 0 0 2px #e1ddec;
  }

  &:focus {
    box-shadow: 0 0 0 2px #0084ff;
  }

  &::placeholder {
    font-size: 0.9rem;
    color: #cfd3d7;
  }
`

const LinkActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.25rem;
`

const LinkButton = styled.button`
  text-align: center;
  border: 0;
  border-radius: 1.5rem;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: #0084ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.5rem 1.25rem;
  transition: opacity 86ms ease-out;
  margin-left: 0.5rem;
  flex: 0 1 auto;
  &:hover {
    opacity: 0.6;
  }
`

const SaveLink = styled.button`
  text-align: center;
  border: 0;
  border-radius: 1.5rem;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.12);
  background-color: #0084ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 85ms ease-out;
  font-size: 0.75rem;
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
  border: 1px solid #edecf3;
  color: #0084ff;
  &:hover {
    background-color: #f6f6f9;
    opacity: 1;
  }
`
