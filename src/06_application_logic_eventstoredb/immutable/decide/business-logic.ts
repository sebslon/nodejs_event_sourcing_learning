import { assertProductItemExists } from '#core/cart/functions/assert-product-item-exists';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartCommand } from '#core/cart/shopping-cart.command.type';
import { ShoppingCartErrors } from '#core/cart/shopping-cart.errors';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { ShoppingCart } from '#core/cart/shopping-cart.type';

export const decide = (
  { type, data: command }: ShoppingCartCommand,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent => {
  switch (type) {
    case 'OpenShoppingCart': {
      if (shoppingCart.status !== ShoppingCartStatus.Empty) {
        throw new Error(ShoppingCartErrors.CART_ALREADY_EXISTS);
      }
      return {
        type: 'ShoppingCartOpened',
        data: {
          shoppingCartId: command.shoppingCartId,
          clientId: command.clientId,
          openedAt: command.now,
        },
      };
    }

    case 'AddProductItemToShoppingCart': {
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
    }

    case 'RemoveProductItemFromShoppingCart': {
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
    }

    case 'ConfirmShoppingCart': {
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
    }

    case 'CancelShoppingCart': {
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
    }
    default: {
      const _: never = command;
      throw new Error(ShoppingCartErrors.UNKNOWN_COMMAND_TYPE);
    }
  }
};
