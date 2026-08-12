import { BaseProvider } from './base.provider';

describe('BaseProvider', () => {
  it('should expose the provider name', () => {
    const provider = new BaseProvider();

    expect(provider.name).toBe('base');
  });
});
