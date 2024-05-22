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
import { v4 as uuid } from 'uuid';
import { getEventStore } from './core';
import { ShoppingCart, getShoppingCart } from './shopping-cart';

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

    // Open
    const open: OpenShoppingCart = {
      type: 'OpenShoppingCart',
      data: { shoppingCartId, clientId, now: openedAt },
    };
    let shoppingCart = ShoppingCart.open(
      open.data.shoppingCartId,
      open.data.clientId,
      open.data.now,
    );
    eventStore.appendToStream(shoppingCartId, ...shoppingCart.uncommitedEvents);

    // Add Two Pair of Shoes
    const addTwoPairsOfShoes: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: twoPairsOfShoes },
    };

    shoppingCart = getShoppingCart(eventStore.readStream(shoppingCartId));
    shoppingCart.addProductItem(addTwoPairsOfShoes.data.productItem);

    eventStore.appendToStream(shoppingCartId, ...shoppingCart.uncommitedEvents);

    // Add T-Shirt
    const addTShirt: AddProductItemToShoppingCart = {
      type: 'AddProductItemToShoppingCart',
      data: { shoppingCartId, productItem: tShirt },
    };

    shoppingCart = getShoppingCart(eventStore.readStream(shoppingCartId));
    shoppingCart.addProductItem(addTShirt.data.productItem);

    eventStore.appendToStream(shoppingCartId, ...shoppingCart.uncommitedEvents);

    // Remove pair of shoes
    const removePairOfShoes: RemoveProductItemFromShoppingCart = {
      type: 'RemoveProductItemFromShoppingCart',
      data: { shoppingCartId, productItem: pairOfShoes },
    };

    shoppingCart = getShoppingCart(eventStore.readStream(shoppingCartId));
    shoppingCart.removeProductItem(removePairOfShoes.data.productItem);

    eventStore.appendToStream(shoppingCartId, ...shoppingCart.uncommitedEvents);

    // Confirm
    const confirm: ConfirmShoppingCart = {
      type: 'ConfirmShoppingCart',
      data: { shoppingCartId, now: confirmedAt },
    };

    shoppingCart = getShoppingCart(eventStore.readStream(shoppingCartId));
    shoppingCart.confirm(confirm.data.now);

    eventStore.appendToStream(shoppingCartId, ...shoppingCart.uncommitedEvents);

    const cancel: CancelShoppingCart = {
      type: 'CancelShoppingCart',
      data: { shoppingCartId, now: cancelledAt },
    };
    const onCancel = () => {
      shoppingCart = getShoppingCart(eventStore.readStream(shoppingCartId));
      shoppingCart.cancel(cancel.data.now);

      eventStore.appendToStream(
        shoppingCartId,
        ...shoppingCart.uncommitedEvents,
      );
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

    shoppingCart = getShoppingCart(events);

    expect(shoppingCart).toBeInstanceOf(ShoppingCart);
    const actual = {
      shoppingCartId: shoppingCart.id,
      clientId: shoppingCart.clientId,
      status: shoppingCart.status,
      openedAt: shoppingCart.openedAt,
      productItems: shoppingCart.productItems,
      confirmedAt: shoppingCart.confirmedAt,
    };

    expect(actual).toEqual({
      shoppingCartId,
      clientId,
      status: ShoppingCartStatus.Confirmed,
      openedAt,
      productItems: [pairOfShoes, tShirt],
      confirmedAt,
    });
  });
});
