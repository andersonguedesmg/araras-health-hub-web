import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDrawerFormComponent } from './account-drawer-form.component';

describe('AccountDrawerFormComponent', () => {
  let component: AccountDrawerFormComponent;
  let fixture: ComponentFixture<AccountDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
