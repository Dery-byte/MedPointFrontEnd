# MedPoint Business Suite Frontend

The MedPoint Frontend is a modern, high-performance web application built with **React** and **Vite**. It serves as the unified interface for the MedPoint Business Suite, encompassing a public storefront, a Point of Sale (POS) system for staff, and a developer configuration portal.

## 🌟 Key Modules

### 🛒 Public Storefront
A fully featured e-commerce experience for customers, including:
- **Landing Page**: Dynamic hero sections and featured products.
- **Shop & Product Details**: Browsing, filtering, and detailed product views.
- **Cart & Favorites**: Persistent shopping cart and wishlist management.
- **Checkout & Orders**: Secure checkout flow with real-time order tracking.
- **User Accounts**: Registration, login, and profile management.

### 💳 Point of Sale (POS)
A dedicated interface for business operations and staff management, accessible at `/pos`. It handles:
- Inventory management.
- Transaction processing.
- Staff-specific workflows.

### 🛠️ Developer Portal
An internal portal (`/dev`) for rapid configuration and debugging of the suite's features, gated by secure tokens.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **State Management**: React Context API (Auth, Cart, Favorites, Config, Toast)
- **Styling**: Modular CSS / Styled Components (project-specific)
- **Deployment**: Vercel ready (`vercel.json` included)

## 📦 Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd MedPoint-Front
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or update the `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_DEV_TOKEN=your_dev_token
   VITE_STORE_CONFIG_KEY=storeConfig_v1
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` directory. You can preview the production build locally using:
```bash
npm run preview
```

## 📁 Project Structure

```text
src/
├── config/       # Global configuration contexts
├── dev/          # Developer portal components
├── pos/          # POS system components and logic
├── store/        # Storefront pages, components, and contexts
│   ├── components/
│   ├── context/
│   └── pages/
├── shared/       # Reusable UI components
├── styles/       # Global and component-specific styles
├── router.jsx    # Central routing definitions
└── main.jsx      # Application entry point
```

## 🌐 API Integration

The frontend communicates with the backend API via Axios. The base URL is configured in the `.env` file (`VITE_API_URL`). Interceptors or context-based services handle authentication tokens and error reporting.

## 📄 License

This project is proprietary and confidential.

---
*Built with ❤️ by the MedPoint Team*
