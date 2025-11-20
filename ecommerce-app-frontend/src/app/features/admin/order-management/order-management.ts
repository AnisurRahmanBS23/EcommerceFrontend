import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { TimelineModule } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';

// Services & Models
import { AdminService } from '../../../core/services/admin.service';
import { Order } from '../../../core/models/order.model';
import {
  OrderStatus,
  OrderStatusLabels,
  OrderNote,
  AddOrderNoteRequest
} from '../../../core/models/admin.model';

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
    DividerModule,
    TooltipModule,
    TextareaModule,
    TimelineModule,
    SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './order-management.html',
  styleUrl: './order-management.scss',
})
export class OrderManagement implements OnInit, OnDestroy {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  orderNotes: OrderNote[] = [];
  newNote = '';

  displayOrderDialog = false;
  displayStatusDialog = false;
  displayNotesDialog = false;

  loading = false;
  loadingNotes = false;
  updatingStatus = false;
  addingNote = false;

  private destroy$ = new Subject<void>();

  // Filters
  statusFilter: number | null = null;
  searchTerm = '';
  currentPage = 1;
  pageSize = 20;

  // Status options
  statusOptions = [
    { label: 'All Orders', value: null },
    { label: OrderStatusLabels[OrderStatus.Pending], value: OrderStatus.Pending },
    { label: OrderStatusLabels[OrderStatus.Processing], value: OrderStatus.Processing },
    { label: OrderStatusLabels[OrderStatus.Shipped], value: OrderStatus.Shipped },
    { label: OrderStatusLabels[OrderStatus.Delivered], value: OrderStatus.Delivered },
    { label: OrderStatusLabels[OrderStatus.Cancelled], value: OrderStatus.Cancelled }
  ];

  // New status for update
  newStatus: OrderStatus = OrderStatus.Pending;
  orderStatusEnum = OrderStatus;
  orderStatusLabels = OrderStatusLabels;

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.loading = true;

    this.adminService.getAllOrders(
      this.statusFilter !== null ? this.statusFilter : undefined,
      this.searchTerm || undefined,
      this.currentPage,
      this.pageSize
    )
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
            detail: 'Failed to load orders.'
          });
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.statusFilter = null;
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = { ...order };
    this.displayOrderDialog = true;
  }

  openStatusDialog(order: Order): void {
    this.selectedOrder = { ...order };
    this.newStatus = this.getOrderStatusValue(order.status);
    this.displayStatusDialog = true;
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder) return;

    this.updatingStatus = true;

    this.adminService.updateOrderStatus(this.selectedOrder.id, { status: this.newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Order status updated successfully.'
          });
          this.displayStatusDialog = false;
          this.updatingStatus = false;
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update order status.'
          });
          this.updatingStatus = false;
        }
      });
  }

  openNotesDialog(order: Order): void {
    this.selectedOrder = { ...order };
    this.newNote = '';
    this.displayNotesDialog = true;
    this.loadOrderNotes(order.id);
  }

  loadOrderNotes(orderId: string): void {
    this.loadingNotes = true;
    this.adminService.getOrderNotes(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notes) => {
          this.orderNotes = notes;
          this.loadingNotes = false;
        },
        error: (error) => {
          console.error('Error loading order notes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load order notes.'
          });
          this.loadingNotes = false;
        }
      });
  }

  addOrderNote(): void {
    if (!this.selectedOrder || !this.newNote.trim()) return;

    this.addingNote = true;
    const request: AddOrderNoteRequest = { note: this.newNote.trim() };

    this.adminService.addOrderNote(this.selectedOrder.id, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (note) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Note added successfully.'
          });
          this.orderNotes = [note, ...this.orderNotes];
          this.newNote = '';
          this.addingNote = false;
        },
        error: (error) => {
          console.error('Error adding order note:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to add note.'
          });
          this.addingNote = false;
        }
      });
  }

  getOrderStatusValue(status: string): OrderStatus {
    const statusMap: { [key: string]: OrderStatus } = {
      'Pending': OrderStatus.Pending,
      'Processing': OrderStatus.Processing,
      'Shipped': OrderStatus.Shipped,
      'Delivered': OrderStatus.Delivered,
      'Cancelled': OrderStatus.Cancelled
    };
    return statusMap[status] || OrderStatus.Pending;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const statusMap: { [key: string]: 'success' | 'info' | 'warn' | 'danger' } = {
      'Pending': 'warn',
      'Processing': 'info',
      'Shipped': 'success',
      'Delivered': 'success',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'info';
  }

  getTotalItems(order: Order): number {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getItemTotal(item: any): number {
    return item.price * item.quantity;
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}
