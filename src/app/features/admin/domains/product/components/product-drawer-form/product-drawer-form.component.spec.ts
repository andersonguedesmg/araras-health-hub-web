import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDrawerFormComponent } from './product-drawer-form.component';

describe('ProductDrawerFormComponent', () => {
  let component: ProductDrawerFormComponent;
  let fixture: ComponentFixture<ProductDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
