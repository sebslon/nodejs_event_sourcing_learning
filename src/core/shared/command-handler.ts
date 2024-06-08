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
    options?: { expectedRevision?: bigint },
  ) {
    const streamName = streamIdMapper(id);

    const state = await eventStore.aggregateStream(streamName, {
      evolve,
      getInitialState,
      expectedRevision: options?.expectedRevision,
    });

    const result = handle(command, state ?? getInitialState());

    return eventStore.appendToStream(
      streamName,
      Array.isArray(result) ? result : [result],
      options,
    );
  };
}
