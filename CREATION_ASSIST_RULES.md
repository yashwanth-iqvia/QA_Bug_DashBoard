# Bug Creation Assistant — Training Rules

## Architecture

### 1. User Input Layer
Receives:
- Bug notes
- OA report links
- Screenshots / evidence notes
- CDOM vs OA comparisons
- Jira references (BIIH-XXX)
- CatID, Impact, Expected/Actual behavior

### 2. Context Extraction Layer
Extracts:
- Issue type (UI, Data, Export, Excel)
- Expected behavior (CDOM)
- Actual behavior (OA)
- Impact scope
- CatID
- OA report URL

### 3. Business Rules Engine
- **CDOM** = expected behavior (master)
- **OA** = product under investigation
- **BIIH** = Jira project key
- Mandatory impact validation
- Mandatory OA link validation

### 4. Missing Information Validator

```
IF Impact Missing → Ask for impact
IF OA Link Missing → Ask for OA link
IF Expected/Actual Missing → Ask follow-up questions
```

Only when all required fields are present AND defect intelligence returns **New Defect** → Jira draft is marked **ready**.

## Implementation

- Engine: `jira-dashboard/server/creationAssistEngine.js`
- UI: AI Agent → Creation Assist tab
- API: `POST /api/agent/creation-assist`
