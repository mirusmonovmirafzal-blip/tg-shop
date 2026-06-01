import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const qty = action.item.quantity || 1;
      const key = action.item.variantId
        ? `${action.item.productId}_${action.item.variantId}`
        : action.item.productId;
      const existing = state.find((i) => i.key === key);
      if (existing) {
        return state.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i));
      }
      const { quantity, ...rest } = action.item;
      return [...state, { ...rest, key, quantity: qty }];
    }
    case 'REMOVE': {
      return state.filter((i) => i.key !== action.key);
    }
    case 'INCREMENT': {
      return state.map((i) => (i.key === action.key ? { ...i, quantity: i.quantity + 1 } : i));
    }
    case 'DECREMENT': {
      return state
        .map((i) => (i.key === action.key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
