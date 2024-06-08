import { AddProductItemRequest } from '#core/cart/api/add-product-item.request';
import {
  PricedProductItem,
  ProductItem,
} from '#core/cart/product-item.interface';
import { ShoppingCartHandler } from '#core/cart/shopping-cart.handler';
import { CommandHandler } from '#core/shared/command-handler';
import {
  getETagFromIfMatch,
  getExpectedRevision,
  getWeakETagValue,
  setNextExpectedRevision,
} from '#core/shared/etag';
import { getEventStore } from '#core/shared/get-event-store.function';
import { assertNotEmptyString } from '#core/shared/validation/assert-not-empty-string';
import { assertPositiveNumber } from '#core/shared/validation/assert-positive-number';
import { sendCreated } from '#core/testing/api';
import { EventStoreDBClient } from '@eventstore/db-client';
import { Request, Response, Router } from 'express';

export const mapShoppingCartStreamId = (id: string) => `shopping_cart-${id}`;

export const handle = CommandHandler(
  ShoppingCartHandler,
  mapShoppingCartStreamId,
);

const dummyPriceProvider = (_productId: string) => {
  return 100;
};

export const shoppingCartApi =
  (eventStoreDB: EventStoreDBClient) => (router: Router) => {
    const eventStore = getEventStore(eventStoreDB);
    // Open Shopping cart
    router.post(
      '/clients/:clientId/shopping-carts/',
      async (request: Request, response: Response) => {
        const clientId = assertNotEmptyString(request.params.clientId);
        const shoppingCartId = clientId;

        const nextExpectedRevision = await handle(
          eventStore,
          shoppingCartId,
          {
            type: 'OpenShoppingCart',
            data: { clientId, shoppingCartId, now: new Date() },
          },
          { expectedRevision: -1n },
        );

        console.log(nextExpectedRevision);

        setNextExpectedRevision(response, nextExpectedRevision);
        sendCreated(response, shoppingCartId);
      },
    );

    // Add Product Item
    router.post(
      '/clients/:clientId/shopping-carts/:shoppingCartId/product-items',
      async (request: AddProductItemRequest, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        // Use this to ensure that there's no conflicting update
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );
        const productItem: ProductItem = {
          productId: assertNotEmptyString(request.body.productId),
          quantity: assertPositiveNumber(request.body.quantity),
        };
        const unitPrice = dummyPriceProvider(productItem.productId);

        const nextExpectedRevision = await handle(
          eventStore,
          shoppingCartId,
          {
            type: 'AddProductItemToShoppingCart',
            data: {
              shoppingCartId,
              productItem: { ...productItem, unitPrice },
            },
          },
          {
            expectedRevision: getExpectedRevision(request),
          },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
        response.sendStatus(204);
      },
    );

    // Remove Product Item
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId/product-items',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );
        const productItem: PricedProductItem = {
          productId: assertNotEmptyString(request.query.productId),
          quantity: assertPositiveNumber(Number(request.query.quantity)),
          unitPrice: assertPositiveNumber(Number(request.query.unitPrice)),
        };

        const nextExpectedRevision = await handle(
          eventStore,
          shoppingCartId,
          {
            type: 'RemoveProductItemFromShoppingCart',
            data: { shoppingCartId, productItem },
          },
          { expectedRevision: getExpectedRevision(request) },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
        response.sendStatus(204);
      },
    );

    // Confirm Shopping Cart
    router.post(
      '/clients/:clientId/shopping-carts/:shoppingCartId/confirm',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        const nextExpectedRevision = await handle(
          eventStore,
          shoppingCartId,
          {
            type: 'ConfirmShoppingCart',
            data: { shoppingCartId, now: new Date() },
          },
          { expectedRevision: getExpectedRevision(request) },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
        response.sendStatus(204);
      },
    );

    // Cancel Shopping Cart
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        const nextExpectedRevision = await handle(
          eventStore,
          shoppingCartId,
          {
            type: 'CancelShoppingCart',
            data: { shoppingCartId, now: new Date() },
          },
          { expectedRevision: getExpectedRevision(request) },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
        response.sendStatus(204);
      },
    );
  };
