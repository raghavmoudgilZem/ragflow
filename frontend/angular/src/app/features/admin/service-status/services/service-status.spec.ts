import { TestBed } from '@angular/core/testing';

import { ServiceStatus } from './service-status';

describe('ServiceStatus', () => {
  let service: ServiceStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
