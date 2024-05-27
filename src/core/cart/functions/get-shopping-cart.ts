import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { ShoppingCart } from '../shopping-cart.type';
import { evolve } from './evolve';

export function getShoppingCart(events: ShoppingCartEvent[]): ShoppingCart {
  return events.reduce<ShoppingCart>(evolve, {} as ShoppingCart);
}
