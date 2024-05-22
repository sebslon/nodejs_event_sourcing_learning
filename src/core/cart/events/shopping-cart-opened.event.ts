export interface ShoppingCartOpened {
  type: 'ShoppingCartOpened';
  data: {
    shoppingCartId: string;
    clientId: string;
    openedAt: Date;
  };
}
