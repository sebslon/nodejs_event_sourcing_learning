import { Event } from './event.type';

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
  appendToStream(
    streamId: string,
    events: Event[],
    options?: { expectedRevision?: bigint },
  ): InMemory extends true ? bigint : Promise<bigint>;
}
