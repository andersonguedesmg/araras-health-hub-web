import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockActiveLotsComponent } from './stock-active-lots.component';

describe('StockActiveLotsComponent', () => {
  let component: StockActiveLotsComponent;
  let fixture: ComponentFixture<StockActiveLotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockActiveLotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockActiveLotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
