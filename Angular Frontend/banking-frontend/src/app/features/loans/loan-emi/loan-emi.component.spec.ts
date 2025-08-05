import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanEmiComponent } from './loan-emi.component';

describe('LoanEmiComponent', () => {
  let component: LoanEmiComponent;
  let fixture: ComponentFixture<LoanEmiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanEmiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanEmiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
