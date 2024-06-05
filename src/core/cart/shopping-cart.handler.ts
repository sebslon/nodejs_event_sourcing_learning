import { CommandHandlerInterface } from '../shared/command-handler.interface';
import { evolveShoppingCart } from './functions/evolve';
import { handleShoppingCartCommand } from './functions/handle-shopping-cart-command';
import { ShoppingCartState, emptyShoppingCart } from './shopping-cart-state';
import { ShoppingCartCommand } from './shopping-cart.command.type';
import { ShoppingCartEvent } from './shopping-cart.event.type';

export const ShoppingCartHandler: CommandHandlerInterface<
  ShoppingCartState,
  ShoppingCartCommand,
  ShoppingCartEvent
> = {
  handle: handleShoppingCartCommand,
  evolve: evolveShoppingCart,
  getInitialState: () => emptyShoppingCart,
};
