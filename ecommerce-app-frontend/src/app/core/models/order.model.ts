// Order Models

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  status: string | number;  // Backend returns numeric enum (0=Pending, 1=Processing, etc.)
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;  // Backend calculates this
  imageUrl?: string;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  status: string | number;  // Backend returns numeric enum
  orderItems: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice?: number;  // Backend calculates this
  imageUrl?: string;
}
