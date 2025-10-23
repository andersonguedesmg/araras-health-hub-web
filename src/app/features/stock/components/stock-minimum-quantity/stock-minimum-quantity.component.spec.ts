import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMinimumQuantityComponent } from './stock-minimum-quantity.component';

describe('StockMinimumQuantityComponent', () => {
  let component: StockMinimumQuantityComponent;
  let fixture: ComponentFixture<StockMinimumQuantityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockMinimumQuantityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockMinimumQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
