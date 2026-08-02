# Test strategy

| Classification | Purpose | Location | Gate |
| --- | --- | --- | --- |
| Unit | Date grammar and domain invariants | `tests/unit` | Every change |
| Property | Invalid-day and parser robustness across generated input | `tests/unit` | Every change |
| Component | Use case through fake ports | `tests/component` | Every change |
| Contract | Supported Meta payload shape | `tests/contract` | Every change |
| Integration | HTTP, composition, persistence, and ICS boundary | `tests/integration` | Every change |
| Security | Signature and authorization fail-closed behavior | `tests/security` | Every change |
| Architecture | Dependency direction | `tests/architecture` | Every change |
| Acceptance | User-observable evidence-to-calendar scenario | `features` + integration test | Every change |
| Regression | Named examples for previously broken behavior | Adjacent relevant suite | Every change |
| Performance smoke | Detect gross parser/use-case regressions | `tests/performance` | Every change; generous ceiling |
| Mutation | Measure assertion sensitivity | Stryker | Scheduled/release |

P0/above-the-line behaviors are authenticity, evidence preservation, confirmation,
and idempotency. A failure in any P0 test blocks release.
