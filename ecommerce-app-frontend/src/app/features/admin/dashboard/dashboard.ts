import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import {
  AdminStatsOverview,
  RecentOrder,
  TopProduct,
  LowStockProduct,
  OrderStatusLabels
} from '../../../core/models/admin.model';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    DataViewModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard implements OnInit {
  stats: AdminStatsOverview | null = null;
  recentOrders: RecentOrder[] = [];
  topProducts: TopProduct[] = [];
  lowStockProducts: LowStockProduct[] = [];

  loading = {
    stats: true,
    recentOrders: true,
    topProducts: true,
    lowStockProducts: true
  };

  orderStatusLabels = OrderStatusLabels;

  // Quick navigation cards
  quickActions = [
    {
      title: 'Product Management',
      description: 'Manage inventory and pricing',
      icon: 'pi pi-box',
      route: '/admin/products',
      color: '#3b82f6'
    },
    {
      title: 'Order Management',
      description: 'View and manage orders',
      icon: 'pi pi-shopping-bag',
      route: '/admin/orders',
      color: '#10b981'
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: 'pi pi-users',
      route: '/admin/users',
      color: '#8b5cf6'
    }
  ];

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadStats();
    this.loadRecentOrders();
    this.loadTopProducts();
    this.loadLowStockProducts();
  }

  loadStats(): void {
    this.loading.stats = true;
    this.adminService.getStatsOverview().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading.stats = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading.stats = false;
      }
    });
  }

  loadRecentOrders(): void {
    this.loading.recentOrders = true;
    this.adminService.getRecentOrders(10).subscribe({
      next: (data) => {
        this.recentOrders = data;
        this.loading.recentOrders = false;
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
        this.loading.recentOrders = false;
      }
    });
  }

  loadTopProducts(): void {
    this.loading.topProducts = true;
    this.adminService.getTopProducts(5).subscribe({
      next: (data) => {
        this.topProducts = data;
        this.loading.topProducts = false;
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        this.loading.topProducts = false;
      }
    });
  }

  loadLowStockProducts(): void {
    this.loading.lowStockProducts = true;
    this.adminService.getLowStockProducts(10).subscribe({
      next: (data) => {
        this.lowStockProducts = data;
        this.loading.lowStockProducts = false;
      },
      error: (error) => {
        console.error('Error loading low stock products:', error);
        this.loading.lowStockProducts = false;
      }
    });
  }

  getOrderStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const statusMap: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      'Pending': 'warn',
      'Processing': 'info',
      'Shipped': 'success',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'info';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
