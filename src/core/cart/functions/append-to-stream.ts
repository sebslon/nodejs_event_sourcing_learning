import {
  ANY,
  AppendResult,
  EventStoreDBClient,
  jsonEvent,
} from '@eventstore/db-client';
import { ShoppingCartEvent } from '../shopping-cart.event.type';

export async function appendToStream(
  eventStore: EventStoreDBClient,
  streamName: string,
  events: ShoppingCartEvent[],
): Promise<AppendResult> {
  const serialized = events.map(jsonEvent);

  return eventStore.appendToStream(streamName, serialized, {
    expectedRevision: ANY,
  });
}
