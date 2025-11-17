import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Cart,
  CartItem,
  SetCartDto,
  CartResponseDto
} from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.orderApi}/cart`;
  private readonly CART_KEY = 'shopping_cart';

  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  // Signal for reactive UI
  public itemCount = signal<number>(this.getCartFromStorage().length);
  public totalAmount = signal<number>(this.calculateTotal());

  constructor(private http: HttpClient) {}

  /**
   * Get cart from backend (authenticated users)
   */
  getCart(): Observable<CartResponseDto> {
    return this.http.get<CartResponseDto>(this.apiUrl).pipe(
      tap(response => this.syncCartFromServer(response))
    );
  }

  /**
   * Set/Update cart on backend (authenticated users)
   */
  setCart(items: CartItem[]): Observable<CartResponseDto> {
    const dto: SetCartDto = {
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }))
    };

    return this.http.post<CartResponseDto>(this.apiUrl, dto).pipe(
      tap(response => this.syncCartFromServer(response))
    );
  }

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(i => i.productId === item.productId);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      currentItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      currentItems.push(item);
    }

    this.updateCart(currentItems);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): void {
    const currentItems = this.cartItemsSubject.value.filter(
      item => item.productId !== productId
    );
    this.updateCart(currentItems);
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: string, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(i => i.productId === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        currentItems[itemIndex].quantity = quantity;
        this.updateCart(currentItems);
      }
    }
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Get current cart items
   */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    return this.totalAmount();
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.itemCount();
  }

  /**
   * Sync cart with backend (for authenticated users)
   */
  syncWithBackend(): void {
    const items = this.cartItemsSubject.value;
    if (items.length > 0) {
      this.setCart(items).subscribe({
        error: (error) => console.error('Failed to sync cart with backend', error)
      });
    }
  }

  /**
   * Update local cart state
   */
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage(items);
    this.itemCount.set(items.reduce((total, item) => total + item.quantity, 0));
    this.totalAmount.set(this.calculateTotal());
  }

  /**
   * Calculate cart total
   */
  private calculateTotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  }

  /**
   * Get cart from localStorage
   */
  private getCartFromStorage(): CartItem[] {
    const cartJson = localStorage.getItem(this.CART_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  }

  /**
   * Sync cart from server response
   */
  private syncCartFromServer(response: CartResponseDto): void {
    const items: CartItem[] = response.cartItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl
    }));
    this.updateCart(items);
  }
}
