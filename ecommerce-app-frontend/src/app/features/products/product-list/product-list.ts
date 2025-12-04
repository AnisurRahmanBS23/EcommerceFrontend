import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';

// Services & Models
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, ProductQueryParams } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart.model';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Select,
    SelectButtonModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    InputNumberModule,
    PaginatorModule
  ],
  providers: [MessageService],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = false;

  // Pagination
  pageSize = 12;
  totalRecords = 0;
  first = 0;

  // Search
  searchControl = new FormControl('');

  // Filters
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly = false;

  // Sorting
  sortOptions: SortOption[] = [
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Name: A to Z', value: 'name_asc' },
    { label: 'Name: Z to A', value: 'name_desc' },
    { label: 'Newest First', value: 'date_desc' }
  ];
  selectedSort: string = 'date_desc';

  stockOptions = [
    { label: 'All Products', value: false },
    { label: 'In Stock Only', value: true }
  ];

  // Filter visibility toggle
  filtersVisible = false;

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearchListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup search with debounce
   */
  private setupSearchListener(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadProducts();
      });
  }

  /**
   * Load products with current filters
   */
  loadProducts(): void {
    this.loading = true;

    const [sortBy, sortOrder] = this.parseSortOption(this.selectedSort);
    const page = (this.first / this.pageSize) + 1;

    const queryParams: ProductQueryParams = {
      page,
      pageSize: this.pageSize,
      search: this.searchControl.value || undefined,
      sortBy,
      sortOrder,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      inStock: this.inStockOnly || undefined
    };

    this.productService.getProducts(queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.items;
          this.totalRecords = response.totalCount;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load products. Please try again.'
          });
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pageSize = event.rows;
    this.loadProducts();
  }


  /**
   * Parse sort option into sortBy and sortOrder
   */
  private parseSortOption(sortOption: string): [string, 'asc' | 'desc'] {
    const [field, order] = sortOption.split('_');
    return [field, order as 'asc' | 'desc'];
  }

  /**
   * Handle sort change
   */
  onSortChange(): void {
    this.loadProducts();
  }

  /**
   * Handle stock filter change
   */
  onStockFilterChange(): void {
    this.loadProducts();
  }

  /**
   * Apply price filters
   */
  applyPriceFilter(): void {
    this.loadProducts();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.selectedSort = 'date_desc';
    this.loadProducts();
  }

  /**
   * Toggle filter visibility
   */
  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product): void {
    if (product.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Out of Stock',
        detail: 'This product is currently out of stock.'
      });
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl
    };

    this.cartService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${product.name} has been added to your cart.`
    });
  }

  /**
   * Navigate to product detail
   */
  viewProductDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Get stock severity for tag
   */
  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  /**
   * Get stock label
   */
  getStockLabel(stock: number): string {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return `Only ${stock} left`;
    return 'Out of Stock';
  }

  /**
   * Handle image load error - show placeholder icon
   */
  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    // Hide the broken image and show placeholder
    target.style.display = 'none';
    // Add placeholder icon to parent
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.no-image')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-image';
      placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        z-index: 1;
        gap: 1rem;
      `;
      placeholder.innerHTML = `
        <i class="pi pi-shopping-bag" style="font-size: 6rem; color: #adb5bd; line-height: 1;"></i>
        <span style="font-size: 1rem; color: #6c757d; font-weight: 500; text-align: center;">Image not available</span>
      `;
      parent.appendChild(placeholder);
    }
  }
}
