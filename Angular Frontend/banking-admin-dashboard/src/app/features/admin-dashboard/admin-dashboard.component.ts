import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor
import { HttpClient } from '@angular/common/http'; // For making HTTP requests
import { environment } from '../../../environments/environment'; // Your environment file
import { AuthService } from '../../core/services/auth.service'; // Auth service
import { KycStatus, UserRole } from '../../shared/models/user.model';
import { RouterLink } from '@angular/router';


// Define a DTO for user profiles expected from User Microservice
interface UserProfile {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    kycStatus: KycStatus; // Use the enum
    role: UserRole; // Use the enum
    // Add other fields you want to display
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

    constructor(private http: HttpClient, private authService: AuthService) { }

    ngOnInit(): void {
        this.loadPendingUsers();
    }

    loadPendingUsers(): void {
        this.loading = true;
        this.errorMessage = null;
        this.successMessage = null;

        // Call User Microservice to get all users
        this.http.get<UserProfile[]>(`${environment.apiUrl}/auth/users`).subscribe(
            (users) => {
                // Filter for users with PENDING KYC status
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

        const payload = { kycStatus: newStatus };
        this.http.put<UserProfile>(`${environment.apiUrl}/auth/user/${userId}/kyc-status`, payload).subscribe(
            (updatedUser) => {
                console.log(`User ${userId} KYC status updated to ${newStatus}:`, updatedUser);
                this.successMessage = `User ${updatedUser.username}'s KYC status updated to ${newStatus}.`;
                this.loadPendingUsers(); // Reload list after update
            },
            (error) => {
                console.error(`Error updating KYC status for user ${userId}:`, error);
                this.errorMessage = error.error?.message || `Failed to update KYC status for user ${userId}.`;
            }
        );
    }

    approveKyc(userId: string): void {
        if (confirm(`Are you sure you want to APPROVE KYC for user ${userId}?`)) {
            this.updateKycStatus(userId, KycStatus.VERIFIED);
        }
    }

    rejectKyc(userId: string): void {
        if (confirm(`Are you sure you want to REJECT KYC for user ${userId}?`)) {
            this.updateKycStatus(userId, KycStatus.REJECTED);
        }
    }

    logout(): void {
        this.authService.logout();
    }
    getKycStatusClass(status: string): string {
        switch (status) {
            case 'PENDING': return 'status-pending';
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            default: return '';
        }
    }
}