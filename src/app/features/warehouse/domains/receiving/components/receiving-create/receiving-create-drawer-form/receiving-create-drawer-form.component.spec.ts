import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingCreateDrawerFormComponent } from './receiving-create-drawer-form.component';

describe('ReceivingCreateDrawerFormComponent', () => {
  let component: ReceivingCreateDrawerFormComponent;
  let fixture: ComponentFixture<ReceivingCreateDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivingCreateDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingCreateDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
