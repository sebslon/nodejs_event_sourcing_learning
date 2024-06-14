import { DocumentsCollection } from '../shared/database';
import { EventHandler } from '../shared/event.type';
import {
  VersionedDocument,
  deleteWithRetries,
  getWithRetries,
  storeWithRetries,
} from '../shared/lib/eventual-consistency.lib';
import {
  ShoppingCartDetails,
  ShoppingCartShortInfo,
} from './shopping-cart-details.type';
import { ShoppingCartStatus } from './shopping-cart-status.enum';
import { ShoppingCartEvent } from './shopping-cart.event.type';

export async function getAndStore<T extends VersionedDocument>(
  collection: DocumentsCollection<T>,
  id: string,
  streamPosition: number,
  update: (document: T) => T,
) {
  const result = await getWithRetries(collection, id, streamPosition);

  if (result && result.isNewer) return; // there is a newer version

  const document = result?.document ?? ({} as T);
  const updated = update(document);

  updated.lastProcessedPosition = streamPosition;

  const updateResult = await storeWithRetries(
    collection,
    id,
    updated,
    streamPosition,
  );

  if (!updateResult) throw new Error('Failed to update');
}

export function ShoppingCartDetailsProjection(
  collection: DocumentsCollection<ShoppingCartDetails>,
): EventHandler<ShoppingCartEvent> {
  return async ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          () => {
            return {
              id: event.shoppingCartId,
              status: ShoppingCartStatus.Pending,
              clientId: event.clientId,
              productItems: [],
              openedAt: event.openedAt,
              totalAmount: 0,
              totalItemsCount: 0,
              lastProcessedPosition: streamPosition,
            };
          },
        );

        return;
      }

      case 'ProductItemAddedToShoppingCart': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            const { productItem } = event;
            const existingProductItem = document.productItems.find(
              (p) =>
                p.productId === productItem.productId &&
                p.unitPrice === productItem.unitPrice,
            );

            if (existingProductItem == null) {
              document.productItems.push({ ...productItem });
            } else {
              document.productItems[
                document.productItems.indexOf(existingProductItem)
              ].quantity += productItem.quantity;
            }

            document.totalAmount +=
              productItem.quantity * productItem.unitPrice;
            document.totalItemsCount += productItem.quantity;

            return document;
          },
        );

        return;
      }

      case 'ProductItemRemovedFromShoppingCart': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            const { productItem } = event;
            const existingProductItem = document.productItems.find(
              (p) =>
                p.productId === productItem.productId &&
                p.unitPrice === productItem.unitPrice,
            );

            if (existingProductItem == null) {
              // You may consider throwing exception here, depending on your strategy
              return document;
            }

            existingProductItem.quantity -= productItem.quantity;

            if (existingProductItem.quantity == 0) {
              document.productItems.splice(
                document.productItems.indexOf(existingProductItem),
                1,
              );
            }

            document.totalAmount -=
              productItem.quantity * productItem.unitPrice;
            document.totalItemsCount -= productItem.quantity;

            return document;
          },
        );

        return;
      }

      case 'ShoppingCartConfirmed': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            document.status = ShoppingCartStatus.Confirmed;
            document.confirmedAt = event.confirmedAt;

            return document;
          },
        );

        return;
      }

      case 'ShoppingCartCancelled': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            document.status = ShoppingCartStatus.Cancelled;
            document.cancelledAt = event.cancelledAt;

            return document;
          },
        );

        return;
      }

      default: {
        return;
      }
    }
  };
}

export function ShoppingCartShortInfoProjection(
  collection: DocumentsCollection<ShoppingCartShortInfo>,
): EventHandler<ShoppingCartEvent> {
  return async ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          () => {
            return {
              id: event.shoppingCartId,
              clientId: event.clientId,
              totalAmount: 0,
              totalItemsCount: 0,
              lastProcessedPosition: streamPosition,
            };
          },
        );

        return;
      }
      case 'ProductItemAddedToShoppingCart': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            const { productItem } = event;

            document.totalAmount +=
              productItem.quantity * productItem.unitPrice;
            document.totalItemsCount += productItem.quantity;

            return document;
          },
        );

        return;
      }

      case 'ProductItemRemovedFromShoppingCart': {
        await getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            const { productItem } = event;

            document.totalAmount -=
              productItem.quantity * productItem.unitPrice;
            document.totalItemsCount -= productItem.quantity;

            return document;
          },
        );

        return;
      }

      case 'ShoppingCartConfirmed': {
        await deleteWithRetries(collection, event.shoppingCartId);
        return;
      }

      case 'ShoppingCartCancelled': {
        await deleteWithRetries(collection, event.shoppingCartId);
        return;
      }
    }
  };
}
