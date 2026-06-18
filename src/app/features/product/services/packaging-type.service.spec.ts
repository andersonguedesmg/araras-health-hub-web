import { TestBed } from '@angular/core/testing';

import { PackagingTypeService } from './packaging-type.service';

describe('PackagingTypeService', () => {
  let service: PackagingTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackagingTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
