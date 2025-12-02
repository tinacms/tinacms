import { describe, it, expect } from 'vitest';
import { ColorFormatter, ColorFormat, ColorRGBA } from './color-formatter';

describe('ColorFormatter', () => {
  const redRGBA: ColorRGBA = { r: 255, g: 0, b: 0, a: 1 };
  const greenRGBA: ColorRGBA = { r: 0, g: 255, b: 0, a: 1 };
  const blueRGBA: ColorRGBA = { r: 0, g: 0, b: 255, a: 1 };

  describe('hex format', () => {
    const hexFormatter = ColorFormatter[ColorFormat.Hex];

    describe('getLabel', () => {
      it('returns hex string for color', () => {
        expect(hexFormatter.getLabel(redRGBA)).toBe('#ff0000');
        expect(hexFormatter.getLabel(greenRGBA)).toBe('#00ff00');
        expect(hexFormatter.getLabel(blueRGBA)).toBe('#0000ff');
      });
    });

    describe('getValue', () => {
      it('returns hex value for color', () => {
        expect(hexFormatter.getValue(redRGBA)).toBe('#FF0000');
      });
    });

    describe('parse', () => {
      it('parses hex string to RGBA', () => {
        expect(hexFormatter.parse('#FF0000')).toEqual(redRGBA);
        expect(hexFormatter.parse('#00FF00')).toEqual(greenRGBA);
      });

      it('parses lowercase hex', () => {
        expect(hexFormatter.parse('#ff0000')).toEqual(redRGBA);
      });

      it('returns null for undefined or empty', () => {
        expect(hexFormatter.parse(undefined)).toBeNull();
        expect(hexFormatter.parse('')).toBeNull();
      });

      it('returns null for invalid color string', () => {
        expect(hexFormatter.parse('invalid')).toBeNull();
      });
    });
  });

  describe('rgb format', () => {
    const rgbFormatter = ColorFormatter[ColorFormat.RGB];

    describe('getLabel', () => {
      it('returns rgb label string', () => {
        expect(rgbFormatter.getLabel(redRGBA)).toBe('R255 G0 B0');
        expect(rgbFormatter.getLabel(greenRGBA)).toBe('R0 G255 B0');
      });
    });

    describe('getValue', () => {
      it('returns rgb value string', () => {
        const value = rgbFormatter.getValue(redRGBA);
        expect(value).toMatch(/rgb/i);
        expect(value).toContain('255');
      });
    });

    describe('parse', () => {
      it('parses rgb string to RGBA', () => {
        expect(rgbFormatter.parse('rgb(255, 0, 0)')).toEqual(redRGBA);
      });

      it('parses rgba string', () => {
        const result = rgbFormatter.parse('rgba(255, 0, 0, 0.5)');
        expect(result).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
      });

      it('returns null for undefined or empty', () => {
        expect(rgbFormatter.parse(undefined)).toBeNull();
        expect(rgbFormatter.parse('')).toBeNull();
      });
    });
  });
});
