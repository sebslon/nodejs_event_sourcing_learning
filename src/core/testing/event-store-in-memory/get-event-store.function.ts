import { v4 as uuid } from 'uuid';
import { EventStore } from '../../shared/event-store.interface';
import { Event, EventEnvelope, EventHandler } from '../../shared/event.type';

export const getInMemoryEventStore = (): EventStore<true> => {
  const streams = new Map<string, EventEnvelope[]>();
  const handlers: EventHandler[] = [];

  const getAllEventsCount = () => {
    return Array.from<EventEnvelope[]>(streams.values())
      .map((s) => s.length)
      .reduce((p, c) => p + c, 0);
  };

  return {
    readStream: <E extends Event>(streamName: string): E[] => {
      return streams.get(streamName)?.map((e) => <E>e) ?? [];
    },

    appendToStream: async <E extends Event>(
      streamId: string,
      events: E[],
    ): Promise<bigint> => {
      const current = streams.get(streamId) ?? [];

      const eventEnvelopes: EventEnvelope[] = events.map((event, index) => {
        return {
          ...event,
          metadata: {
            eventId: uuid(),
            streamPosition: current.length + index + 1,
            logPosition: BigInt(getAllEventsCount() + index + 1),
          },
        };
      });

      streams.set(streamId, [...current, ...eventEnvelopes]);

      for (const eventEnvelope of eventEnvelopes) {
        for (const handler of handlers) {
          let numberOfRepeatedPublish = Math.round(Math.random() * 5);

          do {
            await handler(eventEnvelope);
          } while (--numberOfRepeatedPublish > 0);
        }
      }

      return BigInt(current.length + events.length);
    },

    aggregateStream: <Entity, E extends Event>(
      streamName: string,
      options: {
        evolve: (currentState: Entity, event: E) => Entity;
        getInitialState: () => Entity;
      },
    ): Entity | null => {
      const events = streams.get(streamName)?.map((e) => <E>e) ?? [];
      let state = options.getInitialState();

      for (const event of events) {
        state = options.evolve(state, event);
      }

      return state;
    },

    subscribe: <E extends Event>(eventHandler: EventHandler<E>): void => {
      handlers.push((eventEnvelope) =>
        eventHandler(eventEnvelope as EventEnvelope<E>),
      );
    },
  };
};
