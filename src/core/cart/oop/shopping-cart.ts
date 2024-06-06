import { Aggregate } from '../../shared/aggregate';
import { PricedProductItem } from '../product-item.interface';
import { ShoppingCartStatus } from '../shopping-cart-status.enum';
import { ShoppingCartErrors } from '../shopping-cart.errors';
import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { Evolves } from './interfaces/evolves.interface';

export class ShoppingCart
  extends Aggregate<ShoppingCartEvent>
  implements Evolves<ShoppingCartEvent>
{
  constructor(
    private _id: string,
    private _clientId: string,
    private _status: ShoppingCartStatus,
    private _openedAt: Date,
    private _productItems: PricedProductItem[] = [],
    private _confirmedAt?: Date,
    private _cancelledAt?: Date,
  ) {
    super();
  }

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

  public evolve(ev: ShoppingCartEvent): void {
    const { type, data: event } = structuredClone(ev);

    switch (type) {
      case 'ShoppingCartOpened': {
        this._id = event.shoppingCartId;
        this._clientId = event.clientId;
        this._status = ShoppingCartStatus.Pending;
        this._openedAt = new Date(event.openedAt);
        this._productItems = [];

        return;
      }

      case 'ProductItemAddedToShoppingCart': {
        const {
          productItem: { productId, quantity, unitPrice },
        } = event;

        const currentProductItem = this.productItems.find(
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

        currentProductItem.quantity = currentProductItem.quantity - quantity;

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
        this._confirmedAt = new Date(event.confirmedAt);
        return;
      }

      case 'ShoppingCartCancelled': {
        this._status = ShoppingCartStatus.Cancelled;
        this._cancelledAt = new Date(event.cancelledAt);
        return;
      }

      default: {
        const _: never = type;
        throw new Error('Unknown Event Type');
      }
    }
  }

  public static open(shoppingCartId: string, clientId: string, openedAt: Date) {
    const shoppingCart = ShoppingCart.from([]);

    shoppingCart.enqueue({
      type: 'ShoppingCartOpened',
      data: {
        shoppingCartId,
        clientId,
        openedAt,
      },
    });

    return shoppingCart;
  }

  public addProductItem(productItem: PricedProductItem) {
    this.assertCartIsPending();

    this.enqueue({
      type: 'ProductItemAddedToShoppingCart',
      data: {
        shoppingCartId: this.id,
        productItem,
      },
    });
  }

  public removeProductItem(productItem: PricedProductItem) {
    this.assertCartIsPending();
    this.assertProductItemExists(productItem);

    this.enqueue({
      type: 'ProductItemRemovedFromShoppingCart',
      data: {
        shoppingCartId: this.id,
        productItem,
      },
    });
  }

  public confirm(confirmedAt: Date) {
    this.assertCartIsPending();
    this.assertIsNotEmpty();

    this.enqueue({
      type: 'ShoppingCartConfirmed',
      data: {
        shoppingCartId: this.id,
        confirmedAt,
      },
    });
  }

  public cancel(cancelledAt: Date) {
    this.assertCartIsPending();

    this.enqueue({
      type: 'ShoppingCartCancelled',
      data: {
        shoppingCartId: this.id,
        cancelledAt,
      },
    });
  }

  public static getStreamId = (id: string) => `shopping_cart-${id}`;

  public static from(events: ShoppingCartEvent[]): ShoppingCart {
    return events.reduce<ShoppingCart>(
      (state, event) => {
        state.evolve(event);
        return state;
      },
      new ShoppingCart(
        undefined!,
        undefined!,
        undefined!,
        undefined!,
        undefined,
        undefined,
        undefined,
      ),
    );
  }

  private assertCartIsPending(): void {
    if (this.status !== ShoppingCartStatus.Pending) {
      throw new Error(ShoppingCartErrors.CART_IS_ALREADY_CLOSED);
    }
  }

  private assertProductItemExists({
    productId,
    quantity,
    unitPrice,
  }: PricedProductItem): void {
    const currentQuantity =
      this.productItems.find(
        (pi) => pi.productId === productId && pi.unitPrice === unitPrice,
      )?.quantity ?? 0;

    if (currentQuantity < quantity) {
      throw new Error(ShoppingCartErrors.PRODUCT_ITEM_NOT_FOUND);
    }
  }

  private assertIsNotEmpty(): void {
    if (this.productItems.length === 0) {
      throw new Error(ShoppingCartErrors.CART_IS_EMPTY);
    }
  }
}

export const getShoppingCart = (events: ShoppingCartEvent[]): ShoppingCart => {
  return events.reduce<ShoppingCart>((state, event) => {
    state.evolve(event);
    return state;
  }, ShoppingCart.from([]));
};
