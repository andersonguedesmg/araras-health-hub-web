import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityContainerComponent } from './facility-container.component';

describe('FacilityContainerComponent', () => {
  let component: FacilityContainerComponent;
  let fixture: ComponentFixture<FacilityContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacilityContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
