import { describe, expect, it } from 'vitest';
import {
  checkerboardStyle,
  expandHex,
  hexToRgb,
  isValidHex,
  rgbToHex,
} from './color-utils';

describe('color-utils', () => {
  describe('isValidHex', () => {
    it('returns true for valid hex colors', () => {
      expect(isValidHex('#FF0000')).toBe(true);
      expect(isValidHex('#00FF00')).toBe(true);
      expect(isValidHex('#000000')).toBe(true);
    });

    it('returns true for shorthand hex colors', () => {
      expect(isValidHex('#F00')).toBe(true);
      expect(isValidHex('#abc')).toBe(true);
    });

    it('returns false for invalid hex colors', () => {
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('FF0000')).toBe(false);
      expect(isValidHex('#GGGGGG')).toBe(false);
      expect(isValidHex('#GGG')).toBe(false);
      expect(isValidHex('red')).toBe(false);
    });
  });

  describe('expandHex', () => {
    it('expands shorthand hex to full uppercase', () => {
      expect(expandHex('#F00')).toBe('#FF0000');
      expect(expandHex('#0F0')).toBe('#00FF00');
      expect(expandHex('#00F')).toBe('#0000FF');
      expect(expandHex('#abc')).toBe('#AABBCC');
    });

    it('normalizes full hex to uppercase', () => {
      expect(expandHex('#ff0000')).toBe('#FF0000');
      expect(expandHex('#ABC123')).toBe('#ABC123');
    });
  });

  describe('hexToRgb', () => {
    it('converts valid hex to rgb', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('handles hex in any case', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#Ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('converts black and white', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('converts shorthand hex to rgb', () => {
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#abc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('')).toBeNull();
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GGG')).toBeNull();
      expect(hexToRgb('#12345')).toBeNull();
      expect(hexToRgb('FF0000')).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts rgb to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00FF00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000FF');
    });

    it('converts black and white', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    });

    it('pads single digit hex values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
    });
  });

  describe('hexToRgb and rgbToHex round-trip', () => {
    it('converts hex to rgb and back', () => {
      const originalHex = '#ABC123';
      const rgb = hexToRgb(originalHex);
      expect(rgb).not.toBeNull();
      const resultHex = rgbToHex(rgb!.r, rgb!.g, rgb!.b);
      expect(resultHex).toBe(originalHex);
    });
  });

  describe('checkerboardStyle', () => {
    it('returns an object with background properties', () => {
      const style = checkerboardStyle();
      expect(style).toHaveProperty('backgroundImage');
      expect(style).toHaveProperty('backgroundSize');
      expect(style).toHaveProperty('backgroundPosition');
    });

    it('uses custom size parameter', () => {
      const style = checkerboardStyle(16);
      expect(style.backgroundSize).toContain('16px');
    });
  });
});
