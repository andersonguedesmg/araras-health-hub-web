import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFinalizeComponent } from './order-finalize.component';

describe('OrderFinalizeComponent', () => {
  let component: OrderFinalizeComponent;
  let fixture: ComponentFixture<OrderFinalizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderFinalizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderFinalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
