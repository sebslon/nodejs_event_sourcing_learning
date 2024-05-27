import {
  ProductItemAddedToShoppingCart,
  ProductItemRemovedFromShoppingCart,
  ShoppingCartCancelled,
  ShoppingCartConfirmed,
  ShoppingCartOpened,
} from '#core/cart/events';
import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { v4 as uuid } from 'uuid';

describe('Events definition', () => {
  it('all event types should be defined', () => {
    const shoppingCartId = uuid();
    const clientId = uuid();
    const product: PricedProductItem = {
      productId: uuid(),
      quantity: 1,
      unitPrice: 100,
    };

    const cartOpenedEvent: ShoppingCartOpened = {
      type: 'ShoppingCartOpened',
      data: {
        shoppingCartId,
        clientId,
        openedAt: new Date(),
      },
    };

    const productItemAddedEvent: ProductItemAddedToShoppingCart = {
      type: 'ProductItemAddedToShoppingCart',
      data: {
        shoppingCartId,
        productItem: product,
      },
    };

    const productItemRemovedEvent: ProductItemRemovedFromShoppingCart = {
      type: 'ProductItemRemovedFromShoppingCart',
      data: {
        shoppingCartId,
        productItem: product,
      },
    };

    const cartConfirmedEvent: ShoppingCartConfirmed = {
      type: 'ShoppingCartConfirmed',
      data: {
        shoppingCartId,
        confirmedAt: new Date(),
      },
    };

    const cartCancelledEvent: ShoppingCartCancelled = {
      type: 'ShoppingCartCancelled',
      data: {
        shoppingCartId,
        cancelledAt: new Date(),
      },
    };

    const events: ShoppingCartEvent[] = [
      cartOpenedEvent,
      productItemAddedEvent,
      productItemRemovedEvent,
      cartConfirmedEvent,
      cartCancelledEvent,
    ];
    expect(events.length).toBe(5);
  });
});
