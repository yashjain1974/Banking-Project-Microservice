import { Routes } from '@angular/router';

export const creditCardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./card-list/card-list.component').then(m => m.CardListComponent)
  },
  {
    path: 'apply',
    loadComponent: () => import('./card-apply/card-apply.component').then(m => m.CardApplyComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./card-detail/card-detail.component').then(m => m.CardDetailComponent)
  }
];