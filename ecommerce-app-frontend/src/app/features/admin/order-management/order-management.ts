import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

// Services & Models
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    TagModule,
    ToolbarModule,
    Select,
    InputTextModule,
    CardModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  displayOrderDialog = false;
  loading = false;
  private destroy$ = new Subject<void>();

  // Status filter
  statusFilter = 'all';
  statusOptions = [
    { label: 'All Orders', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // New status options for updating order
  updateStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(
    private orderService: OrderService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all orders (admin endpoint)
   */
  loadOrders(): void {
    this.loading = true;

    // TODO: Backend needs to implement GET /orders/api/admin/orders endpoint
    // For now, using the user orders endpoint
    this.orderService.getMyOrders()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load orders.'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Apply status filter
   */
  applyFilter(): void {
    if (this.statusFilter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        order => order.status.toLowerCase() === this.statusFilter
      );
    }
  }

  /**
   * Open order details dialog
   */
  viewOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
    this.displayOrderDialog = true;
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, newStatus: string): void {
    // TODO: Backend needs to implement PUT /orders/api/admin/orders/{id}/status endpoint
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Order status update will be available once backend API is implemented.'
    });

    // Example of how it would work:
    // this.orderService.updateOrderStatus(orderId, newStatus)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: () => {
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Success',
    //         detail: 'Order status updated successfully.'
    //       });
    //       this.loadOrders();
    //       this.displayOrderDialog = false;
    //     },
    //     error: (error) => {
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Error',
    //         detail: 'Failed to update order status.'
    //       });
    //     }
    //   });
  }

  /**
   * Get status severity for tag
   */
  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'paid':
        return 'info';
      case 'pending':
        return 'warn';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }

  /**
   * Format status text
   */
  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Get total items in order
   */
  getTotalItems(order: Order): number {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate order item total
   */
  getItemTotal(item: any): number {
    return item.price * item.quantity;
  }
}
