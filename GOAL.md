# Goal: Evidence Before Automation

Build a public, consent-first reference service that receives WhatsApp text
messages, extracts only explicit birthday claims, preserves the source evidence,
requires an authenticated human confirmation, and emits an idempotent annual
calendar artifact.

## Definition of done for the first vertical slice

- Meta webhook verification and signed-payload validation are implemented.
- Retried Meta message IDs do not repeat notifications or calendar effects.
- An explicit statement such as `Jordan's birthday is May 12` becomes a pending
  candidate with its source message ID and exact excerpt.
- Ambiguous or invalid dates produce no candidate.
- Calendar publication cannot happen without an authenticated confirmation.
- Repeated confirmation cannot create a second calendar identity.
- Domain and application code do not import HTTP, filesystem, or Meta adapters.
- Unit, property, component, contract, integration, security, architecture,
  performance-smoke, and executable acceptance tests are present.
- Coverage gates and a mutation-test configuration make test quality measurable.
- No secrets, phone numbers, real message bodies, or personal calendars are
  committed; runtime configuration is loaded from `~/.env`.

## Non-goals

- Inferring birthdays from ages, public-record scraping, or probabilistic guesses.
- Sending autonomous messages in the user's voice.
- Retaining complete chat histories.
- Claiming production readiness before Meta app review, durable storage, consent
  policy, observability, retention controls, and deployment hardening are complete.
