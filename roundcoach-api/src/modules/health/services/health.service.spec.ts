import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns api health status', () => {
    const service = new HealthService({} as never);

    expect(service.health()).toEqual(
      expect.objectContaining({
        status: 'ok',
      }),
    );
  });
});
