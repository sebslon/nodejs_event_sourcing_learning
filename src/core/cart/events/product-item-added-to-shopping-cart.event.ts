import { PricedProductItem } from '../product-item.interface';

export interface ProductItemAddedToShoppingCart {
  type: 'ProductItemAddedToShoppingCart';
  data: {
    shoppingCartId: string;
    productItem: PricedProductItem;
  };
}
