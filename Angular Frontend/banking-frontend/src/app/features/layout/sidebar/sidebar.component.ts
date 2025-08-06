import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
    @Input() sidebarCollapsed = false;
    @Input() bankingServices: any[] = [];
    @Input() quickActions: any[] = [];

    @Output() toggleSidebarEvent = new EventEmitter<void>();

    toggleSidebar() {
        this.toggleSidebarEvent.emit();
    }
}