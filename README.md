# General info

This repository is "fork" of [Oskar Dudycz - Event Sourcing Node.js](https://github.com/oskardudycz/EventSourcing.NodeJS) exercises.

I took exercises from this repository to learn Event Sourcing and packed them into this repository to keep it clean for my own learning purposes.

In the original repository you can find more information about Event Sourcing and Node.js, like:

- What is Event Sourcing, Event, Stream, Event Store etc.
- Links to videos about Event Sourcing
- Examples/samples
- Articles about EventSourcing and related topics
- Configurations and other informations

## Exercises

1. [Events definition](./src/01_events_definition/).
2. [Getting State from events](./src/02_getting_state_from_events/).
3. Appending Events:
   - [EventStoreDB](./src/03_appending_events_eventstoredb/)
4. Getting State from events
   - [EventStoreDB](./src/04_getting_state_from_events_eventstoredb/)
5. Business logic:
   - [General](./src/05_business_logic/)
   - [EventStoreDB](./src/06_business_logic_eventstoredb/)
6. Optimistic Concurrency:
   - [EventStoreDB](./src/07_optimistic_concurrency_eventstoredb/)
7. Projections:
   - [General](./src/08_projections_single_stream/)
   - [Idempotency](./src/09_projections_single_stream_idempotency/)
   - [Eventual Consistency](./src/10_projections_single_stream_eventual_consistency/)

## How to check

```bash
npm install
npm run test:exercises
```

## Credits

Huge thanks to Oskar Dudycz for sharing his knowledge and creating repository linked above.
