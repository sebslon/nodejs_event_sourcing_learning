import { AddProductItemToShoppingCart } from '../../commands/add-product-item-to-shopping-cart.command';
import { ShoppingCartStatus } from '../../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../../shopping-cart.errors';
import { ShoppingCartEvent } from '../../shopping-cart.event.type';
import { ShoppingCart } from '../../shopping-cart.type';

export function addProductItemToShoppingCart(
  { data: command }: AddProductItemToShoppingCart,
  shoppingCart: ShoppingCart,
): ShoppingCartEvent {
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
