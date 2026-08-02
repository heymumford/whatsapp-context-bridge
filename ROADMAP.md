# Roadmap

## Initiative: Consent-first family context bridge

### Epic 1 — Prove the evidence loop

- **Task: Accept authentic WhatsApp text webhooks**
  - Acceptance: challenges succeed; tampered payloads fail closed.
- **Task: Extract explicit birthday claims**
  - Acceptance: supported grammar yields a cited candidate; ambiguity yields none.
- **Task: Confirm before calendar publication**
  - Acceptance: bearer authorization and idempotent calendar identity are enforced.

### Epic 2 — Replace demonstration adapters

- **Task: Build the Kotlin Android personal-message companion**
  - Acceptance: explicit opt-in; locally visible SMS/notification sources only;
    signed relay envelope; replay resistance; source-specific completeness label.
  - Dependency: Android permission/retention threat model.
- **Task: Add a user-initiated WhatsApp export adapter**
  - Acceptance: local parsing, locale fixtures, no upload by default, explicit
    provenance, and a deletion command.

- **Task: Add durable encrypted evidence storage**
  - Dependency: retention and deletion policy ADR.
- **Task: Add Microsoft Graph calendar adapter**
  - Dependency: delegated OAuth and duplicate-series contract tests.
- **Task: Add optional structured OpenAI extraction**
  - Dependency: evaluation corpus, schema-constrained output, deterministic fallback,
    and a rule forbidding unsupported dates.

### Epic 3 — Operate safely

- **Task: Complete Meta app review and webhook deployment**
- **Task: Add consent ledger, audit trail, redaction, and deletion workflow**
- **Task: Add OpenTelemetry traces without message contents or phone numbers**
- **Task: Threat-model replay, forgery, prompt injection, and accidental disclosure**
