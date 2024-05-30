import { OpenShoppingCart } from '../../commands/open-shopping-cart.command';
import { ShoppingCartEvent } from '../../shopping-cart.event.type';

export function openShoppingCart({
  data: command,
}: OpenShoppingCart): ShoppingCartEvent {
  return {
    type: 'ShoppingCartOpened',
    data: {
      shoppingCartId: command.shoppingCartId,
      clientId: command.clientId,
      openedAt: command.now,
    },
  };
}
