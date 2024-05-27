import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { getEventStoreDBTestClient } from '#core/testing/event-store-DB';
import { EventStoreDBClient } from '@eventstore/db-client';
import { v4 as uuid } from 'uuid';

const appendToStream = async (
  _eventStore: EventStoreDBClient,
  _streamName: string,
  _events: ShoppingCartEvent[],
): Promise<bigint> => {
  // TODO: Fill append events logic here.
  return Promise.reject('Not implemented!');
};

describe('Appending events', () => {
  let eventStore: EventStoreDBClient;

  beforeAll(async () => {
    eventStore = await getEventStoreDBTestClient();
  });

  it('should append events to EventStoreDB', async () => {
    const shoppingCartId = uuid();
    const clientId = uuid();
    const pairOfShoes: PricedProductItem = {
      productId: uuid(),
      quantity: 1,
      unitPrice: 100,
    };

    const events: ShoppingCartEvent[] = [
      // 2. Put your sample events here
      {
        type: 'ShoppingCartOpened',
        data: {
          shoppingCartId,
          clientId,
          openedAt: new Date(),
        },
      },
      {
        type: 'ProductItemAddedToShoppingCart',
        data: {
          shoppingCartId,
          productItem: pairOfShoes,
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
          confirmedAt: new Date(),
        },
      },
      {
        type: 'ShoppingCartCancelled',
        data: {
          shoppingCartId,
          cancelledAt: new Date(),
        },
      },
    ];

    const streamName = `shopping_cart-${shoppingCartId}`;

    const appendedEventsCount = await appendToStream(
      eventStore,
      streamName,
      events,
    );

    expect(appendedEventsCount).toBe(BigInt(events.length - 1));
  });
});
