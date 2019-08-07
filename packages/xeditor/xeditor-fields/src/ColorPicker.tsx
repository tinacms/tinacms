import * as React from 'react'
import { SketchPicker } from 'react-color'

import styled from 'styled-components'
import { ColorRGBA, ColorFormat, ColorFormatter } from './color-formatter'

type DivProps = any
type WrappedFieldProps = any
interface SwatchProps extends DivProps {
  colorRGBA?: ColorRGBA
  onClick(): void
  colorFormat: ColorFormat
}

const GetTextColorForBackground = function(backgroundColor?: ColorRGBA) {
  //fudgy rgb values found on the internets
  return !backgroundColor ||
    backgroundColor.r * 0.299 +
      backgroundColor.g * 0.587 +
      backgroundColor.b * 0.114 >
      186
    ? '#000000'
    : '#ffffff'
}

export const Swatch = styled(
  ({ colorRGBA, colorFormat, unselectable, ...props }: SwatchProps) => (
    <div {...props}>
      <div className="swatch-inner">
        {!colorRGBA
          ? 'Click to add color'
          : ColorFormatter[colorFormat].getLabel(colorRGBA)}
      </div>
    </div>
  )
)`
  padding: 0.5rem;
  background: #fff;
  border-radius: 0.3rem;
  box-shadow: 0 0 0 1px #dedede;
  cursor: pointer;
  width: 100%;
  margin: 0 0 2rem 0;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.8rem;
    font-weight: bold;

    width: 100%;
    height: 2rem;
    border-radius: 0.15rem;
    background: ${props =>
      props.colorRGBA
        ? `rgba(${props.colorRGBA.r}, ${props.colorRGBA.g}, ${
            props.colorRGBA.b
          }, ${props.colorRGBA.a})`
        : `#fff`};
    color: ${props => GetTextColorForBackground(props.colorRGBA)};
  }
`

export const Popover = styled.div`
  position: absolute;
  z-index: 900;
`

export const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  height: 100vh;
`

interface Props {
  colorFormat: ColorFormat
  input: WrappedFieldProps['input']
}

interface State {
  displayColorPicker: boolean
}

const nullColor = 'transparent'

export class ColorPicker extends React.Component<Props, State> {
  static defaultProps = {
    colorFormat: ColorFormat.Hex,
  }
  presetColors = [
    '#D0021B',
    '#F5A623',
    '#F8E71C',
    '#8B572A',
    '#7ED321',
    '#417505',
    '#BD10E0',
    '#9013FE',
    '#4A90E2',
    '#50E3C2',
    '#B8E986',
    '#000000',
    '#4A4A4A',
    '#9B9B9B',
    '#FFFFFF',
  ]

  state = {
    displayColorPicker: false,
  }

  get colorFormat() {
    return (this.props.colorFormat || ColorFormat.Hex).toLowerCase()
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  }

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  }

  handleChange = (pickerColor: any) => {
    const color = (pickerColor.hex === nullColor
      ? null
      : { ...pickerColor.rgb, a: 1 }) as ColorRGBA | null
    this.props.input.onChange(
      color ? ColorFormatter[this.colorFormat].getValue(color) : null
    )
  }

  get colorRGBA() {
    return this.props.input.value
      ? ColorFormatter[this.colorFormat].parse(this.props.input.value)
      : null
  }

  render() {
    return (
      <>
        <Swatch
          onClick={this.handleClick}
          colorRGBA={this.colorRGBA}
          colorFormat={this.colorFormat}
        />
        {this.state.displayColorPicker ? (
          <Popover>
            <Cover onClick={this.handleClose} />
            <SketchPicker
              presetColors={[...this.presetColors, nullColor]}
              color={this.colorRGBA || { r: 0, g: 0, b: 0, a: 0 }}
              onChange={this.handleChange}
              disableAlpha={true}
            />{' '}
          </Popover>
        ) : null}{' '}
      </>
    )
  }
}
