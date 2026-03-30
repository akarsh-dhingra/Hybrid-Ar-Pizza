import { normalizeToppings } from './pizza.js';

const VALID_SIZES = ['small', 'medium', 'large'];

function normalizePizzaRecord(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Pizza payload must be a JSON object.' };
  }

  const name = typeof input.name === 'string' ? input.name.trim() : 'Custom Pizza';
  const sizeCandidate = typeof input.size === 'string' ? input.size.toLowerCase() : 'medium';
  const size = VALID_SIZES.includes(sizeCandidate) ? sizeCandidate : 'medium';
  const crust = typeof input.crust === 'string' ? input.crust.trim() : 'classic';
  const toppings = normalizeToppings(input.toppings);
  const priceValue = input.price;
  const price = Number.isFinite(Number(priceValue)) ? Number(priceValue) : null;

  if (!name) {
    return { ok: false, error: 'Pizza name is missing.' };
  }

  if (!toppings.length) {
    return { ok: false, error: 'Toppings array is missing or empty.' };
  }

  return {
    ok: true,
    data: {
      name,
      size,
      crust,
      toppings,
      price: price ?? 0
    }
  };
}

function parseMenuPayload(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Menu payload must be a JSON object.' };
  }

  const menuId = typeof input.menuId === 'string' ? input.menuId.trim() : '';
  const version = Number.isFinite(Number(input.version)) ? Number(input.version) : 1;

  if (!menuId) {
    return { ok: false, error: 'Menu payload is missing a menuId.' };
  }

  return {
    ok: true,
    data: {
      kind: 'menu',
      menuId,
      version
    }
  };
}

export function parseQrPayload(raw) {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, error: 'QR payload is empty.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { ok: false, error: 'QR payload is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'QR payload must be a JSON object.' };
  }

  if (parsed.type === 'menu') {
    return parseMenuPayload(parsed);
  }

  if (parsed.type === 'pizza') {
    const normalizedPizza = normalizePizzaRecord(parsed.pizza ?? parsed.data ?? parsed);
    if (!normalizedPizza.ok) {
      return normalizedPizza;
    }
    return {
      ok: true,
      data: {
        kind: 'pizza',
        pizza: normalizedPizza.data
      }
    };
  }

  const normalizedPizza = normalizePizzaRecord(parsed);
  if (normalizedPizza.ok) {
    return {
      ok: true,
      data: {
        kind: 'pizza',
        pizza: normalizedPizza.data
      }
    };
  }

  return { ok: false, error: normalizedPizza.error };
}
