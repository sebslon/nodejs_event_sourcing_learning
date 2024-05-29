import { Repository } from './interfaces/repository.interface';
import { ShoppingCart } from './shopping-cart';

export class ShoppingCartService {
  constructor(private readonly repository: Repository<ShoppingCart>) {}

  public async get(id: string): Promise<ShoppingCart | undefined> {
    return this.repository.find(id);
  }
}
