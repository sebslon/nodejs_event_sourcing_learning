import { ConfirmShoppingCart } from '../../commands/confirm-shopping-cart.command';
import { ShoppingCartStatus } from '../../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../../shopping-cart.errors';
import { ShoppingCart } from '../../shopping-cart.type';

export function confirmShoppingCart(
  { data: command }: ConfirmShoppingCart,
  shoppingCart: ShoppingCart,
) {
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
