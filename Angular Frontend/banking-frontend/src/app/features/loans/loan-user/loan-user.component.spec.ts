import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanUserComponent } from './loan-user.component';

describe('LoanUserComponent', () => {
  let component: LoanUserComponent;
  let fixture: ComponentFixture<LoanUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
