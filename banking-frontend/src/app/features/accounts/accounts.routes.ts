import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./account-list/account-list.component').then(m => m.AccountListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./account-create/account-create.component').then(m => m.AccountCreateComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./account-detail/account-detail.component').then(m => m.AccountDetailComponent)
  }
];