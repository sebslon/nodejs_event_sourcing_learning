/* eslint-disable @typescript-eslint/no-unused-vars */
import { AddProductItemToShoppingCart } from '#core/cart/commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '#core/cart/commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '#core/cart/commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '#core/cart/commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '#core/cart/commands/remove-product-item-from-shopping-cart.command';
import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartErrors } from '#core/cart/shopping-cart.errors';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { getEventStore } from '#core/shared/functions/get-event-store.function';
import { v4 as uuid } from 'uuid';
import {
  addProductItemToShoppingCart,
  cancelShoppingCart,
  confirmShoppingCart,
  openShoppingCart,
  removeProductItemFromShoppingCart,
} from './business-logic';
import { getShoppingCart } from './shopping-cart';

describe('Business logic', () => {
  it('Should handle commands correctly', () => {
    const eventStore = getEventStore();
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

    let result: ShoppingCartEvent[] = [];

    // Open
    const open: OpenShoppingCart = {
      type: 'OpenShoppingCart',
      data: { shoppingCartId, clientId, now: openedAt },
    };
    result = [openShoppingCart(open)];
    eventStore.appendToStream(shoppingCartId, ...result);

    // Add Two Pair of Shoes
    const addTwoPairsOfShoes: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: twoPairsOfShoes },
    };

    let state = getShoppingCart(eventStore.readStream(shoppingCartId));
    result = [addProductItemToShoppingCart(addTwoPairsOfShoes, state)];

    eventStore.appendToStream(shoppingCartId, ...result);

    // Add T-Shirt
    const addTShirt: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: tShirt },
    };

    state = getShoppingCart(eventStore.readStream(shoppingCartId));
    result = [addProductItemToShoppingCart(addTShirt, state)];
    eventStore.appendToStream(shoppingCartId, ...result);

    // Remove pair of shoes
    const removePairOfShoes: RemoveProductItemFromShoppingCart = {
      type: 'RemoveProductItemFromShoppingCart',
      data: { shoppingCartId, productItem: pairOfShoes },
    };

    state = getShoppingCart(eventStore.readStream(shoppingCartId));
    result = [removeProductItemFromShoppingCart(removePairOfShoes, state)];
    eventStore.appendToStream(shoppingCartId, ...result);

    // Confirm
    const confirm: ConfirmShoppingCart = {
      type: 'ConfirmShoppingCart',
      data: { shoppingCartId, now: confirmedAt },
    };

    state = getShoppingCart(eventStore.readStream(shoppingCartId));
    result = [confirmShoppingCart(confirm, state)];
    eventStore.appendToStream(shoppingCartId, ...result);

    // Try Cancel
    const cancel: CancelShoppingCart = {
      type: 'CancelShoppingCart',
      data: { shoppingCartId, now: cancelledAt },
    };
    const onCancel = () => {
      state = getShoppingCart(eventStore.readStream(shoppingCartId));
      result = [cancelShoppingCart(cancel, state)];
      eventStore.appendToStream(shoppingCartId, ...result);
    };

    expect(onCancel).toThrow(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);

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

    const shoppingCart = getShoppingCart(events);

    expect(shoppingCart).toStrictEqual({
      id: shoppingCartId,
      clientId,
      status: ShoppingCartStatus.Confirmed,
      productItems: [pairOfShoes, tShirt],
      openedAt,
      confirmedAt,
    });
  });
});
