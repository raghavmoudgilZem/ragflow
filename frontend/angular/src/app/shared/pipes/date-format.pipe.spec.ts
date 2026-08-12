import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a timestamp correctly', () => {
    const timestamp = new Date('2024-02-20T17:27:28').getTime();
    const result = pipe.transform(timestamp);
    expect(result).toBe('20/02/2024 17:27:28');
  });

  it('should format a Date object correctly', () => {
    const date = new Date('2024-02-20T17:27:28');
    const result = pipe.transform(date);
    expect(result).toBe('20/02/2024 17:27:28');
  });

  it('should format with date-only format', () => {
    const timestamp = new Date('2024-02-20T17:27:28').getTime();
    const result = pipe.transform(timestamp, 'date-only');
    expect(result).toBe('20/02/2024');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(pipe.transform('invalid')).toBe('');
  });

  it('should pad single digit numbers with zero', () => {
    const date = new Date('2024-01-05T09:05:03');
    const result = pipe.transform(date);
    expect(result).toBe('05/01/2024 09:05:03');
  });
});
