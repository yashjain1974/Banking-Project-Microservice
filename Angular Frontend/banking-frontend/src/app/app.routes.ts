// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BankingFeaturesComponent } from './features/banking-features/banking-features.component';
import { AccountsListComponent } from './features/accounts/accounts-list/accounts-list.component';
import { TransactionHistoryComponent } from './features/transactions/transaction-history/transaction-history.component'; // Import new component
import { DepositComponent } from './features/transactions/deposit/deposit.component'; // Import new component
import { WithdrawComponent } from './features/transactions/withdraw/withdraw.component'; // Import new component
import { TransferComponent } from './features/transactions/transfer/transfer.component'; // Import new component
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'banking-features', component: BankingFeaturesComponent, canActivate: [authGuard] },
    { path: 'accounts', component: AccountsListComponent, canActivate: [authGuard] },
    // New routes for Transactions module
    { path: 'transactions/history', component: TransactionHistoryComponent, canActivate: [authGuard] },
    { path: 'transactions/deposit', component: DepositComponent, canActivate: [authGuard] },
    { path: 'transactions/withdraw', component: WithdrawComponent, canActivate: [authGuard] },
    { path: 'transactions/transfer', component: TransferComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/dashboard' },
];