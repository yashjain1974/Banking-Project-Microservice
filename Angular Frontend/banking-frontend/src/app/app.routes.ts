// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BankingFeaturesComponent } from './features/banking-features/banking-features.component';
import { AccountsListComponent } from './features/accounts/accounts-list/accounts-list.component';
import { TransactionHistoryComponent } from './features/transactions/transaction-history/transaction-history.component';
import { DepositComponent } from './features/transactions/deposit/deposit.component';
import { WithdrawComponent } from './features/transactions/withdraw/withdraw.component';
import { TransferComponent } from './features/transactions/transfer/transfer.component';
import { LoanApplicationComponent } from './features/loans/loan-application/loan-application.component';
import { LoanDetailsComponent } from './features/loans/loan-details/loan-details.component';
import { CardIssuanceComponent } from './features/cards/card-issuance/card-issuance.component'; // Import new component
import { CardManagementComponent } from './features/cards/card-management/card-management.component'; // Import new component
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'banking-features', component: BankingFeaturesComponent, canActivate: [authGuard] },
    { path: 'accounts', component: AccountsListComponent, canActivate: [authGuard] },
    { path: 'transactions/history', component: TransactionHistoryComponent, canActivate: [authGuard] },
    { path: 'transactions/deposit', component: DepositComponent, canActivate: [authGuard] },
    { path: 'transactions/withdraw', component: WithdrawComponent, canActivate: [authGuard] },
    { path: 'transactions/transfer', component: TransferComponent, canActivate: [authGuard] },
    { path: 'loans', redirectTo: '/loans/history', pathMatch: 'full' },
    { path: 'loans/history', component: LoanDetailsComponent, canActivate: [authGuard] },
    { path: 'loans/apply', component: LoanApplicationComponent, canActivate: [authGuard] },
    // New routes for Cards module
    { path: 'cards', redirectTo: '/cards/manage', pathMatch: 'full' }, // Redirect /cards to manage
    { path: 'cards/manage', component: CardManagementComponent, canActivate: [authGuard] },
    { path: 'cards/issue', component: CardIssuanceComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/dashboard' },
];