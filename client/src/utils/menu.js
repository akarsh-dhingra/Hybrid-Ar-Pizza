import { normalizePizzaData } from './pizza.js';

export const DEFAULT_MENU_ID = 'default-menu';

const DEFAULT_MENU_PIZZAS = [
  {
    name: 'Pepperoni Supreme',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['pepperoni', 'olives', 'mushroom'],
    price: 399
  },
  {
    name: 'Truffle Mushroom',
    size: 'medium',
    crust: 'thin',
    toppings: ['mushroom', 'onion', 'basil'],
    price: 349
  },
  {
    name: 'Green Garden',
    size: 'small',
    crust: 'classic',
    toppings: ['jalapeno', 'onion', 'olives', 'basil'],
    price: 299
  },
  {
    name: 'Smoky BBQ',
    size: 'large',
    crust: 'stuffed',
    toppings: ['pepperoni', 'onion'],
    price: 429
  },
  {
    name: 'Farmhouse Delight',
    size: 'medium',
    crust: 'cheese burst',
    toppings: ['onion', 'capsicum', 'tomato', 'mushroom'],
    price: 369
  },
  {
    name: 'Classic Margherita',
    size: 'small',
    crust: 'thin',
    toppings: ['tomato', 'basil'],
    price: 249
  },
  {
    name: 'Spicy Jalapeno',
    size: 'medium',
    crust: 'classic',
    toppings: ['jalapeno', 'onion', 'capsicum'],
    price: 319
  },
  {
    name: 'Cheesy Corn Blast',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['corn', 'extra cheese', 'onion'],
    price: 389
  },
  {
    name: 'Italian Herb',
    size: 'medium',
    crust: 'thin',
    toppings: ['basil', 'olive', 'tomato'],
    price: 329
  },
  {
    name: 'Veggie Fiesta',
    size: 'large',
    crust: 'classic',
    toppings: ['capsicum', 'onion', 'mushroom', 'corn'],
    price: 399
  },
  {
    name: 'Paneer Tikka',
    size: 'medium',
    crust: 'stuffed',
    toppings: ['paneer', 'onion', 'capsicum'],
    price: 379
  },
  {
    name: 'Peri Peri Veg',
    size: 'large',
    crust: 'thin',
    toppings: ['jalapeno', 'capsicum', 'peri peri sauce'],
    price: 409
  },
  {
    name: 'Mexican Wave',
    size: 'medium',
    crust: 'classic',
    toppings: ['jalapeno', 'onion', 'corn', 'tomato'],
    price: 349
  },
  {
    name: 'Double Cheese',
    size: 'small',
    crust: 'cheese burst',
    toppings: ['extra cheese'],
    price: 279
  },
  {
    name: 'Garlic Mushroom',
    size: 'medium',
    crust: 'thin',
    toppings: ['mushroom', 'garlic', 'basil'],
    price: 339
  },
  {
    name: 'BBQ Chicken',
    size: 'large',
    crust: 'stuffed',
    toppings: ['chicken', 'bbq sauce', 'onion'],
    price: 449
  },
  {
    name: 'Chicken Dominator',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['chicken', 'pepperoni', 'onion'],
    price: 469
  },
  {
    name: 'Chicken Tikka',
    size: 'medium',
    crust: 'classic',
    toppings: ['chicken tikka', 'onion', 'capsicum'],
    price: 399
  },
  {
    name: 'Spicy Chicken',
    size: 'medium',
    crust: 'thin',
    toppings: ['chicken', 'jalapeno', 'onion'],
    price: 389
  },
  {
    name: 'Cheese Volcano',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['extra cheese', 'corn'],
    price: 419
  },
  {
    name: 'Mediterranean Veg',
    size: 'medium',
    crust: 'thin',
    toppings: ['olive', 'tomato', 'basil', 'onion'],
    price: 349
  },
  {
    name: 'Olive Special',
    size: 'small',
    crust: 'classic',
    toppings: ['olive', 'cheese'],
    price: 269
  },
  {
    name: 'Capsicum Crunch',
    size: 'medium',
    crust: 'thin',
    toppings: ['capsicum', 'onion', 'tomato'],
    price: 319
  },
  {
    name: 'Desi Paneer Blast',
    size: 'large',
    crust: 'stuffed',
    toppings: ['paneer', 'onion', 'jalapeno'],
    price: 429
  },
  {
    name: 'Mushroom Mania',
    size: 'medium',
    crust: 'classic',
    toppings: ['mushroom', 'extra cheese'],
    price: 339
  },
  {
    name: 'Corn Delight',
    size: 'small',
    crust: 'thin',
    toppings: ['corn', 'cheese'],
    price: 259
  },
  {
    name: 'Tandoori Chicken',
    size: 'large',
    crust: 'cheese burst',
    toppings: ['tandoori chicken', 'onion'],
    price: 459
  },
  {
    name: 'Pepperoni Feast',
    size: 'large',
    crust: 'classic',
    toppings: ['pepperoni', 'extra cheese'],
    price: 439
  },
  {
    name: 'Veggie Lovers',
    size: 'medium',
    crust: 'thin',
    toppings: ['capsicum', 'onion', 'olive', 'corn'],
    price: 349
  },
  {
    name: 'Ultimate Supreme',
    size: 'large',
    crust: 'stuffed',
    toppings: ['pepperoni', 'chicken', 'olive', 'mushroom'],
    price: 499
  }
].map((pizza) => normalizePizzaData(pizza));

export const MENU_REGISTRY = {
  [DEFAULT_MENU_ID]: {
    id: DEFAULT_MENU_ID,
    name: 'Signature Pizza Menu',
    subtitle: 'Scan once, browse the full lineup, and open any pie in 3D.',
    pizzas: DEFAULT_MENU_PIZZAS
  }
};

export function getMenuById(menuId) {
  return MENU_REGISTRY[menuId] || null;
}

export function getMenuQrPayload(menuId = DEFAULT_MENU_ID) {
  return {
    type: 'menu',
    menuId,
    version: 1
  };
}
