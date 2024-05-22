export type CancelShoppingCart = {
  type: 'CancelShoppingCart';
  data: {
    shoppingCartId: string;
    now: Date;
  };
};
