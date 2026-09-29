import { describe, expect, it } from 'vitest';
import { isSafeCssColor } from './sanitize-css-color';

describe('isSafeCssColor', () => {
  it.each([
    '#abc',
    '#abcd',
    '#CC4141',
    '#CC414180',
    'red',
    'rebeccapurple',
    'rgb(204, 65, 65)',
    'rgba(204 65 65 / 50%)',
    'hsl(0, 55%, 53%)',
    'hsla(0 55% 53% / 0.5)',
    'oklch(0.63 0.19 25)',
    'oklab(0.6 0.1 -0.05)',
    'var(--brand-red)',
  ])('accepts %s', (value) => {
    expect(isSafeCssColor(value)).toBe(true);
  });

  it.each([
    '',
    '#abcde',
    'red;position:fixed',
    'red; background: url(https://evil/x)',
    'url(https://evil/x)',
    'rgb(1,2,3);color:red',
    'rgb(calc(1)){',
    'var(--x);',
    '"red"',
    "'red'",
    'red\\',
    '<red>',
    'expression(alert(1))',
    'dark red',
  ])('rejects %s', (value) => {
    expect(isSafeCssColor(value)).toBe(false);
  });
});
