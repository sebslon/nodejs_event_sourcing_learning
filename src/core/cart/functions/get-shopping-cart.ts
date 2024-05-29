import { EventStoreDBClient } from '@eventstore/db-client';
import { readStream } from '../../shared/functions/read-stream.function';
import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { ShoppingCart } from '../shopping-cart.type';
import { evolve } from './evolve';

export function applyShoppingCartEvents(
  events: ShoppingCartEvent[],
): ShoppingCart {
  return events.reduce<ShoppingCart>(evolve, {} as ShoppingCart);
}

export async function getShoppingCartEventsFromStream(
  eventStore: EventStoreDBClient,
  streamId: string,
): Promise<ShoppingCartEvent[]> {
  const events = await readStream<ShoppingCartEvent>(eventStore, streamId);

  if (events.length === 0) {
    throw new Error('Shopping cart not found');
  }

  return events;
}

export async function getShoppingCart(
  eventStore: EventStoreDBClient,
  streamId: string,
): Promise<ShoppingCart> {
  const events = await getShoppingCartEventsFromStream(eventStore, streamId);

  return applyShoppingCartEvents(events);
}
