import { Routes } from '@angular/router';

export const transactionRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
  },
  {
    path: 'transfer',
    loadComponent: () => import('./transfer/transfer.component').then(m => m.TransferComponent)
  },
  {
    path: 'deposit',
    loadComponent: () => import('./deposit/deposit.component').then(m => m.DepositComponent)
  },
  {
    path: 'withdraw',
    loadComponent: () => import('./withdraw/withdraw.component').then(m => m.WithdrawComponent)
  }
];