export type ConfirmShoppingCart = {
  type: 'ConfirmShoppingCart';
  data: {
    shoppingCartId: string;
    now: Date;
  };
};
