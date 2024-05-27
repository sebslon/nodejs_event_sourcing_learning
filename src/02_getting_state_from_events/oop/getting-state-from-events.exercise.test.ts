import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { v4 as uuid } from 'uuid';
import { ShoppingCart } from '../../core/cart/oop/shopping-cart';

describe('Events definition', () => {
  it('all event types should be defined', () => {
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

    const shoppingCart = ShoppingCart.from(events);

    expect(shoppingCart).toBeInstanceOf(ShoppingCart);

    expect(JSON.stringify(shoppingCart)).toStrictEqual(
      JSON.stringify(
        new ShoppingCart(
          shoppingCartId,
          clientId,
          ShoppingCartStatus.Cancelled,
          openedAt,
          [pairOfShoes, tShirt],
          confirmedAt,
          cancelledAt,
        ),
      ),
    );
  });
});
