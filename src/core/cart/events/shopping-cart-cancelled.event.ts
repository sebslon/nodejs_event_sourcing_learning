export interface ShoppingCartCancelled {
  type: 'ShoppingCartCancelled';
  data: {
    shoppingCartId: string;
    cancelledAt: Date;
  };
}
