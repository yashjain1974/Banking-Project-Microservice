import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanApproveComponent } from './loan-approve.component';

describe('LoanApproveComponent', () => {
  let component: LoanApproveComponent;
  let fixture: ComponentFixture<LoanApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApproveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
