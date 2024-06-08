import {
  PricedProductItem,
  ProductItem,
} from '#core/cart/product-item.interface';
import { Request, Response, Router } from 'express';
import { v4 as uuid } from 'uuid';

import { ShoppingCartService } from './application-service';
import {
  getETagFromIfMatch,
  getWeakETagValue,
} from '../../../core/shared/etag';
import { assertNotEmptyString } from '../../../core/shared/validation/assert-not-empty-string';
import { assertPositiveNumber } from '../../../core/shared/validation/assert-positive-number';
import { sendCreated } from '../../../core/testing/api';

export const mapShoppingCartStreamId = (id: string) => `shopping_cart-${id}`;

const dummyPriceProvider = (_productId: string) => {
  return 100;
};

export const shoppingCartApi =
  (shoppingCartService: ShoppingCartService) => (router: Router) => {
    // Open Shopping cart
    router.post(
      '/clients/:clientId/shopping-carts/',
      async (request: Request, response: Response) => {
        const shoppingCartId = uuid();
        const clientId = assertNotEmptyString(request.params.clientId);

        await shoppingCartService.open({
          type: 'OpenShoppingCart',
          data: {
            shoppingCartId,
            clientId,
            now: new Date(),
          },
        });

        // Get the next expected revision after appending events from business logic
        // setETag(response, nextEtag);
        sendCreated(response, shoppingCartId);
      },
    );

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

        await shoppingCartService.addProductItem({
          type: 'AddProductItemToShoppingCart',
          data: {
            shoppingCartId,
            productItem: {
              ...productItem,
              unitPrice,
            },
          },
        });

        // Get the next expected revision after appending events from business logic
        // setETag(response, nextEtag);
        response.sendStatus(204);
      },
    );

    // Remove Product Item
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId/product-items',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        // Use this to ensure that there's no conflicting update
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );
        const productItem: PricedProductItem = {
          productId: assertNotEmptyString(request.query.productId),
          quantity: assertPositiveNumber(Number(request.query.quantity)),
          unitPrice: assertPositiveNumber(Number(request.query.unitPrice)),
        };

        await shoppingCartService.removeProductItem({
          type: 'RemoveProductItemFromShoppingCart',
          data: {
            shoppingCartId,
            productItem,
          },
        });

        // Get the next expected revision after appending events from business logic
        // setETag(response, nextEtag);
        response.sendStatus(204);
      },
    );

    // Confirm Shopping Cart
    router.post(
      '/clients/:clientId/shopping-carts/:shoppingCartId/confirm',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        // Use this to ensure that there's no conflicting update
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        await shoppingCartService.confirm({
          type: 'ConfirmShoppingCart',
          data: { shoppingCartId, now: new Date() },
        });

        // Get the next expected revision after appending events from business logic
        // setETag(response, nextEtag);
        response.sendStatus(204);
      },
    );

    // Cancel Shopping Cart
    router.delete(
      '/clients/:clientId/shopping-carts/:shoppingCartId',
      async (request: Request, response: Response) => {
        const eTag = getETagFromIfMatch(request);
        // Use this to ensure that there's no conflicting update
        const _weakEtag = getWeakETagValue(eTag);

        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        await shoppingCartService.cancel({
          type: 'CancelShoppingCart',
          data: { shoppingCartId, now: new Date() },
        });

        // Get the next expected revision after appending events from business logic
        // setETag(response, nextEtag);
        response.sendStatus(204);
      },
    );
  };

// Add Product Item
type AddProductItemRequest = Request<
  Partial<{ shoppingCartId: string }>,
  unknown,
  Partial<{ productId: number; quantity: number }>
>;
