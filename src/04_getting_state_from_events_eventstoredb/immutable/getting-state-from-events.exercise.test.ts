import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { getEventStoreDBTestClient } from '#core/testing/event-store-DB';
import { EventStoreDBClient } from '@eventstore/db-client';
import { v4 as uuid } from 'uuid';
import { appendToStream } from '../../core/cart/functions/append-to-stream';
import { getShoppingCart } from '../../core/cart/functions/get-shopping-cart';

describe('[FUNC] - Getting state from events from EventStoreDB', () => {
  let eventStore: EventStoreDBClient;

  beforeAll(async () => {
    eventStore = await getEventStoreDBTestClient();
  });

  it('should read events from stream and apply them creating a cart', async () => {
    const shoppingCartId = uuid();

    const clientId = uuid();
    const openedAt = new Date('2020-10-10');
    const confirmedAt = new Date('2020-10-10');
    const cancelledAt = new Date('2020-10-10');

    const shoesId = uuid();

    const twoPairsOfShoes: PricedProductItem = {
      productId: shoesId,
      quantity: 2,
      unitPrice: 100,
    };
    const pairOfShoes: PricedProductItem = {
      productId: shoesId,
      quantity: 1,
      unitPrice: 100,
    };

    const tShirtId = uuid();
    const tShirt: PricedProductItem = {
      productId: tShirtId,
      quantity: 1,
      unitPrice: 5,
    };

    const events: ShoppingCartEvent[] = [
      {
        type: 'ShoppingCartOpened',
        data: {
          shoppingCartId,
          clientId,
          openedAt,
        },
      },
      {
        type: 'ProductItemAddedToShoppingCart',
        data: {
          shoppingCartId,
          productItem: twoPairsOfShoes,
        },
      },
      {
        type: 'ProductItemAddedToShoppingCart',
        data: {
          shoppingCartId,
          productItem: tShirt,
        },
      },
      {
        type: 'ProductItemRemovedFromShoppingCart',
        data: { shoppingCartId, productItem: pairOfShoes },
      },
      {
        type: 'ShoppingCartConfirmed',
        data: {
          shoppingCartId,
          confirmedAt,
        },
      },
      {
        type: 'ShoppingCartCancelled',
        data: {
          shoppingCartId,
          cancelledAt,
        },
      },
    ];

    const streamName = `shopping_cart-${shoppingCartId}`;

    await appendToStream(eventStore, streamName, events);

    const shoppingCart = await getShoppingCart(eventStore, streamName);

    expect(shoppingCart).toStrictEqual({
      id: shoppingCartId,
      clientId,
      status: ShoppingCartStatus.Cancelled,
      productItems: [pairOfShoes, tShirt],
      openedAt,
      confirmedAt,
      cancelledAt,
    });
  });
});
