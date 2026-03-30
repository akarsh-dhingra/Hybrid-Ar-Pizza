export const SIZE_RADIUS = {
  small: 0.45,
  medium: 0.55,
  large: 0.65
};

export const SIZE_MEASUREMENTS = {
  small: { diameterIn: 10, diameterCm: 25 },
  medium: { diameterIn: 12, diameterCm: 30 },
  large: { diameterIn: 14, diameterCm: 36 }
};

export const TOPPING_STYLES = {
  pepperoni: {
    count: 18,
    color: '#b43d2d',
    roughness: 0.5,
    metalness: 0.1,
    shape: 'disc'
  },
  olives: {
    count: 22,
    color: '#2f2a24',
    roughness: 0.7,
    metalness: 0.1,
    shape: 'ring'
  },
  mushroom: {
    count: 16,
    color: '#d8c7a2',
    roughness: 0.8,
    metalness: 0,
    shape: 'mushroom'
  },
  jalapeno: {
    count: 18,
    color: '#2f7b3e',
    roughness: 0.7,
    metalness: 0.1,
    shape: 'ring'
  },
  onion: {
    count: 20,
    color: '#c7b1d4',
    roughness: 0.8,
    metalness: 0,
    shape: 'ring'
  },
  basil: {
    count: 14,
    color: '#1f6b3b',
    roughness: 0.9,
    metalness: 0,
    shape: 'leaf'
  },
  capsicum: {
    count: 18,
    color: '#4d9a52',
    roughness: 0.7,
    metalness: 0.05,
    shape: 'ring'
  },
  tomato: {
    count: 16,
    color: '#d94841',
    roughness: 0.55,
    metalness: 0.05,
    shape: 'disc'
  },
  corn: {
    count: 22,
    color: '#f0c94d',
    roughness: 0.5,
    metalness: 0.05,
    shape: 'chunk'
  },
  'extra cheese': {
    count: 16,
    color: '#ffe8a3',
    roughness: 0.45,
    metalness: 0.02,
    shape: 'chunk'
  },
  paneer: {
    count: 14,
    color: '#f7e3c1',
    roughness: 0.6,
    metalness: 0.03,
    shape: 'cube'
  },
  garlic: {
    count: 14,
    color: '#efe1bd',
    roughness: 0.75,
    metalness: 0,
    shape: 'chunk'
  },
  chicken: {
    count: 16,
    color: '#d8a56f',
    roughness: 0.6,
    metalness: 0.05,
    shape: 'cube'
  },
  'chicken tikka': {
    count: 15,
    color: '#d77c42',
    roughness: 0.58,
    metalness: 0.05,
    shape: 'cube'
  },
  'tandoori chicken': {
    count: 15,
    color: '#c96435',
    roughness: 0.58,
    metalness: 0.05,
    shape: 'cube'
  },
  'bbq sauce': {
    count: 12,
    color: '#5f2d1d',
    roughness: 0.45,
    metalness: 0.04,
    shape: 'splash'
  },
  'peri peri sauce': {
    count: 12,
    color: '#c84a2d',
    roughness: 0.45,
    metalness: 0.04,
    shape: 'splash'
  },
  cheese: {
    count: 14,
    color: '#ffe8a3',
    roughness: 0.45,
    metalness: 0.02,
    shape: 'chunk'
  }
};

const TOPPING_ALIASES = {
  olive: 'olives',
  olives: 'olives',
  cheese: 'extra cheese',
  'extra cheese': 'extra cheese'
};

export function createDefaultPizza() {
  return {
    name: 'Pepperoni Supreme',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['pepperoni', 'olives', 'mushroom'],
    price: 399
  };
}

export function getRadiusForSize(size) {
  if (!size) return SIZE_RADIUS.medium;
  const key = size.toLowerCase();
  return SIZE_RADIUS[key] || SIZE_RADIUS.medium;
}

export function getSizeMeasurement(size) {
  if (!size) return SIZE_MEASUREMENTS.medium;
  const key = size.toLowerCase();
  return SIZE_MEASUREMENTS[key] || SIZE_MEASUREMENTS.medium;
}

export function getPizzaKey(pizza) {
  if (!pizza) return '';
  const normalized = {
    name: String(pizza.name || '').trim(),
    size: String(pizza.size || '').toLowerCase(),
    crust: String(pizza.crust || '').trim(),
    toppings: normalizeToppings(pizza.toppings).sort(),
    price: Number.isFinite(Number(pizza.price)) ? Number(pizza.price) : 0
  };
  return JSON.stringify(normalized);
}

export function normalizeToppingName(topping) {
  const normalized = String(topping || '').trim().toLowerCase();
  if (!normalized) return '';
  return TOPPING_ALIASES[normalized] || normalized;
}

export function normalizeToppings(toppings) {
  if (!Array.isArray(toppings)) return [];
  return toppings
    .map((item) => normalizeToppingName(item))
    .filter(Boolean);
}

export function normalizePizzaData(pizza) {
  if (!pizza) return null;
  return {
    name: String(pizza.name || '').trim(),
    size: String(pizza.size || 'medium').toLowerCase(),
    crust: String(pizza.crust || 'classic').trim(),
    toppings: normalizeToppings(pizza.toppings),
    price: Number.isFinite(Number(pizza.price)) ? Number(pizza.price) : 0
  };
}
