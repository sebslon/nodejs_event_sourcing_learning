import { ShoppingCartDetails } from '#core/cart/shopping-cart-details.type';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { ShoppingCartShortInfo } from '#core/cart/shopping-cart.type';
import { DocumentsCollection } from './tools/database';
import { EventHandler } from './tools/eventStore';

export const getAndStore = <T>(
  collection: DocumentsCollection<T>,
  id: string,
  streamPosition: number,
  update: (document: T) => T,
) => {
  const document = collection.get(id) ?? ({} as T);

  collection.store(id, update(document), { externalVersion: streamPosition });
};

export const ShoppingCartDetailsProjection = (
  collection: DocumentsCollection<ShoppingCartDetails>,
): EventHandler<ShoppingCartEvent> => {
  return ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        getAndStore(collection, event.shoppingCartId, streamPosition, () => {
          return {
            id: event.shoppingCartId,
            status: ShoppingCartStatus.Pending,
            clientId: event.clientId,
            productItems: [],
            openedAt: event.openedAt.toISOString(),
            totalAmount: 0,
            totalItemsCount: 0,
          };
        });
        return;
      }
      case 'ProductItemAddedToShoppingCart': {
        getAndStore(
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
        getAndStore(
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
        getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            document.status = ShoppingCartStatus.Confirmed;
            document.confirmedAt = event.confirmedAt.toISOString();

            return document;
          },
        );
        return;
      }
      case 'ShoppingCartCancelled': {
        getAndStore(
          collection,
          event.shoppingCartId,
          streamPosition,
          (document) => {
            document.status = ShoppingCartStatus.Cancelled;
            document.cancelledAt = event.cancelledAt.toISOString();

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
};

export const ShoppingCartShortInfoProjection = (
  collection: DocumentsCollection<ShoppingCartShortInfo>,
): EventHandler<ShoppingCartEvent> => {
  return ({ type, data: event, metadata: { streamPosition } }) => {
    switch (type) {
      case 'ShoppingCartOpened': {
        getAndStore(collection, event.shoppingCartId, streamPosition, () => {
          return {
            id: event.shoppingCartId,
            clientId: event.clientId,
            totalAmount: 0,
            totalItemsCount: 0,
          };
        });
        return;
      }
      case 'ProductItemAddedToShoppingCart': {
        getAndStore(
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
        getAndStore(
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
        collection.delete(event.shoppingCartId);
        return;
      }
      case 'ShoppingCartCancelled': {
        collection.delete(event.shoppingCartId);
        return;
      }
    }
  };
};
