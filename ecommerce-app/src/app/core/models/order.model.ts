// Order Models

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  price: number;
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
  status: string;
  orderItems: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
