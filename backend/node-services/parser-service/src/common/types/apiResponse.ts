export type ApiSuccessResponse<DATA> = {
  success: true;
  status_code: number;
  data: DATA;
};

export type ApiErrorResponse<ERROR = string> = {
  success: false;
  status_code: number;
  error: ERROR;
};

export type ApiResponse<DATA, ERROR = string> =
  ApiSuccessResponse<DATA> | ApiErrorResponse<ERROR>;
