import { Injectable, signal } from '@angular/core';
import { WishlistItem } from '../models/wishlist.model';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private readonly STORAGE_KEY = 'ecommerce_wishlist';
    private wishlistItems = signal<WishlistItem[]>([]);

    constructor() {
        this.loadWishlistFromStorage();
    }

    /**
     * Get wishlist items as a signal
     */
    get items() {
        return this.wishlistItems.asReadonly();
    }

    /**
     * Get wishlist count as a signal
     */
    get itemCount() {
        return signal(this.wishlistItems().length);
    }

    /**
     * Load wishlist from localStorage
     */
    private loadWishlistFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const items = JSON.parse(stored) as WishlistItem[];
                // Convert date strings back to Date objects
                items.forEach(item => {
                    item.addedAt = new Date(item.addedAt);
                });
                this.wishlistItems.set(items);
            }
        } catch (error) {
            console.error('Error loading wishlist from storage:', error);
            this.wishlistItems.set([]);
        }
    }

    /**
     * Save wishlist to localStorage
     */
    private saveWishlistToStorage(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.wishlistItems()));
        } catch (error) {
            console.error('Error saving wishlist to storage:', error);
        }
    }

    /**
     * Add product to wishlist
     */
    addToWishlist(product: Product): void {
        const currentItems = this.wishlistItems();

        // Check if already in wishlist
        if (currentItems.some(item => item.productId === product.id)) {
            return;
        }

        const wishlistItem: WishlistItem = {
            productId: product.id,
            productName: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
            addedAt: new Date()
        };

        this.wishlistItems.set([...currentItems, wishlistItem]);
        this.saveWishlistToStorage();
    }

    /**
     * Remove product from wishlist
     */
    removeFromWishlist(productId: string): void {
        const currentItems = this.wishlistItems();
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        this.wishlistItems.set(updatedItems);
        this.saveWishlistToStorage();
    }

    /**
     * Check if product is in wishlist
     */
    isInWishlist(productId: string): boolean {
        return this.wishlistItems().some(item => item.productId === productId);
    }

    /**
     * Get all wishlist items
     */
    getWishlistItems(): WishlistItem[] {
        return this.wishlistItems();
    }

    /**
     * Clear entire wishlist
     */
    clearWishlist(): void {
        this.wishlistItems.set([]);
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Get wishlist count
     */
    getCount(): number {
        return this.wishlistItems().length;
    }
}
