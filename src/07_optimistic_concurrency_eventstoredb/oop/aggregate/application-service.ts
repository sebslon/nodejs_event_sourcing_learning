import { AddProductItemToShoppingCart } from '#core/cart/commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '#core/cart/commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '#core/cart/commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '#core/cart/commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '#core/cart/commands/remove-product-item-from-shopping-cart.command';
import { Repository } from './core/repository';
import { ApplicationService } from './core/service';
import { ShoppingCart } from './shopping-cart';

export class ShoppingCartService extends ApplicationService<ShoppingCart> {
  constructor(protected repository: Repository<ShoppingCart>) {
    super(repository);
  }

  public open = ({
    data: { shoppingCartId, clientId, now },
  }: OpenShoppingCart) =>
    this.on(shoppingCartId, () =>
      ShoppingCart.open(shoppingCartId, clientId, now),
    );

  public addProductItem = ({
    data: { shoppingCartId, productItem },
  }: AddProductItemToShoppingCart) =>
    this.on(shoppingCartId, (shoppingCart) =>
      shoppingCart.addProductItem(productItem),
    );

  public removeProductItem = ({
    data: { shoppingCartId, productItem },
  }: RemoveProductItemFromShoppingCart) =>
    this.on(shoppingCartId, (shoppingCart) =>
      shoppingCart.removeProductItem(productItem),
    );

  public confirm = ({ data: { shoppingCartId, now } }: ConfirmShoppingCart) =>
    this.on(shoppingCartId, (shoppingCart) => shoppingCart.confirm(now));

  public cancel = ({ data: { shoppingCartId, now } }: CancelShoppingCart) =>
    this.on(shoppingCartId, (shoppingCart) => shoppingCart.cancel(now));
}
