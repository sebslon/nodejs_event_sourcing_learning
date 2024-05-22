export type OpenShoppingCart = {
  type: 'OpenShoppingCart';
  data: {
    shoppingCartId: string;
    clientId: string;
    now: Date;
  };
};
