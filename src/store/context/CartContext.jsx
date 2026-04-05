import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);
const CART_KEY = "medpoint_cart";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i.id === action.product.id);
      if (exists) {
        next = state.map((i) =>
          i.id === action.product.id
            ? { ...i, qty: Math.min(i.qty + 1, i.stock) }
            : i
        );
      } else {
        next = [...state, { ...action.product, qty: 1 }];
      }
      break;
    }
    case "REMOVE":
      next = state.filter((i) => i.id !== action.id);
      break;
    case "INCREMENT":
      next = state.map((i) =>
        i.id === action.id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i
      );
      break;
    case "DECREMENT":
      next = state
        .map((i) => (i.id === action.id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
      break;
    case "SET_QTY":
      next = state.map((i) =>
        i.id === action.id
          ? { ...i, qty: Math.max(1, Math.min(action.qty, i.stock)) }
          : i
      );
      break;
    case "CLEAR":
      next = [];
      break;
    default:
      return state;
  }
  saveCart(next);
  return next;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], loadCart);

  const add = (product) => dispatch({ type: "ADD", product });
  const remove = (id) => dispatch({ type: "REMOVE", id });
  const increment = (id) => dispatch({ type: "INCREMENT", id });
  const decrement = (id) => dispatch({ type: "DECREMENT", id });
  const setQty = (id, qty) => dispatch({ type: "SET_QTY", id, qty });
  const clear = () => dispatch({ type: "CLEAR" });

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const isInCart = (id) => items.some((i) => i.id === id);

  return (
    <CartContext.Provider
      value={{ items, total, count, add, remove, increment, decrement, setQty, clear, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
