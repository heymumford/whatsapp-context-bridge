# Contributing

1. Use synthetic fixtures only.
2. Add or update the smallest failing test before changing behavior.
3. Preserve inward dependency direction: domain → nothing; application → domain;
   adapters → application/domain.
4. Run `npm run check` before proposing a change.
5. Run `npm run mutation` when domain or application decisions change.
6. Explain privacy, consent, and retention effects in the pull request.

Commit messages should be terse imperatives. Pull requests should state the
behavioral hypothesis, evidence used to test it, risk, and rollback path.
