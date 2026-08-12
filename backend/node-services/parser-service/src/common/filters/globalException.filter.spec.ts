import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './globalException.filter';

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    getType: () => 'http',
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'POST', path: '/api/v1/parse' }),
    }),
  } as unknown as ArgumentsHost;

  beforeEach(() => jest.clearAllMocks());

  it('maps an HttpException to its status and response body', () => {
    filter.catch(new BadRequestException('bad input'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status_code: HttpStatus.BAD_REQUEST,
        error: 'bad input',
      }),
    );
  });

  it('maps an unknown error to a 500 with a generic message', () => {
    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      success: false,
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal server error',
    });
  });

  it('rethrows instead of writing a response outside an HTTP context', () => {
    const rpcHost = {
      getType: () => 'rpc',
      switchToHttp: () => {
        throw new Error('should not be called for rpc');
      },
    } as unknown as ArgumentsHost;
    const original = new Error('consumer blew up');

    const result = filter.catch(original, rpcHost);

    expect(status).not.toHaveBeenCalled();
    let caught: unknown;
    result?.subscribe({ error: (error: unknown) => (caught = error) });
    expect(caught).toBe(original);
  });
});
