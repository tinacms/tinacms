import { formatCurrentDate } from './date-time-picker';

describe('formatCurrentDate', () => {
  it('formats date with default formats', () => {
    const formatted = formatCurrentDate({
      displayDate: new Date(2024, 5, 15, 12, 0, 0),
      dateFormat: 'MMMM DD YYYY',
      timeFormat: 'hh:mm A',
    });
    expect(formatted).toBe('June 15 2024 12:00 PM');
  });
  it('formats date with date only', () => {
    const formatted = formatCurrentDate({
      displayDate: new Date(2024, 5, 15, 12, 0, 0),
      dateFormat: 'MMMM DD YYYY',
    });
    expect(formatted).toBe('June 15 2024');
  });
  it('formats 24 hour time', () => {
    const formatted = formatCurrentDate({
      displayDate: new Date(2024, 5, 15, 23, 0, 0),
      dateFormat: 'MMMM DD YYYY',
      timeFormat: 'HH',
    });
    expect(formatted).toBe('June 15 2024 23');
  });
});
