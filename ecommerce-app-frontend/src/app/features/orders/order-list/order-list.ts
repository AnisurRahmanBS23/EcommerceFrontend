import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { CardModule } from 'primeng/card';

// Services & Models
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class OrderList implements OnInit, OnDestroy {
  orders: Order[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load user's orders
   */
  loadOrders(): void {
    this.loading = true;

    this.orderService.getMyOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load orders. Please try again.'
          });
          this.loading = false;
        }
      });
  }

  /**
   * View order details
   */
  viewOrderDetail(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  /**
   * Get status severity for tag
   */
  getStatusSeverity(status: string | number): 'success' | 'warn' | 'danger' | 'info' {
    const statusStr = this.getStatusString(status);
    switch (statusStr.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'cancelled':
        return 'danger';
      case 'processing':
      case 'shipped':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * Convert numeric status to string
   */
  private getStatusString(status: string | number): string {
    if (typeof status === 'string') return status;

    // Backend enum: 0=Pending, 1=Processing, 2=Shipped, 3=Delivered, 4=Cancelled
    const statusMap: { [key: number]: string } = {
      0: 'Pending',
      1: 'Processing',
      2: 'Shipped',
      3: 'Delivered',
      4: 'Cancelled'
    };

    return statusMap[status] || 'Unknown';
  }

  /**
   * Format status text
   */
  getStatusLabel(status: string | number): string {
    const statusStr = this.getStatusString(status);
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Get total item count for an order
   */
  getTotalItems(order: Order): number {
    return order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }
}
