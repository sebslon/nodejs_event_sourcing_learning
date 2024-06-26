import { EventStore } from '#core/shared/event-store.interface';
import {
  ANY,
  EventStoreDBClient,
  NO_STREAM,
  StreamNotFoundError,
  jsonEvent,
} from '@eventstore/db-client';
import { WrongExpectedVersion } from '@eventstore/db-client/generated/shared_pb';
import { Event, EventEnvelope } from './event.type';

export const getEventStore = (eventStore: EventStoreDBClient): EventStore => {
  return {
    aggregateStream: async <Entity, E extends Event>(
      streamName: string,
      options: {
        evolve: (currentState: Entity, event: E) => Entity;
        getInitialState: () => Entity;
        expectedRevision?: bigint;
      },
    ): Promise<Entity | null> => {
      try {
        const { evolve, getInitialState, expectedRevision } = options;

        let state = getInitialState();
        let streamRevision = -1n;

        for await (const { event } of eventStore.readStream(streamName)) {
          if (!event) continue;

          state = evolve(state, <E>{
            type: event.type,
            data: event.data,
          });
          streamRevision = event.revision;
        }

        if (
          expectedRevision !== undefined &&
          expectedRevision !== streamRevision
        ) {
          throw new Error(EventStoreErrors.WrongExpectedRevision);
        }

        return state;
      } catch (error) {
        if (error instanceof StreamNotFoundError) {
          return null;
        }

        throw error;
      }
    },
    readStream: async <E extends Event>(streamName: string): Promise<E[]> => {
      const events: E[] = [];

      try {
        for await (const { event } of eventStore.readStream(streamName)) {
          if (!event) continue;
          events.push(<E>{
            type: event.type,
            data: event.data,
          });
        }
        return events;
      } catch (error) {
        if (error instanceof StreamNotFoundError) {
          return [];
        }

        throw error;
      }
    },
    appendToStream: async <E extends Event>(
      streamId: string,
      events: E[],
      options?: { expectedRevision?: bigint },
    ): Promise<bigint> => {
      try {
        const serializedEvents = events.map(jsonEvent);

        const expectedRevision =
          options?.expectedRevision != undefined
            ? options.expectedRevision !== -1n
              ? options.expectedRevision
              : NO_STREAM
            : ANY;

        const appendResult = await eventStore.appendToStream(
          streamId,
          serializedEvents,
          {
            expectedRevision,
          },
        );

        return appendResult.nextExpectedRevision;
      } catch (error) {
        if (error instanceof WrongExpectedVersion) {
          throw new Error(EventStoreErrors.WrongExpectedRevision);
        }

        throw error;
      }
    },
    subscribe: async <E extends Event>(
      eventHandler: (eventEnvelope: EventEnvelope<E>) => void,
    ): Promise<void> => {
      for await (const { event } of eventStore.subscribeToAll()) {
        if (!event) continue;

        eventHandler(event.data as EventEnvelope<E>);
      }
    },
  };
};

export const EventStoreErrors = {
  WrongExpectedRevision: 'WrongExpectedRevision',
};
