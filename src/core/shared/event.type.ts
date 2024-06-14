export type Event<
  EventType extends string = string,
  EventData extends Record<string, unknown> = Record<string, unknown>,
> = Readonly<{
  type: Readonly<EventType>;
  data: Readonly<EventData>;
}>;

export type EventMetadata = Readonly<{
  eventId: string;
  streamPosition: number;
  logPosition: bigint;
}>;

export type EventEnvelope<E extends Event = Event> = E & {
  metadata: EventMetadata;
};

export type EventHandler<E extends Event = Event> = (
  eventEnvelope: EventEnvelope<E>,
) => Promise<void>;
