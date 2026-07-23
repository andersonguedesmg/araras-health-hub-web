import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCategoryDrawerFormComponent } from './main-category-drawer-form.component';

describe('MainCategoryDrawerFormComponent', () => {
  let component: MainCategoryDrawerFormComponent;
  let fixture: ComponentFixture<MainCategoryDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCategoryDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCategoryDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
