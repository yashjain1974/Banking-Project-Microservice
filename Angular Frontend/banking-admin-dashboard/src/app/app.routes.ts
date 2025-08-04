// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized.component';
// Import new component
import { authGuard } from './core/guards/auth.guard';
import { LoanManagementComponent } from './features/loan-management/loan-management/loan-management.component';

export const routes: Routes = [
    { path: '', redirectTo: '/admin-dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
    { path: 'loan-management', component: LoanManagementComponent, canActivate: [authGuard] }, // New route for loan management
    { path: '**', redirectTo: '/admin-dashboard' },
];