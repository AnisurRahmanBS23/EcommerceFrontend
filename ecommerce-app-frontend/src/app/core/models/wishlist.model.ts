export interface WishlistItem {
    productId: string;
    productName: string;
    price: number;
    imageUrl?: string;
    stock: number;
    addedAt: Date;
}
