import { ShoppingCartStatus } from '../shopping-cart-status.enum';
import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { ShoppingCart } from '../shopping-cart.type';
import { addProductItem } from './add-product-item';
import { removeProductItem } from './remove-product-item';

export function evolve(
  state: ShoppingCart,
  { type, data: event }: ShoppingCartEvent,
) {
  switch (type) {
    case 'ShoppingCartOpened':
      return {
        id: event.shoppingCartId,
        clientId: event.clientId,
        openedAt: new Date(event.openedAt),
        productItems: [],
        status: ShoppingCartStatus.Pending,
      };
    case 'ProductItemAddedToShoppingCart': {
      const { productItems } = state;
      const { productItem } = event;

      return {
        ...state,
        productItems: addProductItem(productItems, productItem),
      };
    }
    case 'ProductItemRemovedFromShoppingCart': {
      const { productItems } = state;
      const { productItem } = event;

      return {
        ...state,
        productItems: removeProductItem(productItems, productItem),
      };
    }
    case 'ShoppingCartConfirmed':
      return {
        ...state,
        status: ShoppingCartStatus.Confirmed,
        confirmedAt: new Date(event.confirmedAt),
      };
    case 'ShoppingCartCancelled':
      return {
        ...state,
        status: ShoppingCartStatus.Cancelled,
        cancelledAt: new Date(event.cancelledAt),
      };
    default: {
      const _: never = type;

      throw new Error('Unknown event type', type);
    }
  }
}
