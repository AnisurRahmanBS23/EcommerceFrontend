import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { StepperModule } from 'primeng/stepper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services & Models
import { OrderService } from '../../../core/services/order.service';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/models/cart.model';
import { CreateOrderDto } from '../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    DividerModule,
    StepperModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartItems: CartItem[] = [];
  loading = false;
  orderPlaced = false;
  orderId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private cartService: CartService,
    private messageService: MessageService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize checkout form
   */
  initializeForm(): void {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0-9]{9}$/)]],  // Bangladesh mobile: 01XXXXXXXXX
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      division: ['', [Validators.required, Validators.minLength(2)]],  // Bangladesh divisions (Dhaka, Chittagong, etc.)
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],  // Bangladesh postal code: 4 digits
      country: ['Bangladesh', Validators.required]
    });
  }

  /**
   * Load cart items
   */
  loadCartItems(): void {
    let isInitialLoad = true;

    this.cartService.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartItems = items;

        // Only redirect if cart becomes empty AFTER initial load and order hasn't been placed
        if (items.length === 0 && !isInitialLoad && !this.orderPlaced) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Empty Cart',
            detail: 'Your cart is empty. Redirecting to products...'
          });
          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 2000);
        }

        isInitialLoad = false;
      });
  }

  /**
   * Place order
   */
  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }

    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Empty Cart',
        detail: 'Your cart is empty.'
      });
      return;
    }

    this.loading = true;

    const formValue = this.checkoutForm.value;
    const shippingAddress = `${formValue.addressLine1}, ${formValue.addressLine2 ? formValue.addressLine2 + ', ' : ''}${formValue.city}, ${formValue.division} ${formValue.postalCode}, ${formValue.country}`;

    const orderDto: CreateOrderDto = {
      customerName: formValue.fullName,
      customerEmail: formValue.email,
      items: this.cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        imageUrl: item.imageUrl
      })),
      shippingAddress: shippingAddress,
      totalAmount: this.getTotal()
    };

    this.orderService.createOrder(orderDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.loading = false;
          this.orderPlaced = true;
          this.orderId = order.id;

          // Clear cart after successful order
          this.cartService.clearCart();

          this.messageService.add({
            severity: 'success',
            summary: 'Order Placed',
            detail: `Order #${order.id} has been placed successfully!`
          });

          // Redirect to order details after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/orders', order.id]);
          }, 3000);
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Order Failed',
            detail: 'Failed to place order. Please try again.'
          });
        }
      });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName} is required`;
    if (field?.hasError('email')) return 'Invalid email format';
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone') return 'Phone must be 11 digits (01XXXXXXXXX)';
      if (fieldName === 'postalCode') return 'Postal code must be 4 digits';
    }
    if (field?.hasError('minLength')) return `${fieldName} is too short`;
    return '';
  }

  /**
   * Calculate subtotal
   */
  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  /**
   * Calculate VAT (15% - Bangladesh standard)
   */
  getTax(): number {
    return this.getSubtotal() * 0.15;
  }

  /**
   * Calculate shipping (free over ৳5000)
   */
  getShipping(): number {
    const subtotal = this.getSubtotal();
    return subtotal > 5000 ? 0 : 60;  // ৳60 shipping fee, free over ৳5000
  }

  /**
   * Calculate total
   */
  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getShipping();
  }

  /**
   * Go back to cart
   */
  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  /**
   * View orders
   */
  viewOrders(): void {
    this.router.navigate(['/orders']);
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
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      `;
      placeholder.innerHTML = `
        <i class="pi pi-shopping-bag" style="font-size: 2rem; color: #adb5bd; line-height: 1;"></i>
      `;
      parent.appendChild(placeholder);
    }
  }
}
