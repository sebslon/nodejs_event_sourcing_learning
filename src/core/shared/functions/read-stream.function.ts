import { EventStoreDBClient, StreamNotFoundError } from '@eventstore/db-client';
import { Event } from '../event.type';

export async function readStream<StreamEvent extends Event>(
  eventStore: EventStoreDBClient,
  streamId: string,
): Promise<StreamEvent[]> {
  const events = [];

  try {
    for await (const { event } of eventStore.readStream<StreamEvent>(
      streamId,
    )) {
      if (!event) {
        continue;
      }

      events.push(<StreamEvent>{ type: event.type, data: event.data });
    }

    return events;
  } catch (error) {
    if (error instanceof StreamNotFoundError) {
      return events;
    }

    throw error;
  }
}
