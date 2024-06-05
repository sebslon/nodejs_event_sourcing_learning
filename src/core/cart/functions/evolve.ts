import { ShoppingCartState } from '../shopping-cart-state';
import { ShoppingCartStatus } from '../shopping-cart-status.enum';
import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { addProductItem } from './add-product-item';
import { removeProductItem } from './remove-product-item';

export function evolveShoppingCart(
  state: ShoppingCartState,
  { type, data: event }: ShoppingCartEvent,
): ShoppingCartState {
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
      if (state.status !== ShoppingCartStatus.Pending) return state;

      const { productItems } = state;
      const { productItem } = event;

      return {
        ...state,
        productItems: addProductItem(productItems, productItem),
      };
    }
    case 'ProductItemRemovedFromShoppingCart': {
      if (state.status !== ShoppingCartStatus.Pending) return state;

      const { productItems } = state;
      const { productItem } = event;

      return {
        ...state,
        productItems: removeProductItem(productItems, productItem),
      };
    }
    case 'ShoppingCartConfirmed':
      if (state.status !== ShoppingCartStatus.Pending) return state;

      return {
        ...state,
        status: ShoppingCartStatus.Confirmed,
        confirmedAt: new Date(event.confirmedAt),
      };
    case 'ShoppingCartCancelled':
      if (state.status === ShoppingCartStatus.Empty) return state;

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
