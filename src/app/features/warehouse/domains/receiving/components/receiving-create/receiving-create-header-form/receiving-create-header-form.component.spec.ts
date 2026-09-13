import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingCreateHeaderFormComponent } from './receiving-create-header-form.component';

describe('ReceivingCreateHeaderFormComponent', () => {
  let component: ReceivingCreateHeaderFormComponent;
  let fixture: ComponentFixture<ReceivingCreateHeaderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingCreateHeaderFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingCreateHeaderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
