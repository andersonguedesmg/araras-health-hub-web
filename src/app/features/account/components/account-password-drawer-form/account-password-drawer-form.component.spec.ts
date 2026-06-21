import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPasswordDrawerFormComponent } from './account-password-drawer-form.component';

describe('AccountPasswordDrawerFormComponent', () => {
  let component: AccountPasswordDrawerFormComponent;
  let fixture: ComponentFixture<AccountPasswordDrawerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPasswordDrawerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountPasswordDrawerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
