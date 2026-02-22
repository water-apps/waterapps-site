# UTM Conventions (WaterApps Marketing)

Purpose: Standardize campaign tracking across LinkedIn posts, future email campaigns, and partner/referral links.

## Base Rules

- Use lowercase only
- Use hyphens (`-`) or underscores (`_`) consistently (this file uses underscores for values)
- Keep values short and descriptive
- Do not reuse campaign names across different topics/weeks

## Recommended UTM Fields

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term` (optional; mostly for paid campaigns)

## Standard Values

### `utm_source`

- `linkedin`
- `github`
- `email`
- `partner`
- `referral`

### `utm_medium`

- `organic-social`
- `company-page`
- `direct-message`
- `email-newsletter`
- `referral-link`

### `utm_campaign`

Format:

`<timeframe>_<topic>`

Examples:

- `wk1_audit_ready_cicd`
- `wk1_procurement_path`
- `wk2_offer_packaging`
- `wk3_day2_operations`
- `wk4_buyer_requirements`

### `utm_content`

Use to distinguish post version or placement:

- `post`
- `comment`
- `carousel`
- `video`
- `profile-link`
- `company-page-link`

## Destination Pages (Current)

- Homepage contact:
  - `/`
  - optionally with fragment: `/#contact`
- Capability statement:
  - `/capability-statement.html`
- Enterprise readiness:
  - `/enterprise-readiness.html`

## Example URLs

### LinkedIn post -> Capability Statement

```
https://www.waterapps.com.au/capability-statement.html?utm_source=linkedin&utm_medium=organic-social&utm_campaign=wk1_procurement_path&utm_content=post
```

### LinkedIn post -> Enterprise Readiness

```
https://www.waterapps.com.au/enterprise-readiness.html?utm_source=linkedin&utm_medium=organic-social&utm_campaign=wk4_buyer_requirements&utm_content=post
```

### LinkedIn post -> Contact section

```
https://www.waterapps.com.au/?utm_source=linkedin&utm_medium=organic-social&utm_campaign=wk2_offer_packaging&utm_content=post#contact
```

## GA4 Alignment Notes

Your site already tracks:

- `cta_click`
- `contact_click`
- `case_study_expand`

Use UTM tracking for acquisition attribution, and GA4 events for on-site behavior. Both are needed.

## Naming Discipline Checklist

Before posting:

1. Is `utm_campaign` unique and descriptive?
2. Does `utm_content` distinguish where the click came from?
3. Are URLs pointing to the correct page/fragment?
4. Is the post topic consistent with the destination page?

