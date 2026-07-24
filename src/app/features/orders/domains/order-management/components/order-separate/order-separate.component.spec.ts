import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSeparateComponent } from './order-separate.component';

describe('OrderSeparateComponent', () => {
  let component: OrderSeparateComponent;
  let fixture: ComponentFixture<OrderSeparateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSeparateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderSeparateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
