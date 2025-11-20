export interface AdminStatsOverview {
  totalRevenue: number;
  totalOrders: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
  averageOrderValue: number;
}

export interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
  imageUrl: string;
}

export interface OrderNote {
  id: string;
  orderId: string;
  adminUserId: string;
  adminUsername: string;
  note: string;
  createdAt: Date;
}

export interface AddOrderNoteRequest {
  note: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4
}

export const OrderStatusLabels: { [key in OrderStatus]: string } = {
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Processing]: 'Processing',
  [OrderStatus.Shipped]: 'Shipped',
  [OrderStatus.Delivered]: 'Delivered',
  [OrderStatus.Cancelled]: 'Cancelled'
};
