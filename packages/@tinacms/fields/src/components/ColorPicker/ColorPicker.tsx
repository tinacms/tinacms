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
import { useState } from 'react'
import { Dismissible } from 'react-dismissible'
import { SketchPicker, BlockPicker } from 'react-color'
import styled, { css, keyframes } from 'styled-components'
import { ColorRGBA, ColorFormat, ColorFormatter } from './color-formatter'
import { useFormPortal } from '@tinacms/react-forms'

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
  background: var(--tina-color-grey-2);
  border-radius: var(--tina-radius-big);
  box-shadow: var(--tina-shadow-small);
  cursor: pointer;
  width: 100%;
  margin: 0;

  > div {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: var(--tina-font-size-1);
    font-weight: bold;

    width: 100%;
    height: 40px;
    border-radius: var(--tina-radius-big);
    box-shadow: inset 0 0 1px 1px rgba(0, 0, 0, 0.075);
    background: ${props =>
      props.colorRGBA
        ? `rgba(${props.colorRGBA.r}, ${props.colorRGBA.g}, ${props.colorRGBA.b}, ${props.colorRGBA.a})`
        : `#fff`};
    color: ${props => GetTextColorForBackground(props.colorRGBA)};
    transition: all var(--tina-timing-short) ease-out;
  }

  &:hover {
    > div {
      opacity: 0.6;
    }
  }
`

const ColorPopupKeyframes = keyframes`
  0% {
    transform: translate3d(-50%, 0, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  }
`

const ColorPopupOpenTopKeyframes = keyframes`
  0% {
    transform: translate3d(-50%, -100%, 0) scale3d(0.5,0.5,1)
  }
  100% {
    transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
  }
`

export const Popover = styled.div<{
  triggerBoundingBox: any
  openTop: boolean
}>`
  position: fixed;
  top: ${props =>
    props.triggerBoundingBox ? props.triggerBoundingBox.bottom : '0'}px;
  left: ${props =>
    props.triggerBoundingBox
      ? props.triggerBoundingBox.left + props.triggerBoundingBox.width / 2
      : '0'}px;
  transform: translate3d(-50%, 8px, 0) scale3d(1, 1, 1);
  transform-origin: 50% 0;
  animation: ${ColorPopupKeyframes} 85ms ease-out both 1;
  z-index: var(--tina-z-index-5);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    margin-top: 1px;
    transform: translate3d(-50%, -100%, 0);
    width: 18px;
    height: 14px;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: var(--tina-color-grey-3);
    z-index: var(--tina-z-index-1);
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    margin-top: 2px;
    transform: translate3d(-50%, -100%, 0);
    width: 16px;
    height: 13px;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background-color: white;
    z-index: var(--tina-z-index-2);
  }

  ${props =>
    props.openTop &&
    css`
      top: ${props.triggerBoundingBox ? props.triggerBoundingBox.top : '0'}px;
      transform: translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1);
      animation: ${ColorPopupOpenTopKeyframes} 85ms ease-out both 1;
      transform-origin: 50% 100%;

      &:before,
      &:after {
        top: auto;
        bottom: 0;
        transform: translate3d(-50%, 100%, 0);
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
      }

      &:before {
        margin-top: 0;
        margin-bottom: 1px;
      }

      &:after {
        margin-top: 0;
        margin-bottom: 2px;
      }
    `};
`

export const Cover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: var(--tina-z-index-1);
`

const ColorPickerWrapper = styled.div`
  position: relative;
`

interface Props {
  colorFormat: ColorFormat
  userColors: string[]
  widget?: 'sketch' | 'block'
  input: WrappedFieldProps['input']
}

const nullColor = 'transparent'

const presetColors = [
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

interface WidgetProps {
  presetColors: string[]
  color: ColorRGBA
  onChange: (pickerColor: any) => void
  disableAlpha?: boolean
  width: string
}

const SketchWidget: React.FC<WidgetProps> = props => (
  <SketchPicker
    presetColors={props.presetColors}
    color={props.color}
    onChange={props.onChange}
    disableAlpha={props.disableAlpha}
    width={props.width}
  />
)
const BlockWidget: React.FC<WidgetProps> = props => (
  <BlockPicker
    colors={props.presetColors}
    color={props.color}
    onChange={props.onChange}
    width={props.width}
  />
)

const WIDGETS = { sketch: SketchWidget, block: BlockWidget }

export const ColorPicker: React.FC<Props> = ({
  colorFormat,
  userColors = presetColors,
  widget = 'sketch',
  input,
}) => {
  const FormPortal = useFormPortal()
  const triggerRef = React.useRef<HTMLDivElement | null>(null)
  const [triggerBoundingBox, setTriggerBoundingBox] = useState<any>(null)
  const [openTop, setOpenTop] = useState<boolean>(false)

  const updateTriggerBoundingBox = () => {
    if (triggerRef.current) {
      setTriggerBoundingBox(triggerRef.current.getBoundingClientRect())
    }
  }

  React.useEffect(() => {
    if (triggerBoundingBox) {
      const triggerOffsetTop =
        triggerBoundingBox.top + triggerBoundingBox.height / 2
      const windowHeight = window.innerHeight
      if (triggerOffsetTop > windowHeight / 2) {
        setOpenTop(true)
      } else {
        setOpenTop(false)
      }
    }
  }, [triggerBoundingBox])

  React.useEffect(() => {
    const delay = 100
    let timeout: any = false

    setTimeout(() => {
      updateTriggerBoundingBox()
    }, delay)

    const handleResize = () => {
      clearTimeout(timeout)
      timeout = setTimeout(updateTriggerBoundingBox, delay)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [triggerRef.current])

  const Widget = WIDGETS[widget]
  if (!Widget) throw new Error('You must specify a widget type.')

  const [displayColorPicker, setDisplayColorPicker] = useState(false)

  const getColorFormat = (colorFormat || ColorFormat.Hex).toLowerCase()
  const getColorRGBA = input.value
    ? ColorFormatter[getColorFormat].parse(input.value)
    : null

  const handleChange = (pickerColor: any) => {
    const color = (pickerColor.hex === nullColor
      ? null
      : { ...pickerColor.rgb, a: 1 }) as ColorRGBA | null
    input.onChange(
      color ? ColorFormatter[getColorFormat].getValue(color) : null
    )
  }

  const toggleColorPicker = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    const display = !displayColorPicker
    setDisplayColorPicker(display)
    if (display) {
      updateTriggerBoundingBox()
    }
  }

  return (
    <ColorPickerWrapper ref={triggerRef}>
      <Swatch
        onClick={toggleColorPicker}
        colorRGBA={getColorRGBA}
        colorFormat={getColorFormat}
      />
      {displayColorPicker && (
        <FormPortal>
          <Popover openTop={openTop} triggerBoundingBox={triggerBoundingBox}>
            <Dismissible
              click
              escape
              disabled={!displayColorPicker}
              onDismiss={toggleColorPicker}
            >
              <Widget
                presetColors={[...userColors, nullColor]}
                color={getColorRGBA || { r: 0, g: 0, b: 0, a: 0 }}
                onChange={handleChange}
                disableAlpha={true}
                width={'240px'}
              />
            </Dismissible>
          </Popover>
        </FormPortal>
      )}
    </ColorPickerWrapper>
  )
}
