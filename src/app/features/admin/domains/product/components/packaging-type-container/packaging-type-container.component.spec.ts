import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingTypeContainerComponent } from './packaging-type-container.component';

describe('PackagingTypeContainerComponent', () => {
  let component: PackagingTypeContainerComponent;
  let fixture: ComponentFixture<PackagingTypeContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagingTypeContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagingTypeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
