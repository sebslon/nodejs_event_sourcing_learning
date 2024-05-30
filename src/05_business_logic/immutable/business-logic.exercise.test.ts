/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddProductItemToShoppingCart } from '#core/cart/commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '#core/cart/commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '#core/cart/commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '#core/cart/commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '#core/cart/commands/remove-product-item-from-shopping-cart.command';
import { addProductItemToShoppingCart } from '#core/cart/functions/domain/add-product-item-to-shopping-cart';
import { cancelShoppingCart } from '#core/cart/functions/domain/cancel-shopping-cart';
import { confirmShoppingCart } from '#core/cart/functions/domain/confirm-shopping-cart';
import { openShoppingCart } from '#core/cart/functions/domain/open-shopping-cart';
import { removeProductItemFromShoppingCart } from '#core/cart/functions/domain/remove-product-item-from-shopping-cart';
import { applyShoppingCartEvents } from '#core/cart/functions/get-shopping-cart';
import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartErrors } from '#core/cart/shopping-cart.errors';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { getInMemoryEventStore } from '#core/testing/event-store-in-memory';
import { v4 as uuid } from 'uuid';

describe('Business logic', () => {
  it('Should handle commands correctly', () => {
    const eventStore = getInMemoryEventStore();
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

    // Open
    const openCommand: OpenShoppingCart = {
      type: 'OpenShoppingCart',
      data: { shoppingCartId, clientId, now: openedAt },
    };
    const openEvent = openShoppingCart(openCommand);

    eventStore.appendToStream(shoppingCartId, openEvent);

    let cart = applyShoppingCartEvents(eventStore.readStream(shoppingCartId));

    // Add Two Pair of Shoes
    const addTwoPairsOfShoes: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: twoPairsOfShoes },
    };
    const addProductItemEvent = addProductItemToShoppingCart(
      addTwoPairsOfShoes,
      cart,
    );
    eventStore.appendToStream(shoppingCartId, addProductItemEvent);

    cart = applyShoppingCartEvents(eventStore.readStream(shoppingCartId));

    // Add T-Shirt
    const addTShirt: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: tShirt },
    };
    const addProductItemEvent2 = addProductItemToShoppingCart(addTShirt, cart);

    eventStore.appendToStream(shoppingCartId, addProductItemEvent2);

    cart = applyShoppingCartEvents(eventStore.readStream(shoppingCartId));

    // Remove pair of shoes
    const removePairOfShoes: RemoveProductItemFromShoppingCart = {
      type: 'RemoveProductItemFromShoppingCart',
      data: { shoppingCartId, productItem: pairOfShoes },
    };
    const removeProductItemEvent = removeProductItemFromShoppingCart(
      removePairOfShoes,
      cart,
    );

    eventStore.appendToStream(shoppingCartId, removeProductItemEvent);

    cart = applyShoppingCartEvents(eventStore.readStream(shoppingCartId));

    // Confirm
    const confirm: ConfirmShoppingCart = {
      type: 'ConfirmShoppingCart',
      data: { shoppingCartId, now: confirmedAt },
    };
    const confirmEvent = confirmShoppingCart(confirm, cart);

    eventStore.appendToStream(shoppingCartId, confirmEvent);

    cart = applyShoppingCartEvents(eventStore.readStream(shoppingCartId));

    // Try Cancel
    const cancel: CancelShoppingCart = {
      type: 'CancelShoppingCart',
      data: { shoppingCartId, now: cancelledAt },
    };

    expect(() => cancelShoppingCart(cancel, cart)).toThrow(
      ShoppingCartErrors.CART_IS_ALREADY_CLOSED,
    );

    const events = eventStore.readStream<ShoppingCartEvent>(shoppingCartId);

    expect(events).toEqual([
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
      // This should fail
      // {
      //   type: 'ShoppingCartCancelled',
      //   data: {
      //     shoppingCartId,
      //     cancelledAt,
      //   },
      // },
    ]);

    expect(
      events.find((e) => e.type === 'ShoppingCartCancelled'),
    ).toBeUndefined();

    const state = applyShoppingCartEvents(events);

    expect(state).toStrictEqual({
      id: shoppingCartId,
      clientId,
      status: ShoppingCartStatus.Confirmed,
      productItems: [pairOfShoes, tShirt],
      openedAt,
      confirmedAt,
    });
  });
});
