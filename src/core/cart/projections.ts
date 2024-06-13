import { DocumentsCollection } from '../shared/database';
import { EventHandler } from '../shared/event.type';
import {
  ShoppingCartDetails,
  ShoppingCartShortInfo,
} from './shopping-cart-details.type';
import { ShoppingCartStatus } from './shopping-cart-status.enum';
import { ShoppingCartEvent } from './shopping-cart.event.type';

export function getAndStore<T>(
  collection: DocumentsCollection<T>,
  id: string,
  update: (document: T) => T,
) {
  const document = collection.get(id) ?? ({} as T);

  collection.store(id, update(document));
}

export function ShoppingCartDetailsProjection(
  collection: DocumentsCollection<ShoppingCartDetails>,
): EventHandler<ShoppingCartEvent> {
  return ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

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
        });
        return;
      }

      case 'ProductItemAddedToShoppingCart': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          const { productItem } = event;
          const existingProductItem = document.productItems.find(
            (item) =>
              item.productId === productItem.productId &&
              item.unitPrice === productItem.unitPrice,
          );

          if (!existingProductItem) {
            document.productItems.push({ ...productItem });
          } else {
            document.productItems[
              document.productItems.indexOf(existingProductItem)
            ].quantity += productItem.quantity;
          }

          document.totalAmount += productItem.unitPrice * productItem.quantity;
          document.totalItemsCount += productItem.quantity;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

        return;
      }

      case 'ProductItemRemovedFromShoppingCart': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          const { productItem } = event;
          const existingProductItem = document.productItems.find(
            (item) =>
              item.productId === productItem.productId &&
              item.unitPrice === productItem.unitPrice,
          );

          if (existingProductItem == null) {
            return document;
          }

          existingProductItem.quantity -= productItem.quantity;

          if (existingProductItem.quantity == 0) {
            document.productItems.splice(
              document.productItems.indexOf(existingProductItem),
              1,
            );
          }

          document.totalAmount -= productItem.quantity * productItem.unitPrice;
          document.totalItemsCount -= productItem.quantity;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

        return;
      }

      case 'ShoppingCartConfirmed': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          document.status = ShoppingCartStatus.Confirmed;
          document.confirmedAt = event.confirmedAt;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

        return;
      }

      case 'ShoppingCartCancelled': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          document.status = ShoppingCartStatus.Cancelled;
          document.cancelledAt = event.cancelledAt;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

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
  return ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          return {
            id: event.shoppingCartId,
            clientId: event.clientId,
            totalAmount: 0,
            totalItemsCount: 0,
            lastProcessedPosition: streamPosition,
          };
        });

        return;
      }
      case 'ProductItemAddedToShoppingCart': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          const { productItem } = event;

          document.totalAmount += productItem.quantity * productItem.unitPrice;
          document.totalItemsCount += productItem.quantity;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

        return;
      }

      case 'ProductItemRemovedFromShoppingCart': {
        getAndStore(collection, event.shoppingCartId, (document) => {
          if (document.lastProcessedPosition >= streamPosition) return document;

          const { productItem } = event;

          document.totalAmount -= productItem.quantity * productItem.unitPrice;
          document.totalItemsCount -= productItem.quantity;

          document.lastProcessedPosition = streamPosition;

          return document;
        });

        return;
      }

      case 'ShoppingCartConfirmed': {
        collection.delete(event.shoppingCartId);
        return;
      }

      case 'ShoppingCartCancelled': {
        collection.delete(event.shoppingCartId);
        return;
      }
    }
  };
}
