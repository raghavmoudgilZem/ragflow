const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

const mockApp = {
  get: jest.fn(),
  useLogger: jest.fn(),
  flushLogs: jest.fn(),
  connectMicroservice: jest.fn(),
  startAllMicroservices: jest.fn().mockResolvedValue(undefined),
  useGlobalPipes: jest.fn(),
  enableShutdownHooks: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
}));

describe('bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = { ...originalEnv, RABBIT_MQ_URL: 'amqp://localhost:5672' };
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should create the app, connect the microservice and start listening', async () => {
    mockApp.get.mockImplementation((token: unknown) =>
      typeof token === 'function' || typeof token === 'string'
        ? { get: jest.fn().mockReturnValue('amqp://localhost:5672') }
        : mockLogger,
    );

    // eslint-disable-next-line @typescript-eslint/no-require-imports -- fresh, unmocked-boundary import needed after jest.resetModules()
    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApp.useLogger).toHaveBeenCalled();
    expect(mockApp.connectMicroservice).toHaveBeenCalled();
    expect(mockApp.startAllMicroservices).toHaveBeenCalled();
    expect(mockApp.enableShutdownHooks).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith(expect.anything());
  });
});
