import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityProfileComponent } from './facility-profile.component';

describe('FacilityProfileComponent', () => {
  let component: FacilityProfileComponent;
  let fixture: ComponentFixture<FacilityProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
