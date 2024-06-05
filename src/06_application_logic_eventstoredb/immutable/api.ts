import { AddProductItemRequest } from '#core/cart/api/add-product-item.request';
import {
  PricedProductItem,
  ProductItem,
} from '#core/cart/product-item.interface';
import { ShoppingCartHandler } from '#core/cart/shopping-cart.handler';
import { CommandHandler } from '#core/shared/command-handler';
import { assertNotEmptyString } from '#core/shared/validation/assert-not-empty-string';
import { assertPositiveNumber } from '#core/shared/validation/assert-positive-number';
import { sendCreated } from '#core/testing/api';
import { getEventStore } from '#core/testing/event-store-DB/get-event-store.function';
import { EventStoreDBClient } from '@eventstore/db-client';
import { Request, Response, Router } from 'express';
import { v4 as uuid } from 'uuid';

export const mapShoppingCartStreamId = (id: string) => `shopping_cart-${id}`;

const dummyPrice = (_productId: string) => {
  return 100;
};

export const handle = CommandHandler(
  ShoppingCartHandler,
  mapShoppingCartStreamId,
);

export const shoppingCartApi =
  (eventStoreDB: EventStoreDBClient) => (router: Router) => {
    const eventStore = getEventStore(eventStoreDB);
    // Open Shopping cart
    router.post(
      '/clients/:clientId/shopping-carts/',
      async (request: Request, response: Response) => {
        const shoppingCartId = uuid();
        const clientId = assertNotEmptyString(request.params.clientId);

        await handle(eventStore, shoppingCartId, {
          type: 'OpenShoppingCart',
          data: { clientId, shoppingCartId, now: new Date() },
        });

        sendCreated(response, shoppingCartId);
      },
    );

    router.post(
      '/clients/:clientId/shopping-carts/:shoppingCartId/product-items',
      async (request: AddProductItemRequest, response: Response) => {
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );
        const productItem: ProductItem = {
          productId: assertNotEmptyString(request.body.productId),
          quantity: assertPositiveNumber(request.body.quantity),
        };
        const unitPrice = dummyPrice(productItem.productId);

        await handle(eventStore, shoppingCartId, {
          type: 'AddProductItemToShoppingCart',
          data: { shoppingCartId, productItem: { ...productItem, unitPrice } },
        });

        response.sendStatus(204);
      },
    );

    // Remove Product Item
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId/product-items',
      async (request: Request, response: Response) => {
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );
        const productItem: PricedProductItem = {
          productId: assertNotEmptyString(request.query.productId),
          quantity: assertPositiveNumber(Number(request.query.quantity)),
          unitPrice: assertPositiveNumber(Number(request.query.unitPrice)),
        };

        await handle(eventStore, shoppingCartId, {
          type: 'RemoveProductItemFromShoppingCart',
          data: { shoppingCartId, productItem },
        });

        response.sendStatus(204);
      },
    );

    // Confirm Shopping Cart
    router.post(
      '/clients/:clientId/shopping-carts/:shoppingCartId/confirm',
      async (request: Request, response: Response) => {
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        await handle(eventStore, shoppingCartId, {
          type: 'ConfirmShoppingCart',
          data: { shoppingCartId, now: new Date() },
        });

        response.sendStatus(204);
      },
    );

    // Cancel Shopping Cart
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId',
      async (request: Request, response: Response) => {
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        await handle(eventStore, shoppingCartId, {
          type: 'CancelShoppingCart',
          data: { shoppingCartId, now: new Date() },
        });

        response.sendStatus(204);
      },
    );
  };
