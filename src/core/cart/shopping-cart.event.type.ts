import { ProductItemAddedToShoppingCart } from './events/product-item-added-to-shopping-cart.event';
import { ProductItemRemovedFromShoppingCart } from './events/product-item-removed-from-shopping-cart.event';
import { ShoppingCartCancelled } from './events/shopping-cart-cancelled.event';
import { ShoppingCartConfirmed } from './events/shopping-cart-confirmed.event';
import { ShoppingCartOpened } from './events/shopping-cart-opened.event';

export type ShoppingCartEvent =
  | ShoppingCartOpened
  | ProductItemAddedToShoppingCart
  | ProductItemRemovedFromShoppingCart
  | ShoppingCartConfirmed
  | ShoppingCartCancelled;
