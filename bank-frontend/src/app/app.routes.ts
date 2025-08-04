import { Routes } from '@angular/router';
import { LoanApplyComponent } from './components/loan-apply/loan-apply.component';
import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanUserComponent } from './components/loan-user/loan-user.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';
import { LoanApproveComponent } from './components/loan-approve/loan-approve.component';
import { LoanRejectComponent } from './components/loan-reject/loan-reject.component';
import { LoanEmiComponent } from './components/loan-emi/loan-emi.component';

export const routes: Routes = [
  { path: 'apply', component: LoanApplyComponent },
  { path: 'loans', component: LoanListComponent },
  { path: 'user-loans', component: LoanUserComponent },
  { path: 'loan-detail', component: LoanDetailComponent },
  { path: 'approve-loan', component: LoanApproveComponent },
  { path: 'reject-loan', component: LoanRejectComponent },
  { path: 'calculate-emi', component: LoanEmiComponent },
  { path: '', redirectTo: 'apply', pathMatch: 'full' },
  { path: '**', redirectTo: 'apply' }
];
