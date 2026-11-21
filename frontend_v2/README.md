# Wavo Frontend

Vite + React storefront and administration interface, implemented in JSX and styled with Tailwind CSS v4 plus project CSS. The visual direction follows the home/shop references in `brand_assets/layout_home_html/wavo-shop-layout/`; Genos is used as the site font.

## Run locally

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Vite serves the app at `http://localhost:5173` by default. Set `VITE_API_BASE_URL` in `.env.local` to the backend API root; the default is `http://localhost:5000/api`.

The backend must allow the frontend origin in `CORS_ORIGIN` (for local development, include `http://localhost:5173`). Start the backend and its configured database separately for live API data and write operations.

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/models/`: Axios client and API access by domain.
- `src/controllers/`: shared auth/cart state and data-loading hooks.
- `src/views/`: client and admin page layouts.
- `src/components/`: shared navigation, footer, cards, and UI elements.
- `src/app/App.jsx`: route definitions and admin route guard.
- `src/styles.css`: brand tokens, font setup, responsive layout styling, and Tailwind import.

Client routes include the landing page, shop/product detail, design studio, cart/checkout, order lookup, account, story, and contact. Admin routes are under `/admin`.

When the API is unavailable, a small read-only product/landing fixture keeps the pages previewable. Mutations and checkout require the backend. The contact form has no matching backend API endpoint yet.
