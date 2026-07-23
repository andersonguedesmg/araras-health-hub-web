import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingTypeDrawerFormComponent } from './packaging-type-drawer-form.component';

describe('PackagingTypeDrawerFormComponent', () => {
  let component: PackagingTypeDrawerFormComponent;
  let fixture: ComponentFixture<PackagingTypeDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagingTypeDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagingTypeDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
