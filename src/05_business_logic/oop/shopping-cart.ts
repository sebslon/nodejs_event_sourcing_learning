import { PricedProductItem } from '#core/cart/product-item.interface';
import { ShoppingCartStatus } from '#core/cart/shopping-cart-status.enum';
import { ShoppingCartEvent } from '#core/cart/shopping-cart.event.type';
import { Event } from './core';

export class ShoppingCart {
  constructor(
    private _id: string,
    private _clientId: string,
    private _status: ShoppingCartStatus,
    private _openedAt: Date,
    private _productItems: PricedProductItem[] = [],
    private _confirmedAt?: Date,
    private _cancelledAt?: Date,
  ) {}

  #uncommittedEvents: Event[] = [];

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

  get uncommitedEvents() {
    return this.#uncommittedEvents;
  }

  public static open = (
    _shoppingCartId: string,
    _clientId: string,
    _now: Date,
  ): ShoppingCart => {
    throw new Error('Fill the implementation part');
  };

  public addProductItem = (_productItem: PricedProductItem): void => {
    throw new Error('Fill the implementation part');
  };

  public removeProductItem = (_productItem: PricedProductItem): void => {
    throw new Error('Fill the implementation part');
  };

  public confirm = (_now: Date): void => {
    throw new Error('Fill the implementation part');
  };

  public cancel = (_now: Date): void => {
    throw new Error('Fill the implementation part');
  };

  public evolve = ({ type, data: event }: ShoppingCartEvent): void => {
    switch (type) {
      case 'ShoppingCartOpened': {
        this._id = event.shoppingCartId;
        this._clientId = event.clientId;
        this._status = ShoppingCartStatus.Pending;
        this._openedAt = event.openedAt;
        this._productItems = [];
        return;
      }
      case 'ProductItemAddedToShoppingCart': {
        const {
          productItem: { productId, quantity, unitPrice },
        } = event;

        const currentProductItem = this._productItems.find(
          (pi) => pi.productId === productId && pi.unitPrice === unitPrice,
        );

        if (currentProductItem) {
          currentProductItem.quantity += quantity;
        } else {
          this._productItems.push(event.productItem);
        }
        return;
      }
      case 'ProductItemRemovedFromShoppingCart': {
        const {
          productItem: { productId, quantity, unitPrice },
        } = event;

        const currentProductItem = this._productItems.find(
          (pi) => pi.productId === productId && pi.unitPrice === unitPrice,
        );

        if (!currentProductItem) {
          return;
        }

        currentProductItem.quantity -= quantity;

        if (currentProductItem.quantity <= 0) {
          this._productItems.splice(
            this._productItems.indexOf(currentProductItem),
            1,
          );
        }
        return;
      }
      case 'ShoppingCartConfirmed': {
        this._status = ShoppingCartStatus.Confirmed;
        this._confirmedAt = event.confirmedAt;
        return;
      }
      case 'ShoppingCartCancelled': {
        this._status = ShoppingCartStatus.Cancelled;
        this._cancelledAt = event.cancelledAt;
        return;
      }
    }
  };

  public static default = (): ShoppingCart =>
    new ShoppingCart(
      undefined!,
      undefined!,
      undefined!,
      undefined!,
      undefined,
      undefined,
      undefined,
    );
}

export const getShoppingCart = (events: ShoppingCartEvent[]): ShoppingCart => {
  return events.reduce<ShoppingCart>((state, event) => {
    state.evolve(event);
    return state;
  }, ShoppingCart.default());
};
