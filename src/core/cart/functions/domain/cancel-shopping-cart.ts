import { CancelShoppingCart } from '../../commands/cancel-shopping-cart.command';
import { ShoppingCartState } from '../../shopping-cart-state';
import { ShoppingCartStatus } from '../../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../../shopping-cart.errors';
import { ShoppingCartEvent } from '../../shopping-cart.event.type';

export function cancelShoppingCart(
  { data: command }: CancelShoppingCart,
  shoppingCart: ShoppingCartState,
): ShoppingCartEvent {
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
