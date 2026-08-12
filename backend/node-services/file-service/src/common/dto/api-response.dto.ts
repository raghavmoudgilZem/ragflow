export class ApiResponseDto<T> {
  success: boolean;
  status_code: number;
  error: unknown;
  data: T;
}
