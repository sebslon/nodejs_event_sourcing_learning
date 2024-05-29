import { Event } from '../../../shared/event.type';

export interface Evolves<E extends Event> {
  evolve(event: E): void;
}
