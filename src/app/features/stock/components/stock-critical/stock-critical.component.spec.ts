import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCriticalComponent } from './stock-critical.component';

describe('StockCriticalComponent', () => {
  let component: StockCriticalComponent;
  let fixture: ComponentFixture<StockCriticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockCriticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockCriticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
