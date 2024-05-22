import { PricedProductItem } from './product-item.interface';
import { ShoppingCartStatus } from './shopping-cart-status.enum';

export type Empty = { status: ShoppingCartStatus.Empty };

export type Pending = {
  status: ShoppingCartStatus.Pending;
  id: string;
  clientId: string;
  productItems: PricedProductItem[];
  openedAt: Date;
};

export type Confirmed = {
  status: ShoppingCartStatus.Confirmed;
  id: string;
  clientId: string;
  productItems: PricedProductItem[];
  confirmedAt: Date;
};

export type Cancelled = {
  status: ShoppingCartStatus.Cancelled;
  id: string;
  clientId: string;
  productItems: PricedProductItem[];
  cancelledAt: Date;
};

export type ShoppingCartState = Empty | Pending | Confirmed | Cancelled;

export const emptyShoppingCart: Empty = { status: ShoppingCartStatus.Empty };
