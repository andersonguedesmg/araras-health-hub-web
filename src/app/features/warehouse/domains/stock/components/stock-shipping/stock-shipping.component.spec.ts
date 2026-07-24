import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockShippingComponent } from './stock-shipping.component';

describe('StockShippingComponent', () => {
  let component: StockShippingComponent;
  let fixture: ComponentFixture<StockShippingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockShippingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
