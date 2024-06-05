import { Event } from './event.type';

export abstract class Aggregate<E extends Event> {
  #uncommitedEvents: E[] = [];

  abstract evolve(event: E): void;

  protected enqueue = (event: E) => {
    this.#uncommitedEvents = [...this.#uncommitedEvents, event];

    this.evolve(event);
  };

  public dispatchUncommittedEvents = (): E[] => {
    const events = [...this.#uncommitedEvents];

    this.#uncommitedEvents = [];

    return events;
  };
}
