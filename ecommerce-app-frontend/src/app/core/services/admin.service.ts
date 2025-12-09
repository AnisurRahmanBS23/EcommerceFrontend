import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminStatsOverview,
  RecentOrder,
  TopProduct,
  LowStockProduct,
  OrderNote,
  AddOrderNoteRequest,
  UpdateOrderStatusRequest
} from '../models/admin.model';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly orderApiUrl = `${environment.orderApi}/admin/orders`;
  private readonly productApiUrl = `${environment.productApi}/admin/products`;

  constructor(private http: HttpClient) { }

  // Statistics endpoints
  getStatsOverview(): Observable<AdminStatsOverview> {
    return this.http.get<AdminStatsOverview>(`${this.orderApiUrl}/stats/overview`);
  }

  getRecentOrders(limit: number = 10): Observable<RecentOrder[]> {
    return this.http.get<RecentOrder[]>(`${this.orderApiUrl}/stats/recent-orders?limit=${limit}`);
  }

  getTopProducts(limit: number = 10): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.orderApiUrl}/stats/top-products?limit=${limit}`);
  }

  getLowStockProducts(threshold: number = 10): Observable<LowStockProduct[]> {
    return this.http.get<LowStockProduct[]>(`${this.productApiUrl}/stats/low-stock-products?threshold=${threshold}`);
  }

  getTotalProducts(): Observable<{ totalProducts: number }> {
    return this.http.get<{ totalProducts: number }>(`${this.productApiUrl}/stats/total-products`);
  }

  // Order management endpoints
  getAllOrders(status?: number, searchTerm?: string, page: number = 1, pageSize: number = 20): Observable<Order[]> {
    let url = `${this.orderApiUrl}/orders?page=${page}&pageSize=${pageSize}`;

    if (status !== undefined && status !== null) {
      url += `&status=${status}`;
    }

    if (searchTerm && searchTerm.trim()) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    return this.http.get<Order[]>(url);
  }

  updateOrderStatus(orderId: string, request: UpdateOrderStatusRequest): Observable<any> {
    return this.http.put(`${this.orderApiUrl}/${orderId}/status`, request);
  }

  // Order notes endpoints
  getOrderNotes(orderId: string): Observable<OrderNote[]> {
    return this.http.get<OrderNote[]>(`${this.orderApiUrl}/orders/${orderId}/notes`);
  }

  addOrderNote(orderId: string, request: AddOrderNoteRequest): Observable<OrderNote> {
    return this.http.post<OrderNote>(`${this.orderApiUrl}/orders/${orderId}/notes`, request);
  }
}
