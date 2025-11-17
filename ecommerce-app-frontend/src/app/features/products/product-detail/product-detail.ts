import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

// Services & Models
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    TagModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = false;
  quantity = 1;
  private destroy$ = new Subject<void>();
  private productId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.productId = params['id'];
        if (this.productId) {
          this.loadProduct();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load product details
   */
  loadProduct(): void {
    this.loading = true;

    this.productService.getProductById(this.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load product details. Product may not exist.'
          });
          this.loading = false;

          // Redirect to products list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        }
      });
  }

  /**
   * Add product to cart
   */
  addToCart(): void {
    if (!this.product) return;

    if (this.product.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Out of Stock',
        detail: 'This product is currently out of stock.'
      });
      return;
    }

    if (this.quantity > this.product.stock) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Insufficient Stock',
        detail: `Only ${this.product.stock} items available.`
      });
      return;
    }

    const cartItem: CartItem = {
      productId: this.product.id,
      productName: this.product.name,
      price: this.product.price,
      quantity: this.quantity,
      imageUrl: this.product.imageUrl
    };

    this.cartService.addToCart(cartItem);

    this.messageService.add({
      severity: 'success',
      summary: 'Added to Cart',
      detail: `${this.quantity} x ${this.product.name} added to your cart.`
    });

    // Reset quantity
    this.quantity = 1;
  }

  /**
   * Navigate back to products list
   */
  goBack(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Navigate to cart
   */
  goToCart(): void {
    this.router.navigate(['/cart']);
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
   * Get stock icon
   */
  getStockIcon(stock: number): string {
    if (stock > 10) return 'pi pi-check-circle';
    if (stock > 0) return 'pi pi-exclamation-triangle';
    return 'pi pi-times-circle';
  }

  /**
   * Check if quantity is valid
   */
  isQuantityValid(): boolean {
    if (!this.product) return false;
    return this.quantity > 0 && this.quantity <= this.product.stock;
  }
}
