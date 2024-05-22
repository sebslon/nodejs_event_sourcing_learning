import { PricedProductItem } from './product-item.interface';
import { ShoppingCartStatus } from './shopping-cart-status.enum';

export type ShoppingCartDetails = {
  id: string;
  clientId: string;
  status: ShoppingCartStatus;
  productItems: PricedProductItem[];
  openedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  totalAmount: number;
  totalItemsCount: number;
};
