import { AddProductItemToShoppingCart } from '#core/cart/commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '#core/cart/commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '#core/cart/commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '#core/cart/commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '#core/cart/commands/remove-product-item-from-shopping-cart.command';
import { assertProductItemExists } from '#core/cart/functions/assert-product-item-exists.function';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartErrors } from '#core/cart/shopping-cart.errors';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { ShoppingCart } from '#core/cart/shopping-cart.type';

export const openShoppingCart = ({
  data: command,
}: OpenShoppingCart): ShoppingCartEvent => {
  return {
    type: 'ShoppingCartOpened',
    data: {
      shoppingCartId: command.shoppingCartId,
      clientId: command.clientId,
      openedAt: command.now,
    },
  };
};

export const addProductItemToShoppingCart = (
  { data: command }: AddProductItemToShoppingCart,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  if (shoppingCart.status !== ShoppingCartStatus.Pending) {
    throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
  }
  return {
    type: 'ProductItemAddedToShoppingCart',
    data: {
      shoppingCartId: command.shoppingCartId,
      productItem: command.productItem,
    },
  };
};

export const removeProductItemFromShoppingCart = (
  { data: command }: RemoveProductItemFromShoppingCart,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  if (shoppingCart.status !== ShoppingCartStatus.Pending) {
    throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
  }

  assertProductItemExists(shoppingCart.productItems, command.productItem);

  return {
    type: 'ProductItemRemovedFromShoppingCart',
    data: {
      shoppingCartId: command.shoppingCartId,
      productItem: command.productItem,
    },
  };
};

export const confirmShoppingCart = (
  { data: command }: ConfirmShoppingCart,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  if (shoppingCart.status !== ShoppingCartStatus.Pending) {
    throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
  }

  if (shoppingCart.productItems.length === 0) {
    throw new Error(ShoppingCartErrors.CART_IS_EMPTY);
  }

  return {
    type: 'ShoppingCartConfirmed',
    data: {
      shoppingCartId: command.shoppingCartId,
      confirmedAt: command.now,
    },
  };
};

export const cancelShoppingCart = (
  { data: command }: CancelShoppingCart,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  if (shoppingCart.status !== ShoppingCartStatus.Pending) {
    throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
  }

  return {
    type: 'ShoppingCartCancelled',
    data: {
      shoppingCartId: command.shoppingCartId,
      cancelledAt: command.now,
    },
  };
};
