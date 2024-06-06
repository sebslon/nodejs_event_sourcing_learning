import { Aggregate } from './aggregate';
import { EventStore } from './event-store.interface';
import { Event } from './event.type';

export interface Repository<Entity> {
  find(id: string): Promise<Entity>;
  store(id: string, entity: Entity): Promise<void>;
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

  public async find(id: string): Promise<Entity> {
    return (
      (await this.eventStore.aggregateStream<Entity, StreamEvent>(
        this.streamIdMapper(id),
        {
          evolve: (state, event) => {
            state.evolve(event);
            return state;
          },
          getInitialState: this.getInitialState,
        },
      )) ?? this.getInitialState()
    );
  }

  public async store(id: string, entity: Entity): Promise<void> {
    const events = entity.dispatchUncommittedEvents();

    if (events.length === 0) {
      return;
    }

    await this.eventStore.appendToStream(this.streamIdMapper(id), ...events);
  }
}
