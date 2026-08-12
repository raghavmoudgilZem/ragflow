import { describe, it, expect } from 'vitest';
import { convertKeysToSnakeCase } from './case-convert';

describe('convertKeysToSnakeCase', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(convertKeysToSnakeCase({ userName: 'ada', pageSize: 20 })).toEqual({
      user_name: 'ada',
      page_size: 20,
    });
  });

  it('leaves already snake_case keys unchanged', () => {
    expect(convertKeysToSnakeCase({ current_page: 1 })).toEqual({ current_page: 1 });
  });

  it('converts keys in nested objects', () => {
    expect(convertKeysToSnakeCase({ outerKey: { innerKey: 'value' } })).toEqual({
      outer_key: { inner_key: 'value' },
    });
  });

  it('converts keys for objects inside arrays', () => {
    expect(convertKeysToSnakeCase([{ firstName: 'a' }, { firstName: 'b' }])).toEqual([
      { first_name: 'a' },
      { first_name: 'b' },
    ]);
  });

  it('returns primitives untouched', () => {
    expect(convertKeysToSnakeCase('text')).toBe('text');
    expect(convertKeysToSnakeCase(42)).toBe(42);
    expect(convertKeysToSnakeCase(null)).toBeNull();
    expect(convertKeysToSnakeCase(undefined)).toBeUndefined();
  });

  it('does not recurse into FormData', () => {
    const formData = new FormData();
    formData.append('fileName', 'doc.pdf');
    expect(convertKeysToSnakeCase(formData)).toBe(formData);
  });

  it('does not recurse into Date instances', () => {
    const date = new Date('2026-06-17T00:00:00.000Z');
    expect(convertKeysToSnakeCase(date)).toBe(date);
  });

  it('keeps digits attached to the preceding segment', () => {
    expect(convertKeysToSnakeCase({ field2Name: 'a', addressLine1: 'b' })).toEqual({
      field2_name: 'a',
      address_line1: 'b',
    });
  });

  it('leaves non-letter characters untouched', () => {
    expect(convertKeysToSnakeCase({ 'user.id': 1, 'meta-data': 2 })).toEqual({
      'user.id': 1,
      'meta-data': 2,
    });
  });

  it('does not prefix a leading capital with an underscore', () => {
    expect(convertKeysToSnakeCase({ UserName: 'ada' })).toEqual({ user_name: 'ada' });
  });

  it('converts non-ASCII Latin uppercase letters', () => {
    expect(convertKeysToSnakeCase({ totalÉuros: 1 })).toEqual({ 'total_éuros': 1 });
  });
});
