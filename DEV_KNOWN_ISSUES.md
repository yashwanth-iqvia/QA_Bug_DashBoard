# DEV Known Issues Register

> QA Defect Intelligence Agent reads this every 2 hours. Update when DEV confirms known limitations.

| ID | Category | Summary | Affected CAT IDs | Status | Notes |
|----|----------|---------|------------------|--------|-------|
| DEV-001 | Data | Percentage display may round 68.9 to 69 when spec allows rounding | Multiple legacy | Accepted | Do not raise if mathematically equivalent after rounding |
| DEV-002 | Data | 35.61% vs 0.3561 representation — equivalent formats | Multiple | Accepted | Check mathematical equivalence before raising |
| DEV-003 | Export | Legacy template CatIDs may not retain all CDOM font metadata | Legacy CatIDs only | In Progress | Covered under broader export formatting work |

## Rules

- Do NOT raise if 35.61% = 0.3561 (format conversion)
- Do NOT raise if 68.9 = 69 when rounding is allowed by spec
- Legacy CatIDs may have known export limitations — check DEV-003 first
