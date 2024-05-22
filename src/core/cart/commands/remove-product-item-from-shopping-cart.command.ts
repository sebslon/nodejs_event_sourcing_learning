import { PricedProductItem } from '../product-item.interface';

export type RemoveProductItemFromShoppingCart = {
  type: 'RemoveProductItemFromShoppingCart';
  data: {
    shoppingCartId: string;
    productItem: PricedProductItem;
  };
};
