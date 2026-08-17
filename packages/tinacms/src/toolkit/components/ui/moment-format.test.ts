import { describe, expect, it } from 'vitest';
import { momentToDateFns } from './moment-format';

describe('momentToDateFns', () => {
  it("converts 'MMM DD, YYYY' (default date format)", () => {
    expect(momentToDateFns('MMM DD, YYYY')).toBe('MMM dd, yyyy');
  });

  it("converts 'h:mm A' (default time format)", () => {
    expect(momentToDateFns('h:mm A')).toBe('h:mm a');
  });

  it("converts 'MMMM DD YYYY'", () => {
    expect(momentToDateFns('MMMM DD YYYY')).toBe('MMMM dd yyyy');
  });

  it("converts 'hh:mm A'", () => {
    expect(momentToDateFns('hh:mm A')).toBe('hh:mm a');
  });

  it("converts 'HH' (24h hour only)", () => {
    expect(momentToDateFns('HH')).toBe('HH');
  });

  it("converts 'YYYY-MM-DD'", () => {
    expect(momentToDateFns('YYYY-MM-DD')).toBe('yyyy-MM-dd');
  });

  it("converts 'dddd' (full weekday name)", () => {
    expect(momentToDateFns('dddd')).toBe('EEEE');
  });

  it("converts 'ddd' (short weekday name)", () => {
    expect(momentToDateFns('ddd')).toBe('EEE');
  });

  it("converts '[on] MMM D' (literal escape)", () => {
    expect(momentToDateFns('[on] MMM D')).toBe("'on' MMM d");
  });

  it("converts '[it\\'s] YYYY' (single quote inside literal)", () => {
    expect(momentToDateFns("[it's] YYYY")).toBe("'it''s' yyyy");
  });

  it('passes through non-letter characters unchanged', () => {
    expect(momentToDateFns('YYYY/MM/DD')).toBe('yyyy/MM/dd');
  });

  it("converts 'Do' (ordinal day)", () => {
    expect(momentToDateFns('Do')).toBe('do');
  });
});
