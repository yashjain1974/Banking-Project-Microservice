import { Routes } from '@angular/router';

export const loanRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./loan-list/loan-list.component').then(m => m.LoanListComponent)
  },
  {
    path: 'apply',
    loadComponent: () => import('./loan-apply/loan-apply.component').then(m => m.LoanApplyComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./loan-detail/loan-detail.component').then(m => m.LoanDetailComponent)
  }
];