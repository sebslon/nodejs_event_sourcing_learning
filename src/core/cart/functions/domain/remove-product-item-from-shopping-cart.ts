import { RemoveProductItemFromShoppingCart } from '../../commands/remove-product-item-from-shopping-cart.command';
import { ShoppingCartState } from '../../shopping-cart-state';
import { ShoppingCartStatus } from '../../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../../shopping-cart.errors';
import { assertProductItemExists } from '../assert-product-item-exists';

export function removeProductItemFromShoppingCart(
  { data: command }: RemoveProductItemFromShoppingCart,
  shoppingCart: ShoppingCartState,
) {
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
