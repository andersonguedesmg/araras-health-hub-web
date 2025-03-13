import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationProfileComponent } from './destination-profile.component';

describe('DestinationProfileComponent', () => {
  let component: DestinationProfileComponent;
  let fixture: ComponentFixture<DestinationProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
