import { ShoppingCartService } from '#core/cart/oop/shopping-cart.service';
import {
  PricedProductItem,
  ProductItem,
} from '#core/cart/product-item.interface';
import {
  getExpectedRevision,
  setNextExpectedRevision,
} from '#core/shared/etag';
import { assertNotEmptyString } from '#core/shared/validation/assert-not-empty-string';
import { assertPositiveNumber } from '#core/shared/validation/assert-positive-number';
import { sendCreated } from '#core/testing/api';
import { createHash } from 'crypto';
import { Request, Response, Router } from 'express';
import { AddProductItemRequest } from '../../core/cart/api/add-product-item.request';

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
        const clientId = assertNotEmptyString(request.params.clientId);
        const shoppingCartId = createHash('sha256')
          .update(clientId)
          .digest('hex');

        const nextExpectedRevision = await shoppingCartService.open(
          {
            type: 'OpenShoppingCart',
            data: {
              shoppingCartId,
              clientId,
              now: new Date(),
            },
          },
          { expectedRevision: -1n },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
        sendCreated(response, shoppingCartId);
      },
    );

    // Add Product Item
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
        const unitPrice = dummyPriceProvider(productItem.productId);

        const nextExpectedRevision = await shoppingCartService.addProductItem(
          {
            type: 'AddProductItemToShoppingCart',
            data: {
              shoppingCartId,
              productItem: {
                ...productItem,
                unitPrice,
              },
            },
          },
          { expectedRevision: getExpectedRevision(request) },
        );

        setNextExpectedRevision(response, nextExpectedRevision);
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

        const nextExpectedRevision =
          await shoppingCartService.removeProductItem(
            {
              type: 'RemoveProductItemFromShoppingCart',
              data: {
                shoppingCartId,
                productItem,
              },
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
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        const nextExpectedRevision = await shoppingCartService.confirm(
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
        const shoppingCartId = assertNotEmptyString(
          request.params.shoppingCartId,
        );

        const nextExpectedRevision = await shoppingCartService.cancel(
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
