import { Aggregate } from './aggregate';
import { EventStore } from './event-store.interface';
import { Event } from './event.type';

export interface Repository<Entity> {
  find(id: string, options?: { expectedRevision?: bigint }): Promise<Entity>;
  store(
    id: string,
    entity: Entity,
    options?: { expectedRevision?: bigint },
  ): Promise<bigint>;
}

export class EventStoreRepository<
  Entity extends Aggregate<StreamEvent>,
  StreamEvent extends Event,
> implements Repository<Entity>
{
  constructor(
    private eventStore: EventStore,
    private getInitialState: () => Entity,
    private streamIdMapper: (id: string) => string,
  ) {}

  public async find(
    id: string,
    options?: { expectedRevision?: bigint },
  ): Promise<Entity> {
    return (
      (await this.eventStore.aggregateStream<Entity, StreamEvent>(
        this.streamIdMapper(id),
        {
          evolve: (state, event) => {
            state.evolve(event);
            return state;
          },
          getInitialState: this.getInitialState,
          expectedRevision: options?.expectedRevision,
        },
      )) ?? this.getInitialState()
    );
  }

  public async store(
    id: string,
    entity: Entity,
    options?: { expectedRevision?: bigint },
  ): Promise<bigint> {
    const events = entity.dispatchUncommittedEvents();

    if (events.length === 0) {
      return Promise.resolve(
        options?.expectedRevision !== undefined
          ? options?.expectedRevision
          : -1n,
      );
    }

    return await this.eventStore.appendToStream(
      this.streamIdMapper(id),
      events,
      options,
    );
  }
}
