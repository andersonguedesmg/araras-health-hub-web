import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAdjustmentCreateComponent } from './stock-adjustment-create.component';

describe('StockAdjustmentCreateComponent', () => {
  let component: StockAdjustmentCreateComponent;
  let fixture: ComponentFixture<StockAdjustmentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAdjustmentCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAdjustmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
