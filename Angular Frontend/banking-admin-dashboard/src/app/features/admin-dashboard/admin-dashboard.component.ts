import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { RouterLink } from '@angular/router';
import { KycStatus, UserRole } from '../../shared/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface UserProfile {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    kycStatus: KycStatus;
    role: UserRole;
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    pendingUsers: UserProfile[] = [];
    errorMessage: string | null = null;
    successMessage: string | null = null;
    loading: boolean = true;
    KycStatus = KycStatus; // Expose enum to template
    trackbyUserId(index: number, user: UserProfile): string {
        return user.userId;
    }
    constructor(private http: HttpClient, private authService: AuthService) { }

    ngOnInit(): void {
        this.loadPendingUsers();
    }

    loadPendingUsers(): void {
        this.loading = true;
        this.errorMessage = null;
        this.successMessage = null;

        // // Mock data for demonstration
        // setTimeout(() => {
        //     this.pendingUsers = [
        //         {
        //             userId: '123e4567-e89b-12d3-a456-426614174001',
        //             username: 'john_doe',
        //             email: 'john.doe@example.com',
        //             firstName: 'John',
        //             lastName: 'Doe',
        //             kycStatus: KycStatus.PENDING,
        //             role: UserRole.CUSTOMER
        //         },
        //         {
        //             userId: '123e4567-e89b-12d3-a456-426614174002',
        //             username: 'jane_smith',
        //             email: 'jane.smith@example.com',
        //             firstName: 'Jane',
        //             lastName: 'Smith',
        //             kycStatus: KycStatus.PENDING,
        //             role: UserRole.ADMIN
        //         }
        //     ];
        //     this.loading = false;
        // }, 1500);

        // Uncomment for real API call
        this.http.get<UserProfile[]>(`${environment.apiUrl}/auth/users`).subscribe(
            (users) => {
                this.pendingUsers = users.filter(user => user.kycStatus === KycStatus.PENDING);
                this.loading = false;
                if (this.pendingUsers.length === 0) {
                    this.successMessage = 'No pending KYC applications found.';
                }
            },
            (error) => {
                console.error('Error loading pending users:', error);
                this.errorMessage = error.error?.message || 'Failed to load pending users.';
                this.loading = false;
            }
        );
    }

    updateKycStatus(userId: string, newStatus: KycStatus): void {
        this.errorMessage = null;
        this.successMessage = null;

        // Mock implementation
        const userIndex = this.pendingUsers.findIndex(user => user.userId === userId);
        if (userIndex !== -1) {
            const updatedUser = { ...this.pendingUsers[userIndex], kycStatus: newStatus };
            this.successMessage = `User ${updatedUser.username}'s KYC status updated to ${newStatus}.`;

            // Remove from pending list if approved/rejected
            if (newStatus !== KycStatus.PENDING) {
                this.pendingUsers.splice(userIndex, 1);
            }
        }

        // Uncomment for real API call
        const payload = { kycStatus: newStatus };
        this.http.put<UserProfile>(`${environment.apiUrl}/auth/user/${userId}/kyc-status`, payload).subscribe(
            (updatedUser) => {
                console.log(`User ${userId} KYC status updated to ${newStatus}:`, updatedUser);
                this.successMessage = `User ${updatedUser.username}'s KYC status updated to ${newStatus}.`;
                this.loadPendingUsers();
            },
            (error) => {
                console.error(`Error updating KYC status for user ${userId}:`, error);
                this.errorMessage = error.error?.message || `Failed to update KYC status for user ${userId}.`;
            }
        );
    }

    approveKyc(userId: string): void {
        const user = this.pendingUsers.find(u => u.userId === userId);
        if (confirm(`Are you sure you want to APPROVE KYC for ${user?.username}?`)) {
            this.updateKycStatus(userId, KycStatus.VERIFIED);
        }
    }

    rejectKyc(userId: string): void {
        const user = this.pendingUsers.find(u => u.userId === userId);
        if (confirm(`Are you sure you want to REJECT KYC for ${user?.username}?`)) {
            this.updateKycStatus(userId, KycStatus.REJECTED);
        }
    }

    logout(): void {
        this.authService.logout();
    }

    getKycStatusClass(status: string): string {
        switch (status) {
            case 'PENDING': return 'badge bg-warning text-dark';
            case 'VERIFIED': return 'badge bg-success';
            case 'REJECTED': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    }

    clearMessages(): void {
        this.errorMessage = null;
        this.successMessage = null;
    }
}