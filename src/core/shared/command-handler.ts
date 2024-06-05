import { CommandHandlerInterface } from './command-handler.interface';
import { Command } from './command.type';
import { EventStore } from './event-store.interface';
import { Event } from './event.type';

export function CommandHandler<
  State,
  CommandType extends Command,
  StreamEvent extends Event,
>(
  {
    handle,
    evolve,
    getInitialState,
  }: CommandHandlerInterface<State, CommandType, StreamEvent>,
  streamIdMapper: (id: string) => string,
) {
  return async function handler(
    eventStore: EventStore,
    id: string,
    command: CommandType,
  ) {
    const streamName = streamIdMapper(id);

    const state = await eventStore.aggregateStream(streamName, {
      evolve,
      getInitialState,
    });

    const result = handle(command, state ?? getInitialState());

    if (Array.isArray(result)) {
      return eventStore.appendToStream(streamName, ...result);
    }

    return eventStore.appendToStream(streamName, result);
  };
}
