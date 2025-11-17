// Product Models

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
}
