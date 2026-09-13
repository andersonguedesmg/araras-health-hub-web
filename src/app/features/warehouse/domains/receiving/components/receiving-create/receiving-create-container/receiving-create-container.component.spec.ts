import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingCreateContainerComponent } from './receiving-create-container.component';

describe('ReceivingCreateContainerComponent', () => {
  let component: ReceivingCreateContainerComponent;
  let fixture: ComponentFixture<ReceivingCreateContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingCreateContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingCreateContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
