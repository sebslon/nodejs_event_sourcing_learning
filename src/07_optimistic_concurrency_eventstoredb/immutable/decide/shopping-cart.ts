import {
  ShoppingCartState,
  emptyShoppingCart,
} from '#core/cart/shopping-cart-state';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { merge } from '../../tools/utils';

export const evolve = (
  state: ShoppingCartState,
  { type, data: event }: ShoppingCartEvent,
): ShoppingCartState => {
  switch (type) {
    case 'ShoppingCartOpened':
      return {
        id: event.shoppingCartId,
        clientId: event.clientId,
        openedAt: event.openedAt,
        productItems: [],
        status: ShoppingCartStatus.Pending,
      };
    case 'ProductItemAddedToShoppingCart': {
      if (state.status !== ShoppingCartStatus.Pending) return state;

      const { productItems } = state;
      const { productItem } = event;

      return {
        ...state,
        productItems: merge(
          productItems,
          productItem,
          (p) =>
            p.productId === productItem.productId &&
            p.unitPrice === productItem.unitPrice,
          (p) => {
            return {
              ...p,
              quantity: p.quantity + productItem.quantity,
            };
          },
          () => productItem,
        ),
      };
    }
    case 'ProductItemRemovedFromShoppingCart': {
      if (state.status !== ShoppingCartStatus.Pending) return state;

      const { productItems } = state;
      const { productItem } = event;
      return {
        ...state,
        productItems: merge(
          productItems,
          productItem,
          (p) =>
            p.productId === productItem.productId &&
            p.unitPrice === productItem.unitPrice,
          (p) => {
            return {
              ...p,
              quantity: p.quantity - productItem.quantity,
            };
          },
        ),
      };
    }
    case 'ShoppingCartConfirmed':
      if (state.status !== ShoppingCartStatus.Pending) return state;

      return {
        ...state,
        status: ShoppingCartStatus.Confirmed,
        confirmedAt: event.confirmedAt,
      };
    case 'ShoppingCartCancelled':
      if (state.status !== ShoppingCartStatus.Pending) return state;

      return {
        ...state,
        status: ShoppingCartStatus.Cancelled,
        cancelledAt: event.cancelledAt,
      };
  }
};

export const getShoppingCart = (
  events: ShoppingCartEvent[],
): ShoppingCartState => {
  return events.reduce<ShoppingCartState>(evolve, emptyShoppingCart);
};
