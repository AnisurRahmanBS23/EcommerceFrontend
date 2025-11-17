import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Order,
  CreateOrderDto,
  OrderResponseDto
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.orderApi}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new order
   */
  createOrder(orderDto: CreateOrderDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(this.apiUrl, orderDto);
  }

  /**
   * Get all orders for current user
   */
  getMyOrders(page: number = 1, pageSize: number = 10): Observable<OrderResponseDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/my-orders`, { params });
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: string): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(`${this.apiUrl}/${orderId}`);
  }

  /**
   * Get all orders (Admin only)
   */
  getAllOrders(page: number = 1, pageSize: number = 10, status?: string): Observable<OrderResponseDto[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<OrderResponseDto[]>(this.apiUrl, { params });
  }

  /**
   * Update order status (Admin only)
   */
  updateOrderStatus(orderId: string, status: string): Observable<OrderResponseDto> {
    return this.http.patch<OrderResponseDto>(
      `${this.apiUrl}/${orderId}/status`,
      { status }
    );
  }

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): Observable<OrderResponseDto> {
    return this.http.patch<OrderResponseDto>(
      `${this.apiUrl}/${orderId}/cancel`,
      {}
    );
  }

  /**
   * Get order statistics (Admin only)
   */
  getOrderStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
}
