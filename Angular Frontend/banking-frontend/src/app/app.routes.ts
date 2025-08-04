// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { BankingFeaturesComponent } from './features/banking-features/banking-features.component';
import { AccountsListComponent } from './features/accounts/accounts-list/accounts-list.component'; // Import new component
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'banking-features', component: BankingFeaturesComponent, canActivate: [authGuard] },
    { path: 'accounts', component: AccountsListComponent, canActivate: [authGuard] }, // New route for accounts list
    // Add other feature routes here, also protected by authGuard
    // { path: 'transactions', component: TransactionsComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/dashboard' },
];