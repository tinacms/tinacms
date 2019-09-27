import * as React from 'react'
import { SketchPicker } from 'react-color'

import styled, { keyframes } from 'styled-components'
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
  background: ${p => p.theme.color.light};
  border-radius: ${p => p.theme.radius.big};
  box-shadow: ${p => p.theme.shadow.small};
  cursor: pointer;
  width: 100%;
  margin: 0;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.8rem;
    font-weight: bold;

    width: 100%;
    height: 2.5rem;
    border-radius: ${p => p.theme.radius.big};
    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.075);
    background: ${props =>
      props.colorRGBA
        ? `rgba(${props.colorRGBA.r}, ${props.colorRGBA.g}, ${props.colorRGBA.b}, ${props.colorRGBA.a})`
        : `#fff`};
    color: ${props => GetTextColorForBackground(props.colorRGBA)};
    transition: all ${p => p.theme.timing.short} ease-out;
  }

  &:hover {
    > div {
      opacity: 0.6;
    }
  }
`

const ColorPopupKeyframes = keyframes`
  0% {
    transform: translate3d(-50%, 5px, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, 5px, 0) scale3d(1, 1, 1);
  }
`

export const Popover = styled.div`
  position: absolute;
  left: 50%;
  transform: translate3d(-50%, 5px, 0) scale3d(1, 1, 1);
  transform-origin: 50% -0.5rem;
  animation: ${ColorPopupKeyframes} 85ms ease-out both 1;
  z-index: 900;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    margin-top: 2px;
    transform: translate3d(-50%, -100%, 0);
    width: 1rem;
    height: 0.8rem;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: white;
    z-index: 100;
  }
`

export const Cover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 800;
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
          <>
            <Popover>
              <SketchPicker
                presetColors={[...this.presetColors, nullColor]}
                color={this.colorRGBA || { r: 0, g: 0, b: 0, a: 0 }}
                onChange={this.handleChange}
                disableAlpha={true}
                width={'240px'}
              />{' '}
            </Popover>
            <Cover onClick={this.handleClose} />
          </>
        ) : null}{' '}
      </>
    )
  }
}
