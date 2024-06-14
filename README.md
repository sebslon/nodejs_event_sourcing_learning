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

## Resources

### Business Logic

- [Straightforward Event Sourcing with TypeScript and NodeJS](https://event-driven.io/en/type_script_node_Js_event_sourcing/?utm_source=eventsourcing_nodejs?utm_campaign=workshop)
- [How to effectively compose your business logic](https://event-driven.io/en/how_to_effectively_compose_your_business_logic//?utm_source=eventsourcing_nodejs?utm_campaign=workshop)
- [Slim your aggregates with Event Sourcing!](https://event-driven.io/en/slim_your_entities_with_event_sourcing/?utm_source=eventsourcing_nodejs?utm_campaign=workshop)

### Concurrency

- [Optimistic concurrency for pessimistic times](https://event-driven.io/en/optimistic_concurrency_for_pessimistic_times/)
- [EventStoreDB Documentation - Handling concurrency](https://developers.eventstore.com/clients/grpc/appending-events.html#handling-concurrency)

### Projections / Read Models / Idempotency & Eventual Consistency

- [Guide to Projections and Read Models in Event-Driven Architecture](https://event-driven.io/en/projections_and_read_models_in_event_driven_architecture/?utm_source=event_sourcing_nodejs&utm_campaign=workshop)
- [A simple trick for idempotency handling in the Elastic Search read model](https://event-driven.io/en/simple_trick_for_idempotency_handling_in_elastic_search_readm_model/?utm_source=event_sourcing_nodejs&utm_campaign=workshop)
- [Dealing with Eventual Consistency and Idempotency in MongoDB projections](https://event-driven.io/en/dealing_with_eventual_consistency_and_idempotency_in_mongodb_projections//?utm_source=event_sourcing_nodejs&utm_campaign=workshop)

## Credits

Huge thanks to Oskar Dudycz for sharing his knowledge and creating repository linked above.
