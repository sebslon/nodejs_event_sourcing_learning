import { ApplicationService } from '../../shared/application-service.abstract-class';
import { Repository } from '../../shared/repository';
import { AddProductItemToShoppingCart } from '../commands/add-product-item-to-shopping-cart.command';
import { CancelShoppingCart } from '../commands/cancel-shopping-cart.command';
import { ConfirmShoppingCart } from '../commands/confirm-shopping-cart.command';
import { OpenShoppingCart } from '../commands/open-shopping-cart.command';
import { RemoveProductItemFromShoppingCart } from '../commands/remove-product-item-from-shopping-cart.command';
import { ShoppingCart } from './shopping-cart';

export class ShoppingCartService extends ApplicationService<ShoppingCart> {
  constructor(protected readonly repository: Repository<ShoppingCart>) {
    super(repository);
  }

  public async get(id: string): Promise<ShoppingCart | undefined> {
    return this.repository.find(id);
  }

  public open(
    { data: { shoppingCartId, clientId, now } }: OpenShoppingCart,
    options?: { expectedRevision?: bigint },
  ) {
    return this.on(
      shoppingCartId,
      () => ShoppingCart.open(shoppingCartId, clientId, now),
      options,
    );
  }

  public addProductItem(
    { data: { shoppingCartId, productItem } }: AddProductItemToShoppingCart,
    options?: { expectedRevision?: bigint },
  ) {
    return this.on(
      shoppingCartId,
      (cart) => cart.addProductItem(productItem),
      options,
    );
  }

  public removeProductItem(
    {
      data: { shoppingCartId, productItem },
    }: RemoveProductItemFromShoppingCart,
    options?: { expectedRevision?: bigint },
  ) {
    return this.on(
      shoppingCartId,
      (cart) => cart.removeProductItem(productItem),
      options,
    );
  }

  public confirm(
    { data: { shoppingCartId, now } }: ConfirmShoppingCart,
    options?: { expectedRevision?: bigint },
  ) {
    return this.on(shoppingCartId, (cart) => cart.confirm(now), options);
  }

  public cancel(
    { data: { shoppingCartId, now } }: CancelShoppingCart,
    options?: { expectedRevision?: bigint },
  ) {
    return this.on(shoppingCartId, (cart) => cart.cancel(now), options);
  }
}
