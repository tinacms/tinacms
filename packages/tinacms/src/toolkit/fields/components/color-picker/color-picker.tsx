import { useFormPortal } from '@toolkit/form-builder';
import { Dismissible } from '@toolkit/react-dismissible';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { BlockWidget } from './block-widget';
import { ColorFormat, ColorFormatter, ColorRGBA } from './color-formatter';
import { TRANSPARENT, hexToRgb, rgbToHex } from './color-utils';
import { SketchWidget } from './sketch-widget';

interface FieldInput {
  value: string | null;
  onChange: (value: string | null) => void;
}

interface SwatchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  colorRGBA?: ColorRGBA;
  onClick: (_event: React.SyntheticEvent) => void;
  colorFormat: ColorFormat;
  width?: string;
}

const isLightBackground = function (backgroundColor?: ColorRGBA) {
  return (
    !backgroundColor ||
    backgroundColor.r * 0.299 +
      backgroundColor.g * 0.587 +
      backgroundColor.b * 0.114 >
      186
  );
};

const getTextColorForBackground = function (backgroundColor?: ColorRGBA) {
  return isLightBackground(backgroundColor) ? '#000000' : '#FFFFFF';
};

const Swatch = ({ colorRGBA, colorFormat, width, ...props }: SwatchProps) => (
  <button
    type='button'
    className='bg-gray-100 rounded shadow-[0_2px_3px_rgba(0,0,0,0.12)] cursor-pointer m-0 p-0 border-0'
    style={width ? { width: width } : undefined}
    {...props}
  >
    <div
      className='swatch-inner flex items-center justify-center text-[13px] font-bold w-full h-10 rounded hover:opacity-[.6]'
      style={{
        background: colorRGBA
          ? `rgba(${colorRGBA.r}, ${colorRGBA.g}, ${colorRGBA.b}, ${colorRGBA.a})`
          : `#fff`,
        color: getTextColorForBackground(colorRGBA),
        transition: 'all var(--tina-timing-short) ease-out',
      }}
    >
      {!colorRGBA
        ? 'Click to add color'
        : ColorFormatter[colorFormat].getLabel(colorRGBA)}
    </div>
  </button>
);

const Popover = ({
  triggerBoundingBox,
  openTop,
  className = '',
  style = {},
  ...props
}) => (
  <div
    className={`fixed z-50 before:content-[""] before:absolute before:left-1/2 before:-translate-x-1/2 before:w-[18px] before:h-[14px] before:bg-white before:z-10 after:content-[""] after:absolute after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[13px] after:bg-white after:z-20 ${
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
      animation: `${openTop ? 'color-popup-open-top-keyframes' : 'color-popup-keyframes'} 85ms ease-out both 1`,
      transformOrigin: `50% ${openTop ? '100%' : '0'}`,
      ...style,
    }}
    {...props}
  />
);

interface Props {
  colorFormat: ColorFormat;
  userColors: string[];
  widget?: 'sketch' | 'block';
  width?: string;
  input: FieldInput;
}

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
];

const WIDGETS = { sketch: SketchWidget, block: BlockWidget };

export const ColorPicker: React.FC<Props> = ({
  colorFormat,
  userColors = presetColors,
  widget = 'sketch',
  width,
  input,
}) => {
  const FormPortal = useFormPortal();
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const [triggerBoundingBox, setTriggerBoundingBox] = useState<any>(null);
  const [openTop, setOpenTop] = useState(false);
  const [displayColorPicker, setDisplayColorPicker] = useState(false);

  const updateTriggerBoundingBox = () => {
    if (triggerRef.current)
      setTriggerBoundingBox(triggerRef.current.getBoundingClientRect());
  };

  React.useEffect(() => {
    if (triggerBoundingBox) {
      setOpenTop(
        triggerBoundingBox.top + triggerBoundingBox.height / 2 >
          window.innerHeight / 2
      );
    }
  }, [triggerBoundingBox]);

  React.useEffect(() => {
    const delay = 100;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    timeout = setTimeout(updateTriggerBoundingBox, delay);
    const handleResize = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(updateTriggerBoundingBox, delay);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColorFormat = (
    colorFormat || ColorFormat.Hex
  ).toLowerCase() as ColorFormat;
  const getColorRGBA = input.value
    ? ColorFormatter[getColorFormat].parse(input.value)
    : null;
  const currentHexColor = getColorRGBA
    ? rgbToHex(getColorRGBA.r, getColorRGBA.g, getColorRGBA.b)
    : '';

  const handleChange = useCallback(
    (hexColor: string | null) => {
      if (!hexColor) {
        input.onChange(null);
        return;
      }
      const rgb = hexToRgb(hexColor);
      if (rgb)
        input.onChange(
          ColorFormatter[getColorFormat].getValue({ ...rgb, a: 1 })
        );
    },
    [getColorFormat, input]
  );

  const toggleColorPicker = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    const display = !displayColorPicker;
    setDisplayColorPicker(display);
    if (display) updateTriggerBoundingBox();
  };

  const Widget = WIDGETS[widget];
  if (!Widget) throw new Error('You must specify a widget type.');

  return (
    <div
      className='relative'
      ref={triggerRef}
      style={width ? { width: width } : undefined}
    >
      <Swatch
        onClick={toggleColorPicker}
        colorRGBA={getColorRGBA}
        colorFormat={getColorFormat}
        width={width}
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
                  presetColors={[...userColors, TRANSPARENT]}
                  color={currentHexColor}
                  onChange={handleChange}
                  width={width || '240px'}
                />
              </Dismissible>
            </Popover>
          )}
        </FormPortal>
      )}
    </div>
  );
};
