// Cart state, persisted to localStorage so it survives reloads.
// A tiny pub/sub lets any component re-render when the cart changes,
// without pulling in a framework for a capstone-scale app.

const STORAGE_KEY = "keystroke:cart:v1";
let listeners = [];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable (private mode, quota) — cart just won't persist */
  }
}

let state = load(); // { [sku]: quantity }

function notify() {
  save(state);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getCart() {
  return { ...state };
}

export function addToCart(sku, qty = 1) {
  state = { ...state, [sku]: (state[sku] || 0) + qty };
  notify();
}

export function setQuantity(sku, qty) {
  if (qty <= 0) {
    removeFromCart(sku);
    return;
  }
  state = { ...state, [sku]: qty };
  notify();
}

export function removeFromCart(sku) {
  const next = { ...state };
  delete next[sku];
  state = next;
  notify();
}

export function clearCart() {
  state = {};
  notify();
}

export function cartCount() {
  return Object.values(state).reduce((sum, q) => sum + q, 0);
}
