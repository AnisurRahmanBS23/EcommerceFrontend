import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

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
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/cart/cart-view/cart-view').then(m => m.CartView)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/cart/checkout/checkout').then(m => m.Checkout)
      }
    ]
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
    canActivate: [adminGuard], // Changed to adminGuard for role-based access
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/product-management/product-management').then(m => m.ProductManagement)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/order-management/order-management').then(m => m.OrderManagement)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management/user-management').then(m => m.UserManagement)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/products'
  }
];
