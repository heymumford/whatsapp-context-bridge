# ADR 0001: Hexagonal, evidence-first workflow

- Status: Accepted
- Date: 2026-08-01

## Context

WhatsApp and calendar providers will change. The invariant is that a consequential
personal-data write must remain attributable to explicit evidence and human intent.

## Decision

The domain models birthday evidence without provider types. Application use cases
depend on ports for storage, notification, and calendar publication. Adapters own
Meta payloads, HTTP authentication, filesystem output, and future Graph/OpenAI
clients.

The deterministic extractor is the initial implementation. A model may later be an
adapter behind the same extraction port, but it cannot bypass evidence validation or
confirmation.

The WhatsApp boundary is the Business Platform: new messages to a configured
business number. Personal-account history access is outside this system boundary.

## Consequences

- Provider changes stay at the boundary.
- Core tests run without networks, clocks, or credentials.
- There are more small interfaces and composition code.
- Exactly-once external behavior ultimately requires a durable idempotency store;
  the demonstration ICS adapter provides a stable UID and filename.
