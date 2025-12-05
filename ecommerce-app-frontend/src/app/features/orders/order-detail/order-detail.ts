import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';

// Services & Models
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    DividerModule,
    TimelineModule
  ],
  providers: [MessageService],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = false;
  private destroy$ = new Subject<void>();
  private orderId: string = '';

  // Timeline events for order tracking
  timelineEvents: any[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = params['id'];
        if (this.orderId) {
          this.loadOrderDetail();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load order details
   */
  loadOrderDetail(): void {
    this.loading = true;

    this.orderService.getOrderById(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.buildTimeline(order);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load order details. Order may not exist.'
          });
          this.loading = false;

          // Redirect to orders list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        }
      });
  }

  /**
   * Build timeline for order tracking
   */
  buildTimeline(order: Order): void {
    this.timelineEvents = [
      {
        status: 'Order Placed',
        date: order.createdAt,
        icon: 'pi pi-check-circle',
        color: '#4CAF50'
      }
    ];

    const statusStr = this.getStatusString(order.status).toLowerCase();

    if (statusStr === 'completed' || statusStr === 'delivered') {
      this.timelineEvents.push({
        status: 'Order Completed',
        date: new Date(),
        icon: 'pi pi-shopping-bag',
        color: '#4CAF50'
      });
    } else if (statusStr === 'cancelled') {
      this.timelineEvents.push({
        status: 'Order Cancelled',
        date: new Date(),
        icon: 'pi pi-times-circle',
        color: '#f44336'
      });
    }
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
   * Go back to orders list
   */
  backToOrders(): void {
    this.router.navigate(['/orders']);
  }

  /**
   * Get total items in order
   */
  getTotalItems(): number {
    if (!this.order) return 0;
    return this.order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }

  /**
   * Navigate to product detail
   */
  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }
}
