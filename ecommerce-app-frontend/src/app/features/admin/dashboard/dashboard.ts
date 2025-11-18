import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard {

  dashboardCards = [
    {
      title: 'Product Management',
      description: 'Add, edit, and delete products. Manage inventory and pricing.',
      icon: 'pi pi-box',
      route: '/admin/products',
      color: '#3b82f6'
    },
    {
      title: 'Order Management',
      description: 'View and manage customer orders. Update order status and track shipments.',
      icon: 'pi pi-shopping-bag',
      route: '/admin/orders',
      color: '#10b981'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
