import { EventStore } from '../../shared/event-store.interface';
import { Event } from '../../shared/event.type';

export const getInMemoryEventStore = (): EventStore<true> => {
  const streams = new Map<string, Event[]>();

  return {
    readStream: <E extends Event>(streamName: string): E[] => {
      return streams.get(streamName)?.map((e) => <E>e) ?? [];
    },
    appendToStream: <E extends Event>(
      streamId: string,
      events: E[],
    ): bigint => {
      const currentEvents = streams.get(streamId) ?? [];
      streams.set(streamId, [...currentEvents, ...events]);

      return BigInt(currentEvents.length + events.length);
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
  };
};
