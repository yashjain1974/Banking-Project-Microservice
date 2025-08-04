import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';


export const routes: Routes = [
    { path: '', redirectTo: '/admin-dashboard', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/admin-dashboard' },
];