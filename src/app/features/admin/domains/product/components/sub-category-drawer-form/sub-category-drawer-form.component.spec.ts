import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryDrawerFormComponent } from './sub-category-drawer-form.component';

describe('SubCategoryDrawerFormComponent', () => {
  let component: SubCategoryDrawerFormComponent;
  let fixture: ComponentFixture<SubCategoryDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoryDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoryDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
