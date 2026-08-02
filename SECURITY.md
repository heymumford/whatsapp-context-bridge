# Security policy

## Supported versions

Until the first release, only the current `main` branch receives security fixes.

## Reporting

Do not open a public issue containing a secret, real message, phone number, or
reproduction payload with personal data. Use GitHub's private vulnerability
reporting feature when it is enabled for the repository.

## Trust boundaries

- Meta requests are accepted only after HMAC verification over exact body bytes.
- Personal-device relay requests require an independent HMAC secret and fresh
  timestamp.
- Review and confirmation endpoints require an independent bearer token.
- Candidate confirmation is the only path to calendar publication.
- Runtime data and calendar output are not intended for source control.

## Known limitations of the reference slice

- Evidence is held in memory and is not durable across restarts.
- The default calendar adapter writes local `.ics` files rather than Microsoft
  Graph events.
- Replay resistance has a time window but no durable nonce store.
- The optional WhatsApp outbound notifier assumes the caller is within Meta's
  permitted customer-service window; template-policy enforcement is future work.
- Transport TLS, rate limiting, encrypted storage, retention/deletion workflows,
  and production observability belong at deployment boundaries and remain open.
