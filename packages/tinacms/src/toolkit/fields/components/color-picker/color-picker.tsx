import * as React from 'react'
import { useState } from 'react'
import { Dismissible } from '@toolkit/react-dismissible'
import * as pkg from 'react-color'
const { SketchPicker, BlockPicker } = pkg
import { ColorRGBA, ColorFormat, ColorFormatter } from './color-formatter'
import { useFormPortal } from '@toolkit/form-builder'

type DivProps = any
type WrappedFieldProps = any
interface SwatchProps extends DivProps {
  colorRGBA?: ColorRGBA
  onClick: (_event: React.SyntheticEvent) => void
  colorFormat: ColorFormat
}

const GetTextColorForBackground = function (backgroundColor?: ColorRGBA) {
  //fudgy rgb values found on the internets
  return !backgroundColor ||
    backgroundColor.r * 0.299 +
      backgroundColor.g * 0.587 +
      backgroundColor.b * 0.114 >
      186
    ? '#000000'
    : '#ffffff'
}

const Swatch = ({
  colorRGBA,
  colorFormat,
  unselectable,
  ...props
}: SwatchProps) => (
  <div
    className="bg-gray-100 rounded-3xl shadow-[0_2px_3px_rgba(0,0,0,0.12)] cursor-pointer w-full m-0"
    {...props}
  >
    <div
      className="swatch-inner flex items-center justify-center text-[13px] font-bold w-full h-10 rounded-3xl hover:opacity-[.6]"
      style={{
        background: colorRGBA
          ? `rgba(${colorRGBA.r}, ${colorRGBA.g}, ${colorRGBA.b}, ${colorRGBA.a})`
          : `#fff`,
        color: GetTextColorForBackground(colorRGBA),
        transition: 'all var(--tina-timing-short) ease-out',
      }}
    >
      {!colorRGBA
        ? 'Click to add color'
        : ColorFormatter[colorFormat].getLabel(colorRGBA)}
    </div>
  </div>
)

const Popover = ({
  triggerBoundingBox,
  openTop,
  className = '',
  style = {},
  ...props
}) => (
  <div
    className={`fixed z-50 before:content-[""] before:absolute before:left-1/2 before:-translate-x-1/2 before:w-[18px] before:h-[14px] before:bg-gray-200 before:z-10 after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[13px] after:bg-white after:z-20 ${
      openTop
        ? 'before:bottom-0 before:mt-[1px] before:translate-y-full color-picker-on-top-clip-path after:bottom-0 after:mb-0.5 after:translate-y-full'
        : 'before:top-0 before:mb-[1px] before:-translate-y-full color-picker-clip-path after:top-0 after:mt-0.5 after:-translate-y-full'
    } ${className}`}
    style={{
      top: triggerBoundingBox
        ? openTop
          ? triggerBoundingBox.top
          : triggerBoundingBox.bottom
        : 0,
      left: triggerBoundingBox
        ? triggerBoundingBox.left + triggerBoundingBox.width / 2
        : 0,
      transform: openTop
        ? 'translate3d(-50%, calc(-100% - 8px), 0) scale3d(1, 1, 1)'
        : 'translate3d(-50%, 8px, 0) scale3d(1, 1, 1)',
      animation: `${
        openTop ? 'color-popup-open-top-keyframes' : 'color-popup-keyframes'
      } 85ms ease-out both 1`,
      transformOrigin: `50% ${openTop ? '100%' : '0'}`,
      ...style,
    }}
    {...props}
  />
)

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
  onChange: (_pickerColor: any) => void
  disableAlpha?: boolean
  width: string
}

const SketchWidget: React.FC<WidgetProps> = (props) => (
  <SketchPicker
    presetColors={props.presetColors}
    color={props.color}
    onChange={props.onChange}
    disableAlpha={props.disableAlpha}
    width={props.width}
  />
)
const BlockWidget: React.FC<WidgetProps> = (props) => (
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

  const getColorFormat = (
    colorFormat || ColorFormat.Hex
  ).toLowerCase() as ColorFormat
  const getColorRGBA = input.value
    ? ColorFormatter[getColorFormat].parse(input.value)
    : null

  const handleChange = (pickerColor: any) => {
    const color = (
      pickerColor.hex === nullColor ? null : { ...pickerColor.rgb, a: 1 }
    ) as ColorRGBA | null
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
    <div className="relative" ref={triggerRef}>
      <Swatch
        onClick={toggleColorPicker}
        colorRGBA={getColorRGBA}
        colorFormat={getColorFormat}
      />
      {displayColorPicker && (
        <FormPortal>
          {({ zIndexShift }) => (
            <Popover
              openTop={openTop}
              triggerBoundingBox={triggerBoundingBox}
              style={{ zIndex: 5000 + zIndexShift }}
            >
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
          )}
        </FormPortal>
      )}
    </div>
  )
}
