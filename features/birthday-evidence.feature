@ATL @P0 @acceptance
Feature: Evidence-backed birthday publication
  The system must never publish a guessed personal date.

  Scenario: Explicit birthday evidence is confirmed
    Given an authentic WhatsApp message saying "Jordan's birthday is May 12"
    When the message is ingested
    Then a pending candidate cites the source message and exact text
    When an authorized human confirms that candidate
    Then one annual calendar identity is published for May 12

  Scenario: A vague age statement is ignored
    Given an authentic WhatsApp message saying "Jordan turns about forty soon"
    When the message is ingested
    Then no birthday candidate is created
