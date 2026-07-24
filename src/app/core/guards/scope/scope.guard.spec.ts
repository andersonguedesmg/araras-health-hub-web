import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { scopeGuard } from './scope.guard';

describe('scopeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => scopeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
