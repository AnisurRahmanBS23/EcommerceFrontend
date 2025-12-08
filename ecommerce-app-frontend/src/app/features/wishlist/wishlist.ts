import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistItem } from '../../core/models/wishlist.model';
import { CartItem } from '../../core/models/cart.model';

@Component({
    selector: 'app-wishlist',
    imports: [
        CommonModule,
        ButtonModule,
        TagModule,
        ToastModule,
        CardModule,
        TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './wishlist.html',
    styleUrl: './wishlist.scss',
})
export class Wishlist implements OnInit, OnDestroy {
    wishlistService = inject(WishlistService);
    cartService = inject(CartService);
    messageService = inject(MessageService);
    router = inject(Router);

    wishlistItems: WishlistItem[] = [];
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadWishlist();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Load wishlist items
     */
    loadWishlist(): void {
        this.wishlistItems = this.wishlistService.getWishlistItems();
    }

    /**
     * Remove item from wishlist
     */
    removeFromWishlist(productId: string): void {
        this.wishlistService.removeFromWishlist(productId);
        this.loadWishlist();

        this.messageService.add({
            severity: 'info',
            summary: 'Removed',
            detail: 'Product removed from wishlist'
        });
    }

    /**
     * Move item to cart
     */
    moveToCart(item: WishlistItem): void {
        if (item.stock <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Out of Stock',
                detail: 'This product is currently out of stock.'
            });
            return;
        }

        const cartItem: CartItem = {
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl
        };

        this.cartService.addToCart(cartItem);
        this.wishlistService.removeFromWishlist(item.productId);
        this.loadWishlist();

        this.messageService.add({
            severity: 'success',
            summary: 'Added to Cart',
            detail: `${item.productName} has been added to your cart.`
        });
    }

    /**
     * View product details
     */
    viewProduct(productId: string): void {
        this.router.navigate(['/products', productId]);
    }

    /**
     * Clear entire wishlist
     */
    clearWishlist(): void {
        this.wishlistService.clearWishlist();
        this.loadWishlist();

        this.messageService.add({
            severity: 'info',
            summary: 'Cleared',
            detail: 'Wishlist has been cleared'
        });
    }

    /**
     * Navigate back to products
     */
    continueShopping(): void {
        this.router.navigate(['/products']);
    }

    /**
     * Get stock severity
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
     * Handle image error
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
        z-index: 1;
      `;
            placeholder.innerHTML = `
        <i class="pi pi-heart" style="font-size: 4rem; color: #adb5bd;"></i>
        <span style="font-size: 1rem; color: #6c757d; font-weight: 500; margin-top: 1rem;">Image not available</span>
      `;
            parent.appendChild(placeholder);
        }
    }
}
