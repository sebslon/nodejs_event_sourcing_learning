import { PricedProductItem } from '../product-item.interface';

export interface ProductItemRemovedFromShoppingCart {
  type: 'ProductItemRemovedFromShoppingCart';
  data: {
    shoppingCartId: string;
    productItem: PricedProductItem;
  };
}
