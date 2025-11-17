import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      }
    ]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-view/cart-view').then(m => m.CartView),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/cart/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list').then(m => m.OrderList),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail/order-detail').then(m => m.OrderDetail),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./features/admin/product-management/product-management').then(m => m.ProductManagement)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/products'
  }
];
