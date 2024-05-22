export interface ShoppingCartConfirmed {
  type: 'ShoppingCartConfirmed';
  data: {
    shoppingCartId: string;
    confirmedAt: Date;
  };
}
