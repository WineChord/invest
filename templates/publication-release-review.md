# Publication Release Review Template

Use this before committing, pushing, deploying, or externally posting any decision, trade, account record, performance update, dashboard copy, or public research note that could be read as investment guidance.

```yaml
review_date:
operator:
policy_version:
publication_policy_version: PUBLICATION_POLICY.md
artifact_paths:
content_type:
contains_actionable_trading_content:
public_release_earliest_at:
market_close_basis:
order_status:
sensitive_field_review_status:
compensation_or_material_connection:
personalized_reader_guidance_present:
public_disclaimer_present:
release_decision:
reason:
```

## Embargo Check

```yaml
proposed_orders_present:
exact_share_counts_present:
exact_dollar_order_sizes_present:
reserve_sale_instruction_present:
same_day_trade_intent_present:
broker_order_preview_present:
confirmed_same_day_execution_present:
validity_window_still_open:
regular_market_close_passed:
safety_buffer_passed:
if_uncertain_wait_until_next_trading_day:
```

If any actionable field is present and the embargo has not expired, do not commit, push, deploy, or externally post the artifact. Keep it local or redact the actionable fields.

## Sensitive-Field Review

Confirm the artifact does not contain:

- raw broker screenshots, PDFs, statements, order tickets, or tax documents;
- account numbers, full order IDs, full confirmation numbers, routing numbers, tax identifiers, addresses, phone numbers, email addresses, or legal identity documents;
- API keys, tokens, cookies, passwords, private keys, environment dumps, local credential paths, or private cache payloads;
- unlicensed raw market-data dumps, scraped articles, paywalled content, or large raw source files;
- local absolute paths or private workflow details in public docs, commit messages, PR text, or dashboard copy.

## Public Copy Review

```yaml
not_investment_advice_visible:
historical_or_research_context_clear:
no_copy_trading_language:
no_return_promise:
no_urgency_or_follow_me_language:
no_personalized_reader_guidance:
no_compensated_or_referral_language:
```

## Release Decision

```yaml
status: release_allowed | release_blocked | release_allowed_after_redaction | release_allowed_after_embargo
required_redactions:
required_delay:
validation_run:
notes:
```
