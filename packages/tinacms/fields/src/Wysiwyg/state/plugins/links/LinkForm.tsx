import * as React from 'react'

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
      <div
        style={{
          backgroundColor: 'white',
          position: 'relative',
          height: 'max-content',
          ...style,
        }}
        // className={c('link-form')}
      >
        <label>Title</label>
        <input
          placeholder="Enter Title"
          autoFocus
          type={'text'}
          value={title}
          onChange={this.setTitle}
          onKeyPress={this.onEnterSave as any}
        />
        <label>URL</label>
        <input
          placeholder="Enter URL"
          autoFocus
          type={'text'}
          value={href}
          onChange={this.setHref}
          onKeyPress={this.onEnterSave as any}
        />
        <div
        // className={c('button-group')}
        >
          <button
            onClick={this.save}
            // className={c('link-form--save')}
          >
            Save
          </button>
          <button
            onClick={removeLink}
            // className={c('link-form--delete')}
          >
            {/* <Icon name="GarbageCan" width={14} height={14} /> */}
            Del
          </button>
        </div>
      </div>
    )
  }
}
