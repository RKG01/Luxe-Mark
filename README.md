# Ecommerce Frontend

This is the React frontend for the `ecommerce` Spring Boot backend in the same workspace. It provides the customer shopping flow, cart and checkout experience, and an admin panel for managing catalog data and orders.

The app is built with React 19, TypeScript, Vite, Tailwind CSS, React Router, Axios, and TanStack Query.

## Project Overview

The frontend is split into two main areas:

- Customer app
  - Browse products
  - View product details
  - Register and log in
  - Manage cart
  - Checkout and pay with Razorpay
  - View profile and order details
- Admin app
  - View dashboard
  - Manage products
  - Manage categories
  - Track and update orders

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router DOM
- TanStack Query
- Axios
- React Hook Form + Zod
- Framer Motion

## Folder Structure

```text
src/
  components/
    cart/          Cart drawer UI
    layout/        Navbar, footer, admin sidebar
    shared/        Route guards and shared components
    ui/            Toasts and loading skeletons
  context/
    AuthContext    Login state and role handling
    CartContext    Cart state and cart actions
    ThemeContext   Theme handling
  hooks/
    useRazorpay    Razorpay integration helper
  pages/
    admin/         Admin screens
  services/
    api.ts         Axios client and auth/error interceptors
    *.ts           API modules by feature
  types/
    Shared app types
```

## Main Routes

### Customer Routes

- `/` - home page
- `/products/:id` - product details
- `/login` - sign in
- `/register` - sign up
- `/checkout` - checkout page for customers
- `/profile` - customer profile
- `/orders/:id` - single order details

### Admin Routes

- `/admin` - admin dashboard
- `/admin/products` - product management
- `/admin/categories` - category management
- `/admin/orders` - order management

Admin pages are wrapped in `ProtectedRoute` and require `ROLE_ADMIN`.

## How State Works

### Authentication

`src/context/AuthContext.tsx` handles:

- session restore from `localStorage`
- login and register actions
- role mapping on the frontend
- logout and session cleanup

Important detail: the backend register API does not return a usable JWT, so the frontend registers first and then logs in automatically.

### Cart

`src/context/CartContext.tsx` handles:

- loading the logged-in user's cart
- adding products to cart
- removing items
- clearing the cart
- opening the cart drawer after add-to-cart

Cart data is fetched only for authenticated users.

## Backend Dependency

This frontend expects the Spring Boot backend in `../ecommerce` to be running.

- Frontend API base URL comes from `.env.local`
- Current value: `VITE_API_URL=/api/v1`
- That means Vite should proxy or serve alongside the backend path, or the frontend should be deployed behind the same origin

If you want to call the backend directly during development, set it to something like:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Cart Flow Explained

The cart behavior in the frontend is based on the backend service implementation in [CartServiceImpl.java](/R:/java/ecommerce/ecommerce/src/main/java/com/ryuk/ecommerce/service/impl/CartServiceImpl.java).

### Add to Cart

When the frontend calls `POST /cart/add`:

1. The backend loads the current authenticated user.
2. It finds that user's cart or creates a new one.
3. It loads the selected product.
4. If the product is already in the cart, it increases quantity.
5. Otherwise, it creates a new `CartItem`.
6. It saves the cart and returns the updated cart response.

Frontend effect:

- `CartContext.addToCart()` updates local cart state with the backend response.
- The cart drawer opens automatically after a successful add.

### Get Cart

When the frontend calls `GET /cart`:

1. The backend resolves the current user.
2. It loads that user's cart.
3. It maps the entity to `CartResponse`.

Frontend effect:

- the cart is loaded on login or page refresh for authenticated users
- unauthenticated users keep `cart = null`

### Remove Cart Item

When the frontend calls `DELETE /cart/items/{itemId}`:

1. The backend loads the current user and that user's cart.
2. It loads a `CartItem` by database id.
3. It checks that the item belongs to the current user's cart.
4. It removes the item and saves the cart.

Important limitation:

- the backend expects `cartItemId`
- the frontend cart response is product-oriented
- current frontend removal code passes `productId` as a fallback

Because of that mismatch, the UI contains a local fallback removal path if the API call fails. This is a real contract gap between frontend and backend, not just a UI issue.

### Clear Cart

When the frontend calls `DELETE /cart/clear`:

1. The backend finds the current user's cart.
2. It clears all cart items.
3. It saves the cart.

Frontend effect:

- local cart state is reset after a successful clear

### Caching in Backend

`CartServiceImpl` uses Spring cache annotations:

- `@CachePut` on add
- `@Cacheable` on get
- `@CacheEvict` on remove and clear

The cache key is built per user, so each authenticated user has an isolated cart cache entry.

## Checkout and Payment Flow

The customer purchase flow is:

1. Add products to cart
2. Open checkout
3. Select or create an address
4. Create order from cart
5. Create Razorpay payment
6. Verify payment
7. Refresh order/cart state

Backend notes already reflected in the frontend service layer:

- checkout creates the order first
- payment verification confirms payment
- successful payment clears the cart

## Known Limitations

- Cart item removal has a backend/frontend contract mismatch because the backend expects `cartItemId`, but the cart response used by the UI does not expose it.
- Role information is inferred in the frontend from email patterns because the backend auth response does not provide roles directly.
- Product and category listing endpoints require authentication, so the catalog is not truly public.

## Local Development

### Prerequisites

- Node.js 20+
- npm
- Running Spring Boot backend

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Related Files

- [src/App.tsx](/R:/java/ecommerce/Frontend/src/App.tsx) - app providers and route tree
- [src/context/AuthContext.tsx](/R:/java/ecommerce/Frontend/src/context/AuthContext.tsx) - auth/session logic
- [src/context/CartContext.tsx](/R:/java/ecommerce/Frontend/src/context/CartContext.tsx) - cart state logic
- [src/services/cart.ts](/R:/java/ecommerce/Frontend/src/services/cart.ts) - cart API calls
- [FRONTEND_API_DOCUMENTATION.md](/R:/java/ecommerce/FRONTEND_API_DOCUMENTATION.md) - API contract reference
- [CartServiceImpl.java](/R:/java/ecommerce/ecommerce/src/main/java/com/ryuk/ecommerce/service/impl/CartServiceImpl.java) - backend cart business logic

## Summary

This frontend is not a generic Vite starter anymore. It is a full ecommerce client tied closely to the Spring Boot backend, with customer shopping, admin management, checkout, payment integration, and a cart flow that directly mirrors `CartServiceImpl`.
