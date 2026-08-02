# Personal messaging boundary

## Spectrum SMS/RCS

Spectrum is the transport provider, not the useful software boundary. On Eric's
Android phone, messages are held by the messaging application and Android's
telephony surfaces. The planned Kotlin companion will offer two deliberately
different modes:

1. User-initiated import from records the user can lawfully access.
2. Future-message relay from explicitly enabled Android notification or SMS access.

Each envelope declares its source and therefore its completeness. A notification
may be truncated and must never be represented as a complete conversation.

## Personal WhatsApp

WhatsApp Messenger does not provide the Business Platform webhook for a personal
account. Supported full-history ingestion starts with WhatsApp's user-initiated
**Export chat** feature. An Android notification listener can observe future visible
notifications after explicit OS authorization, but cannot promise history,
attachments, delivery state, deleted messages, or complete text.

This project will not automate WhatsApp Web, reverse-engineer private protocols, or
claim an unofficial scraper is an API.

## Sending

The personal-device path is read-only in the reference slice. A later Android
adapter may open the system composer with a prefilled draft so the user performs the
send. Autonomous personal-message sending requires a separate threat model and is
not implied by ingest permission.
