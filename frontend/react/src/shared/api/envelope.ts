import { ApiErrorMessage } from './errorMessages';

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  errors: string[];
  data: T;
}
export interface PaginatedData<T> {
  total: number;
  pageSize: number;
  currentPage: number;
  list: T[];
}

export const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  Unauthorized: 401,
} as const;

export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];

export const isSuccess = <T>(envelope: ApiResponse<T>): boolean =>
  envelope.success;

export const isUnauthorized = <T>(envelope: ApiResponse<T>): boolean =>
  envelope.statusCode === HttpStatus.Unauthorized;

export const getErrorMessage = (errors?: string[], fallback = ''): string =>
  errors && errors.length > 0 ? errors.join(', ') : fallback;

export const unwrapEnvelope = <T>(envelope: ApiResponse<T>): T => {
  if (!isSuccess(envelope)) {
    throw new Error(
      getErrorMessage(envelope.errors, ApiErrorMessage.requestFailed),
    );
  }
  return envelope.data;
};
