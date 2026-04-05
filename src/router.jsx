import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom";

// ── Config / Dev ──────────────────────────────────────────────────────────────
import { ConfigProvider, useConfig } from "./config/ConfigContext";
import DevGuard           from "./dev/DevGuard";
import DevLayout          from "./dev/DevLayout";

// ── POS ───────────────────────────────────────────────────────────────────────
import { AppProvider } from "./pos/AppContext";
import PosApp          from "./pos/App";

// ── Store providers & components ──────────────────────────────────────────────
import { AuthProvider }      from "./store/context/AuthContext";
import { CartProvider }      from "./store/context/CartContext";
import { FavoritesProvider } from "./store/context/FavoritesContext";
import { ToastProvider }     from "./store/components/Toast";
import Navbar  from "./store/components/Navbar";
import Footer  from "./store/components/Footer";

// ── Store pages ───────────────────────────────────────────────────────────────
import Landing           from "./store/pages/Landing";
import Shop              from "./store/pages/Shop";
import ProductDetail     from "./store/pages/ProductDetail";
import Favorites         from "./store/pages/Favorites";
import Cart              from "./store/pages/Cart";
import Checkout          from "./store/pages/Checkout";
import OrderConfirmation from "./store/pages/OrderConfirmation";
import Login             from "./store/pages/Login";
import Register          from "./store/pages/Register";
import AccountSettings   from "./store/pages/AccountSettings";
import Orders           from "./store/pages/Orders";

// ── Auth guard (customer) ─────────────────────────────────────────────────────
import { useAuth } from "./store/context/AuthContext";

function CustomerGuard({ children }) {
  const { state } = useAuth();
  const location  = useLocation();
  if (!state.customer)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

// ── Layout wrappers ───────────────────────────────────────────────────────────

/** Wraps every public storefront page with Navbar + Footer */
function StoreLayout() {
  return (
    <>
      <Navbar />
      <div className="store-layout"><Outlet /></div>
      <Footer />
    </>
  );
}

/** Redirects to /pos when the storefront module is toggled off */
function StoreGuard() {
  const { config } = useConfig();
  if (!config.enabledModules?.includes("storefront"))
    return <Navigate to="/pos" replace />;
  return <Outlet />;
}

/**
 * Root layout for all storefront routes.
 * Single ConfigProvider + all store context providers for the whole / tree.
 */
function StoreRoot() {
  return (
    <ConfigProvider applyToDOM>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <ToastProvider>
              <Outlet />
            </ToastProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

/**
 * POS shell at /pos.
 * ConfigProvider wraps it so StorefrontConfig / StorefrontProducts can call useConfig().
 * ToastProvider so storefront admin panels can call useToast().
 */
function PosShell() {
  return (
    <ConfigProvider applyToDOM>
      <ToastProvider>
        <AppProvider>
          <PosApp />
        </AppProvider>
      </ToastProvider>
    </ConfigProvider>
  );
}

/** Developer portal at /dev — token-gated */
function DevShell() {
  return (
    <ConfigProvider applyToDOM>
      <DevGuard>
        <DevLayout />
      </DevGuard>
    </ConfigProvider>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Developer portal (never shown to clients)
  { path: "/dev",   element: <DevShell /> },
  { path: "/dev/*", element: <DevShell /> },

  // POS shell — entire staff operations app
  { path: "/pos", element: <PosShell /> },

  // Public storefront — single StoreRoot wraps the whole subtree
  {
    element: <StoreRoot />,
    children: [
      {
        element: <StoreGuard />,
        children: [
          {
            element: <StoreLayout />,
            children: [
              { path: "/",                   element: <Landing /> },
              { path: "/shop",               element: <Shop /> },
              { path: "/product/:id",        element: <ProductDetail /> },
              { path: "/favorites",          element: <Favorites /> },
              { path: "/cart",               element: <Cart /> },
              { path: "/checkout",           element: <Checkout /> },
              { path: "/order-confirmation", element: <OrderConfirmation /> },
              { path: "/login",              element: <Login /> },
              { path: "/register",           element: <Register /> },
              {
                path: "/account",
                element: (
                  <CustomerGuard>
                    <AccountSettings />
                  </CustomerGuard>
                ),
              },
              {
                path: "/orders",
                element: (
                  <CustomerGuard>
                    <Orders />
                  </CustomerGuard>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // Catch-all
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
