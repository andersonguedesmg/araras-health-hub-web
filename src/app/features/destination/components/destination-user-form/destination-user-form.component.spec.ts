import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationUserFormComponent } from './destination-user-form.component';

describe('DestinationUserFormComponent', () => {
  let component: DestinationUserFormComponent;
  let fixture: ComponentFixture<DestinationUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationUserFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
