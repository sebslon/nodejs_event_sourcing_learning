import { ProductItemAddedToShoppingCart } from '#core/cart/events/product-item-added-to-shopping-cart.event';
import { ProductItemRemovedFromShoppingCart } from '#core/cart/events/product-item-removed-from-shopping-cart.event';
import { ShoppingCartCancelled } from '#core/cart/events/shopping-cart-cancelled.event';
import { ShoppingCartConfirmed } from '#core/cart/events/shopping-cart-confirmed.event';
import { ShoppingCartOpened } from '#core/cart/events/shopping-cart-opened.event';
import { assertProductItemExists } from '#core/cart/functions/assert-product-item-exists.function';
import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartErrors } from '#core/cart/shopping-cart.errors';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';

export class ShoppingCart {
  private constructor(
    private _id: string,
    private _clientId: string,
    private _status: ShoppingCartStatus,
    private _openedAt: Date,
    private _productItems: PricedProductItem[] = [],
    private _confirmedAt?: Date,
    private _cancelledAt?: Date,
  ) {}

  get id() {
    return this._id;
  }

  get clientId() {
    return this._clientId;
  }

  get status() {
    return this._status;
  }

  get openedAt() {
    return this._openedAt;
  }

  get productItems() {
    return this._productItems;
  }

  get confirmedAt() {
    return this._confirmedAt;
  }

  get cancelledAt() {
    return this._cancelledAt;
  }

  public static default = () =>
    new ShoppingCart(
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined,
      undefined,
      undefined,
    );

  public static open = (
    shoppingCartId: string,
    clientId: string,
    now: Date,
  ): ShoppingCartOpened => {
    return {
      type: 'ShoppingCartOpened',
      data: { shoppingCartId, clientId, openedAt: now },
    };
  };

  public addProductItem = (
    productItem: PricedProductItem,
  ): ProductItemAddedToShoppingCart => {
    this.assertIsPending();

    return {
      type: 'ProductItemAddedToShoppingCart',
      data: { productItem, shoppingCartId: this._id },
    };
  };

  public removeProductItem = (
    productItem: PricedProductItem,
  ): ProductItemRemovedFromShoppingCart => {
    this.assertIsPending();
    this.assertProductItemExists(productItem);

    return {
      type: 'ProductItemRemovedFromShoppingCart',
      data: { productItem, shoppingCartId: this._id },
    };
  };

  public confirm = (now: Date): ShoppingCartConfirmed => {
    this.assertIsPending();
    this.assertIsNotEmpty();

    return {
      type: 'ShoppingCartConfirmed',
      data: { shoppingCartId: this._id, confirmedAt: now },
    };
  };

  public cancel = (now: Date): ShoppingCartCancelled => {
    this.assertIsPending();

    return {
      type: 'ShoppingCartCancelled',
      data: { shoppingCartId: this._id, cancelledAt: now },
    };
  };

  public static evolve = (
    state: ShoppingCart,
    { type, data: event }: ShoppingCartEvent,
  ): ShoppingCart => {
    switch (type) {
      case 'ShoppingCartOpened': {
        state._id = event.shoppingCartId;
        state._clientId = event.clientId;
        state._status = ShoppingCartStatus.Pending;
        state._openedAt = event.openedAt;
        state._productItems = [];
        return state;
      }
      case 'ProductItemAddedToShoppingCart': {
        const {
          productItem: { productId, quantity, unitPrice },
        } = event;

        const currentProductItem = state._productItems.find(
          (pi) => pi.productId === productId && pi.unitPrice === unitPrice,
        );

        if (currentProductItem) {
          currentProductItem.quantity += quantity;
        } else {
          state._productItems.push({ ...event.productItem });
        }
        return state;
      }
      case 'ProductItemRemovedFromShoppingCart': {
        const {
          productItem: { productId, quantity, unitPrice },
        } = event;

        const currentProductItem = state._productItems.find(
          (pi) => pi.productId === productId && pi.unitPrice === unitPrice,
        );

        if (!currentProductItem) {
          return state;
        }

        currentProductItem.quantity -= quantity;

        if (currentProductItem.quantity <= 0) {
          state._productItems.splice(
            state._productItems.indexOf(currentProductItem),
            1,
          );
        }
        return state;
      }
      case 'ShoppingCartConfirmed': {
        state._status = ShoppingCartStatus.Confirmed;
        state._confirmedAt = event.confirmedAt;
        return state;
      }
      case 'ShoppingCartCancelled': {
        state._status = ShoppingCartStatus.Cancelled;
        state._cancelledAt = event.cancelledAt;
        return state;
      }
      default: {
        const _: never = type;
        throw new Error(ShoppingCartErrors.UNKNOWN_EVENT_TYPE);
      }
    }
  };

  private assertIsPending = (): void => {
    if (this._status !== ShoppingCartStatus.Pending) {
      throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
    }
  };

  private assertProductItemExists = ({
    productId,
    quantity,
    unitPrice,
  }: PricedProductItem): void => {
    // Exported as a function because it's used in some other places
    assertProductItemExists(this._productItems, {
      productId,
      quantity,
      unitPrice,
    });
  };

  private assertIsNotEmpty = (): void => {
    if (this._productItems.length === 0) {
      throw new Error(ShoppingCartErrors.CART_IS_EMPTY);
    }
  };
}

export const getShoppingCart = (events: ShoppingCartEvent[]): ShoppingCart => {
  return events.reduce<ShoppingCart>(
    ShoppingCart.evolve,
    ShoppingCart.default(),
  );
};
