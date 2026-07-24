import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderActionModalComponent } from './order-action-modal.component';

describe('OrderActionModalComponent', () => {
  let component: OrderActionModalComponent;
  let fixture: ComponentFixture<OrderActionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderActionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderActionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
