import { PricedProductItem } from './product-item.interface';
import { ShoppingCartStatus } from './shopping-cart-status.enum';

export type ShoppingCartDetails = {
  id: string;
  clientId: string;
  status: ShoppingCartStatus;
  productItems: PricedProductItem[];
  openedAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  totalAmount: number;
  totalItemsCount: number;
  lastProcessedPosition: number; // idempotency
};

export type ShoppingCartShortInfo = {
  id: string;
  clientId: string;
  totalAmount: number;
  totalItemsCount: number;
  lastProcessedPosition: number;
};
