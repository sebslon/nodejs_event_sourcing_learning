export interface EventStore {
  readStream<E extends Event>(streamId: string): E[];
  appendToStream(streamId: string, ...events: Event[]): void;
}
