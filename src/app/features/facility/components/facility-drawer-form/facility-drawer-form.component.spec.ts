import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityDrawerFormComponent } from './facility-drawer-form.component';

describe('FacilityDrawerFormComponent', () => {
  let component: FacilityDrawerFormComponent;
  let fixture: ComponentFixture<FacilityDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
