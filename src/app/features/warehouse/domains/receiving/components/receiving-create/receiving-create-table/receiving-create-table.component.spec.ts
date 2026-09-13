import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingCreateTableComponent } from './receiving-create-table.component';

describe('ReceivingCreateTableComponent', () => {
  let component: ReceivingCreateTableComponent;
  let fixture: ComponentFixture<ReceivingCreateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingCreateTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingCreateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
