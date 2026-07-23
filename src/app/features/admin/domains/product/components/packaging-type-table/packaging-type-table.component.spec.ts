import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagingTypeTableComponent } from './packaging-type-table.component';

describe('PackagingTypeTableComponent', () => {
  let component: PackagingTypeTableComponent;
  let fixture: ComponentFixture<PackagingTypeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackagingTypeTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagingTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
