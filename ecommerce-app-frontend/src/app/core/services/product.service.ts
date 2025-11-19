import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductQueryParams,
  PaginatedResponse,
  CreateProductDto,
  UpdateProductDto
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.productApi}/products`;

  constructor(private http: HttpClient) {}

  /**
   * Get all products with pagination, filtering, and sorting
   */
  getProducts(queryParams?: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (queryParams) {
      if (queryParams.page) {
        params = params.set('page', queryParams.page.toString());
      }
      if (queryParams.pageSize) {
        params = params.set('pageSize', queryParams.pageSize.toString());
      }
      if (queryParams.search) {
        params = params.set('search', queryParams.search);
      }
      if (queryParams.sortBy) {
        params = params.set('sortBy', queryParams.sortBy);
      }
      if (queryParams.sortOrder) {
        params = params.set('sortOrder', queryParams.sortOrder);
      }
      if (queryParams.minPrice !== undefined && queryParams.minPrice !== null) {
        params = params.set('minPrice', queryParams.minPrice.toString());
      }
      if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== null) {
        params = params.set('maxPrice', queryParams.maxPrice.toString());
      }
      if (queryParams.inStock !== undefined && queryParams.inStock !== null) {
        params = params.set('inStock', queryParams.inStock.toString());
      }
    }

    // Call the /search endpoint which supports filtering and pagination
    return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new product (Admin only)
   */
  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Update an existing product (Admin only)
   */
  updateProduct(id: string, product: UpdateProductDto): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Delete a product (Admin only)
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Toggle product active status (Admin only)
   */
  toggleProductStatus(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  /**
   * Get products in stock only
   */
  getInStockProducts(page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      page,
      pageSize,
      inStock: true
    });
  }

  /**
   * Search products by name or description
   */
  searchProducts(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      page,
      pageSize,
      search: searchTerm
    });
  }
}
