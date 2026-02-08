# Post-Mortem & Remediation: CSV Ingestion Failure

## Quantified Rating: 4/10
**Justification**: The previous implementation handled structure but failed fundamentally on data adaptability. It lacked "content-awareness" and sabotaged internationalization by stripping non-ASCII characters from headers.

## Post-Mortem
- **Root Cause**: Rigid regex-based header normalization `[^a-z0-9\s]` destroyed Arabic/Urdu/Special headers.
- **Hidden Assumption**: Assumed CSVs would always have clean, English, or pre-mapped headers.
- **Duplicated Effort**: Validation was running multiple times without clear resolution path for "unmapped but valid" columns.

## Remediation Strategy (ICE Ranked)
1. **Adaptive Content Mapping** (I:9, C:7, E:8): Peek first 5 rows to identify column types by content when headers fail.
2. **Unicode-Safe Normalization** (I:8, C:9, E:9): Revert regex to allow multi-language headers.
3. **Graceful Structural Resilience** (I:6, C:8, E:9): Warning-only for trailing commas.

## Acceptance Criteria
- [ ] 0 "Missing Field" errors on CSVs with Arabic/Urdu headers.
- [ ] Auto-mapping of Passport/DOB based on column data content.
- [ ] < 200ms overhead for heuristic check.

## Rollback Plan
`git checkout shared/canonical.ts client/src/components/CsvUploader.tsx`

**Final Justification**: Shifting from rigid syntax-matching to adaptive content-aware parsing is the only way to ensure "any CSV" integration.
