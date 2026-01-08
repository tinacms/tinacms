export const TRANSPARENT = 'transparent';

export const isValidHex = (value: string): boolean =>
  /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

export const expandHex = (hex: string): string => {
  const h = hex.replace('#', '');
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toUpperCase();
  }
  return `#${h.toUpperCase()}`;
};

export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  if (!hex || !isValidHex(hex)) return null;
  const expanded = expandHex(hex).replace('#', '');
  return {
    r: parseInt(expanded.substring(0, 2), 16),
    g: parseInt(expanded.substring(2, 4), 16),
    b: parseInt(expanded.substring(4, 6), 16),
  };
};

/**
 * Converts RGB color values to a hex color string (e.g., "#FF0000" for red).
 *
 * How it works:
 * We need to convert three numbers (r, g, b) each ranging 0-255 into a 6-digit hex string.
 * For example: rgb(255, 128, 0) should become "#FF8000"
 *
 * The bit-shifting approach combines all three values into one number:
 * - (1 << 24) = 16777216 (0x1000000) - This adds a leading '1' to guarantee we always
 *   get 7 hex digits, which we later remove. Without this, rgb(0, 0, 255) would give
 *   us "FF" instead of "0000FF".
 * - (r << 16) shifts red left by 16 bits, placing it in positions for the first two hex digits
 * - (g << 8) shifts green left by 8 bits, placing it in positions for the middle two hex digits
 * - b stays as-is, occupying the last two hex digits
 *
 * Example with rgb(255, 128, 0):
 *   16777216 + (255 << 16) + (128 << 8) + 0
 *   = 16777216 + 16711680 + 32768 + 0
 *   = 33521664
 *   = 0x1FF8000 (as hex string: "1FF8000")
 *   After slice(1): "FF8000"
 *   Final result: "#FF8000"
 */
export const rgbToHex = (r: number, g: number, b: number): string =>
  `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

export const checkerboardStyle = (size = 8) => ({
  backgroundImage:
    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
  backgroundSize: `${size}px ${size}px`,
  backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px`,
});
