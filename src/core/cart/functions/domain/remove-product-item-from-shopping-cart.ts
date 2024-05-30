import { RemoveProductItemFromShoppingCart } from '../../commands/remove-product-item-from-shopping-cart.command';
import { ShoppingCartStatus } from '../../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../../shopping-cart.errors';
import { ShoppingCart } from '../../shopping-cart.type';
import { assertProductItemExists } from '../assert-product-item-exists';

export function removeProductItemFromShoppingCart(
  { data: command }: RemoveProductItemFromShoppingCart,
  shoppingCart: ShoppingCart,
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
