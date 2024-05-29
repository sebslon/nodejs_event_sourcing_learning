import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { getEventStoreDBTestClient } from '#core/testing/event-store-DB';
import { EventStoreDBClient } from '@eventstore/db-client';
import { v4 as uuid } from 'uuid';
import { appendToStream } from '../../core/cart/functions/append-to-stream.function';
import { EventStoreDBRepository } from '../../core/cart/oop/event-store-db.repository';
import { ShoppingCart } from '../../core/cart/oop/shopping-cart';
import { ShoppingCartService } from '../../core/cart/oop/shopping-cart.service';

describe('[OOP] - Getting state from events', () => {
  let eventStore: EventStoreDBClient;

  beforeAll(async () => {
    eventStore = await getEventStoreDBTestClient();
  });

  it('should read events from stream and apply them creating a cart', async () => {
    const shoppingCartId = uuid();

    const clientId = uuid();
    const openedAt = new Date();
    const confirmedAt = new Date();
    const cancelledAt = new Date();

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
      // 2. Put your sample events here
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

    const repository = new EventStoreDBRepository(
      eventStore,
      () => ShoppingCart.from([]),
      ShoppingCart.getStreamId,
    );

    const shoppingCartService = new ShoppingCartService(repository);

    const shoppingCart = await shoppingCartService.get(shoppingCartId);

    if (!shoppingCart) {
      throw new Error('Shopping cart not found');
    }

    expect(shoppingCart).toBeDefined();

    expect(shoppingCart.cancelledAt).toBeInstanceOf(Date);
    expect(shoppingCart.confirmedAt).toBeInstanceOf(Date);
    expect(shoppingCart.openedAt).toBeInstanceOf(Date);

    const { evolve: _, ...actual } = shoppingCart;
    const { evolve: __, ...expected } = new ShoppingCart(
      shoppingCartId,
      clientId,
      ShoppingCartStatus.Cancelled,
      openedAt,
      [pairOfShoes, tShirt],
      confirmedAt,
      cancelledAt,
    );
    expect(actual).toStrictEqual(Object.assign({}, expected));
  });
});
