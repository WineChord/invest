# Filing Reviews

Completed material filing reviews live in this directory.

Naming convention:

```text
YYYY-MM-DD-SYMBOL-FILINGTYPE-ACCESSION.md
```

Example:

```text
2026-05-26-RKLB-10-Q-0001819994-26-000001.md
```

Use [../../templates/filing-review.md](../../templates/filing-review.md). Every completed review should be linked from `research/freshness/events.csv` through `review_path` when the related freshness event is reviewed. If an event is explicitly immaterial, `immaterial_reason` must explain why.
