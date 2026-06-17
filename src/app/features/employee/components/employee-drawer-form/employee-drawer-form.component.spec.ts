import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDrawerFormComponent } from './employee-drawer-form.component';

describe('EmployeeDrawerFormComponent', () => {
  let component: EmployeeDrawerFormComponent;
  let fixture: ComponentFixture<EmployeeDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
