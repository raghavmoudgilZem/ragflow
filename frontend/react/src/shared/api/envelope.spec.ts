import { describe, it, expect } from 'vitest';
import {
  HttpStatus,
  isSuccess,
  isUnauthorized,
  getErrorMessage,
  unwrapEnvelope,
} from './envelope';
import type { ApiResponse } from './envelope';
import { ApiErrorMessage } from './errorMessages';

describe('HttpStatus', () => {
  it('Ok equals 200', () => {
    expect(HttpStatus.Ok).toBe(200);
  });

  it('Unauthorized equals 401', () => {
    expect(HttpStatus.Unauthorized).toBe(401);
  });
});

describe('isSuccess', () => {
  it('returns true when success is true', () => {
    const envelope: ApiResponse<string> = {
      success: true,
      status_code: 200,
      errors: [],
      data: 'payload',
    };
    expect(isSuccess(envelope)).toBe(true);
  });

  it('returns false when success is false', () => {
    const envelope: ApiResponse<unknown> = {
      success: false,
      status_code: 400,
      errors: ['failed'],
      data: null,
    };
    expect(isSuccess(envelope)).toBe(false);
  });
});

describe('isUnauthorized', () => {
  it('returns true when status_code is Unauthorized', () => {
    const envelope: ApiResponse<unknown> = {
      success: false,
      status_code: 401,
      errors: ['auth required'],
      data: null,
    };
    expect(isUnauthorized(envelope)).toBe(true);
  });

  it('returns false for any other status_code', () => {
    const envelope: ApiResponse<string> = {
      success: true,
      status_code: 200,
      errors: [],
      data: 'ok',
    };
    expect(isUnauthorized(envelope)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('joins multiple errors with a comma', () => {
    expect(getErrorMessage(['name required', 'too long'])).toBe(
      'name required, too long',
    );
  });

  it('returns the fallback when errors is empty', () => {
    expect(getErrorMessage([], 'fallback message')).toBe('fallback message');
  });

  it('returns the fallback when errors is undefined', () => {
    expect(getErrorMessage(undefined, 'fallback message')).toBe(
      'fallback message',
    );
  });

  it('returns an empty string when no fallback is provided', () => {
    expect(getErrorMessage([])).toBe('');
  });
});

describe('unwrapEnvelope', () => {
  it('returns the data when success is true', () => {
    const envelope: ApiResponse<{ total: number }> = {
      success: true,
      status_code: 200,
      errors: [],
      data: { total: 3 },
    };
    expect(unwrapEnvelope(envelope)).toEqual({ total: 3 });
  });

  it('returns falsy data untouched when success is true', () => {
    const envelope: ApiResponse<number> = {
      success: true,
      status_code: 200,
      errors: [],
      data: 0,
    };
    expect(unwrapEnvelope(envelope)).toBe(0);
  });

  it('throws the joined errors when success is false', () => {
    const envelope: ApiResponse<unknown> = {
      success: false,
      status_code: 400,
      errors: ['name required', 'too long'],
      data: null,
    };
    expect(() => unwrapEnvelope(envelope)).toThrow('name required, too long');
  });

  it('throws the fallback message when success is false without errors', () => {
    const envelope: ApiResponse<unknown> = {
      success: false,
      status_code: 500,
      errors: [],
      data: null,
    };
    expect(() => unwrapEnvelope(envelope)).toThrow(
      ApiErrorMessage.requestFailed,
    );
  });
});
