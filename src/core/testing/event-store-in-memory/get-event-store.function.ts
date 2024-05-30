import { EventStore } from '../../shared/event-store.interface';
import { Event } from '../../shared/event.type';

export const getInMemoryEventStore = (): EventStore => {
  const streams = new Map<string, Event[]>();

  return {
    readStream: <E extends Event>(streamId: string): E[] => {
      return streams.get(streamId)?.map((e) => <E>e) ?? [];
    },
    appendToStream: <E extends Event>(
      streamId: string,
      ...events: E[]
    ): void => {
      const current = streams.get(streamId) ?? [];

      streams.set(streamId, [...current, ...events]);
    },
  };
};
