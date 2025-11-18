import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart-view',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    ToastModule,
    DividerModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cart-view.html',
  styleUrl: './cart-view.scss',
})
export class CartView implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  loading = false;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.isAuthenticated = this.authService.isAuthenticated();

    // Subscribe to cart items
    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;
      });

    // Load cart from backend if authenticated
    if (this.isAuthenticated) {
      this.loadCart();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load cart from backend
   */
  loadCart(): void {
    this.loading = true;
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load cart. Using local cart.'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Update item quantity
   */
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateQuantity(item.productId, newQuantity);

    this.messageService.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Cart item quantity updated.'
    });
  }

  /**
   * Remove item from cart with confirmation
   */
  confirmRemoveItem(item: CartItem): void {
    this.confirmationService.confirm({
      message: `Remove ${item.productName} from your cart?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.removeItem(item);
      }
    });
  }

  /**
   * Remove item from cart
   */
  private removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.productId);

    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: `${item.productName} removed from cart.`
    });
  }

  /**
   * Clear all items from cart
   */
  confirmClearCart(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear your entire cart?',
      header: 'Clear Cart',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cartService.clearCart();
        this.messageService.add({
          severity: 'info',
          summary: 'Cart Cleared',
          detail: 'All items removed from cart.'
        });
      }
    });
  }

  /**
   * Calculate subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Calculate tax (8%)
   */
  getTax(): number {
    return this.getSubtotal() * 0.08;
  }

  /**
   * Calculate shipping (free over $50)
   */
  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal > 50 ? 0 : 5.99;
  }

  /**
   * Calculate total
   */
  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getShipping();
  }

  /**
   * Navigate to product detail
   */
  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Continue shopping
   */
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  /**
   * Proceed to checkout
   */
  proceedToCheckout(): void {
    if (!this.isAuthenticated) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Login Required',
        detail: 'Please login to proceed to checkout.'
      });
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/cart/checkout' } });
      return;
    }

    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Cart',
        detail: 'Add items to your cart before checkout.'
      });
      return;
    }

    this.router.navigate(['/cart/checkout']);
  }

  /**
   * Get item total
   */
  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  /**
   * Handle image load error - show placeholder icon
   */
  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
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
      `;
      placeholder.innerHTML = `
        <i class="pi pi-shopping-bag" style="font-size: 3rem; color: #adb5bd; line-height: 1;"></i>
        <span style="font-size: 0.7rem; color: #6c757d; font-weight: 500; margin-top: 0.5rem;">No image</span>
      `;
      parent.appendChild(placeholder);
    }
  }
}
