export function testResponseEnvelop<T>(
  statusCode: number,
  data: any,
): { status_code: number; success: boolean; data: T } {
  return {
    status_code: statusCode,
    success: true,
    data,
  };
}
