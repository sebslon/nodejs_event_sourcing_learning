import { Event, EventEnvelope } from './event.type';

export interface EventStore<InMemory extends boolean = false> {
  aggregateStream<Entity, E extends Event>(
    streamName: string,
    options: {
      evolve: (currentState: Entity, event: E) => Entity;
      getInitialState: () => Entity;
      expectedRevision?: bigint;
    },
  ): InMemory extends true ? Entity | null : Promise<Entity | null>;
  readStream<E extends Event>(
    streamId: string,
  ): InMemory extends true ? E[] : Promise<E[]>;
  appendToStream<E extends Event>(
    streamId: string,
    events: E[],
    options?: { expectedRevision?: bigint },
  ): InMemory extends true ? bigint : Promise<bigint>;
  subscribe<E extends Event>(
    eventHandler: (eventEnvelope: EventEnvelope<E>) => void,
  ): void;
}
