import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanRejectComponent } from './loan-reject.component';

describe('LoanRejectComponent', () => {
  let component: LoanRejectComponent;
  let fixture: ComponentFixture<LoanRejectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanRejectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
