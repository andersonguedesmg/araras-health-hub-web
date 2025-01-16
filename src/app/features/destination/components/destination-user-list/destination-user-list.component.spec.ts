import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationUserListComponent } from './destination-user-list.component';

describe('DestinationUserListComponent', () => {
  let component: DestinationUserListComponent;
  let fixture: ComponentFixture<DestinationUserListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationUserListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
