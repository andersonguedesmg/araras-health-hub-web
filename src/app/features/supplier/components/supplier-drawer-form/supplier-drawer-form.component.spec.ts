import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierDrawerFormComponent } from './supplier-drawer-form.component';

describe('SupplierDrawerFormComponent', () => {
  let component: SupplierDrawerFormComponent;
  let fixture: ComponentFixture<SupplierDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
