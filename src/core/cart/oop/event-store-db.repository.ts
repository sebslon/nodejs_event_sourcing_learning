import { EventStoreDBClient, StreamNotFoundError } from '@eventstore/db-client';
import { Event } from '../../shared/event.type';
import { Evolves } from './interfaces/evolves.interface';
import { Repository } from './interfaces/repository.interface';

export class EventStoreDBRepository<
  Entity extends Evolves<StreamEvent>,
  StreamEvent extends Event,
> implements Repository<Entity>
{
  constructor(
    private readonly eventStore: EventStoreDBClient,
    private readonly getInitialState: () => Entity,
    private readonly streamIdMapper: (id: string) => string,
  ) {}

  public async find(id: string): Promise<Entity | undefined> {
    try {
      const streamId = this.streamIdMapper(id);
      const currentState = this.getInitialState();

      for await (const { event } of this.eventStore.readStream(streamId)) {
        if (!event) {
          continue;
        }

        currentState.evolve(<StreamEvent>{
          type: event.type,
          data: event.data,
        });
      }

      return currentState;
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        return undefined;
      }

      throw error;
    }

    return undefined;
  }
}
