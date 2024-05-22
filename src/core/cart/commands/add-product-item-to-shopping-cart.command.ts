import { PricedProductItem } from '../product-item.interface';

export type AddProductItemToShoppingCart = {
  type: 'AddProductItemToShoppingCart';
  data: {
    shoppingCartId: string;
    productItem: PricedProductItem;
  };
};
