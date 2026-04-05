import { createContext, useContext, useReducer } from "react";

const FavContext = createContext(null);
const FAV_KEY = "medpoint_favorites";

function load() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(FAV_KEY, JSON.stringify(items));
}

function reducer(state, action) {
  let next;
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.find((i) => i.id === action.product.id);
      next = exists
        ? state.filter((i) => i.id !== action.product.id)
        : [...state, action.product];
      break;
    }
    case "REMOVE":
      next = state.filter((i) => i.id !== action.id);
      break;
    case "CLEAR":
      next = [];
      break;
    default:
      return state;
  }
  save(next);
  return next;
}

export function FavoritesProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);

  const toggle = (product) => dispatch({ type: "TOGGLE", product });
  const remove = (id) => dispatch({ type: "REMOVE", id });
  const clear = () => dispatch({ type: "CLEAR" });
  const isFav = (id) => items.some((i) => i.id === id);

  return (
    <FavContext.Provider value={{ items, toggle, remove, clear, isFav }}>
      {children}
    </FavContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
