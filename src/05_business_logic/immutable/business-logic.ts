import { AddProductItemToShoppingCart } from '#core/cart/commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '#core/cart/commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '#core/cart/commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '#core/cart/commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '#core/cart/commands/remove-product-item-from-shopping-cart.command';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { ShoppingCart } from '#core/cart/shopping-cart.type';

export const openShoppingCart = ({
  data: _command,
}: OpenShoppingCart): ShoppingCartEvent => {
  throw new Error('Fill the implementation part');
};

export const addProductItemToShoppingCart = (
  { data: _command }: AddProductItemToShoppingCart,
  _shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  throw new Error('Fill the implementation part');
};

export const removeProductItemFromShoppingCart = (
  { data: _command }: RemoveProductItemFromShoppingCart,
  _shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  throw new Error('Fill the implementation part');
};

export const confirmShoppingCart = (
  { data: _command }: ConfirmShoppingCart,
  _shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  throw new Error('Fill the implementation part');
};

export const cancelShoppingCart = (
  { data: _command }: CancelShoppingCart,
  _shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  throw new Error('Fill the implementation part');
};
