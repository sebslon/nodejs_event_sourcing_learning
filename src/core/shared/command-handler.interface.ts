import { Command } from './command.type';
import { Event } from './event.type';

export type CommandHandlerInterface<
  State,
  CommandType extends Command,
  StreamEvent extends Event,
> = {
  handle: (command: CommandType, state: State) => StreamEvent | StreamEvent[];
  evolve: (currentState: State, event: StreamEvent) => State;
  getInitialState: () => State;
};
