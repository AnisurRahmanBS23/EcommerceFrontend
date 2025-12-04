// export const environment = {
//   production: false,
//   apiUrl: 'http://localhost:5000', // API Gateway URL
//   authApi: 'http://localhost:5000/auth/api',
//   productApi: 'http://localhost:5000/products/api',
//   orderApi: 'http://localhost:5000/orders/api',
//   version: '1.0.0'
// };


export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000', // API Gateway URL
  authApi: 'http://localhost:5000',      // matches /auth/{**catch-all} route
  productApi: 'http://localhost:5000', // matches /products/{**catch-all} route
  orderApi: 'http://localhost:5000',   // matches /orders/{**catch-all} route
  version: '1.0.0'
};
