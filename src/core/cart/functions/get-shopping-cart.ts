import { EventStoreDBClient } from '@eventstore/db-client';
import { readStream } from '../../shared/functions/read-stream.function';
import { ShoppingCartState } from '../shopping-cart-state';
import { ShoppingCartEvent } from '../shopping-cart.event.type';
import { evolveShoppingCart } from './evolve';

export function applyShoppingCartEvents(
  events: ShoppingCartEvent[],
): ShoppingCartState {
  return events.reduce<ShoppingCartState>(
    evolveShoppingCart,
    {} as ShoppingCartState,
  );
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
): Promise<ShoppingCartState> {
  const events = await getShoppingCartEventsFromStream(eventStore, streamId);

  return applyShoppingCartEvents(events);
}
