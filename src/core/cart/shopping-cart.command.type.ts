import { AddProductItemToShoppingCart } from './commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from './commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from './commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from './commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from './commands/remove-product-item-from-shopping-cart.command';

export type ShoppingCartCommand =
  | OpenShoppingCart
  | AddProductItemToShoppingCart
  | RemoveProductItemFromShoppingCart
  | ConfirmShoppingCart
  | CancelShoppingCart;
