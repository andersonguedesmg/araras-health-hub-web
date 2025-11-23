import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockNearExpiryLotsComponent } from './stock-near-expiry-lots.component';

describe('StockNearExpiryLotsComponent', () => {
  let component: StockNearExpiryLotsComponent;
  let fixture: ComponentFixture<StockNearExpiryLotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockNearExpiryLotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockNearExpiryLotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
