// Cart Models

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SetCartDto {
  items: CartItemDto[];
}

export interface CartItemDto {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CartResponseDto {
  id: string;
  userId: string;
  cartItems: CartItemResponseDto[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CartItemResponseDto {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
