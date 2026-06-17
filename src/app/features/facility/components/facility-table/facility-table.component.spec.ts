import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityTableComponent } from './facility-table.component';

describe('FacilityTableComponent', () => {
  let component: FacilityTableComponent;
  let fixture: ComponentFixture<FacilityTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
