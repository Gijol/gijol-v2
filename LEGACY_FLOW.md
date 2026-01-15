# Legacy Graduation Service Flow

This document describes the **Existing (Legacy)** architecture for graduation evaluation, which is currently used by the production `upload.tsx` page.

## System Sequence Diagram

The following diagram shows how the data travels from the User Interface to the API and back.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UploadPage as Page (upload.tsx)
    participant Helper as Helper (grad-status-helper.ts)
    participant API as API Route (/api/graduation/grad-status)
    participant Logic as Core Logic (calculate-grad-status.ts)
    participant Rules as Rule Modules (grad-rules/classifier)

    Note over User, UploadPage: 1. Input & Parse
    User->>UploadPage: Upload File (Excel/JSON)
    UploadPage->>UploadPage: Parse File -> Parsed Rows
    User->>UploadPage: Review Rows & Click "Calculate"

    Note over UploadPage, Helper: 2. Request Construction
    UploadPage->>UploadPage: handleApplyAndGo()
    UploadPage->>Helper: gradStatusFetchFn(payload)

    Note over Helper, API: 3. API Call
    Helper->>API: POST /api/graduation/grad-status

    Note over API, Logic: 4. Execution
    API->>Logic: calculateGradStatusV2(takenCourses, ...args)

    Logic->>Rules: pickRuleSet(entryYear)
    Rules-->>Logic: Return Ruleset (Credits per Category)

    loop For Each Course
        Logic->>Rules: classifyCourse(course, major, minors)
        Rules-->>Logic: Return Category (e.g. "ScienceBasic")
        Logic->>Logic: Update Category Totals
    end

    Logic->>Rules: buildFineGrainedRequirements(...)
    Rules-->>Logic: Return Specific Checks (Eng I, Calc, etc.)

    Logic-->>API: Return GradStatusResponseType
    API-->>Helper: JSON Response
    Helper-->>UploadPage: Result Data

    Note over UploadPage, User: 5. Display
    UploadPage->>UploadPage: Store Result (Zustand)
    UploadPage->>User: Redirect to Dashboard
```

## detailed Component Breakdown

### 1. Frontend (`pages/dashboard/graduation/upload.tsx`)

- **Responsibility**: Files parsing, user confirmation, and initiating the calculation.
- **Key Function**: `handleApplyAndGo`
  - Gathers `takenCourses`, `entryYear`, `major` from state.
  - Calls `gradStatusFetchFn`.

### 2. API Helper (`lib/utils/graduation/grad-status-helper.ts`)

- **Responsibility**: Abstraction of the network request.
- **Key Function**: `gradStatusFetchFn`
  - Sends a `POST` request with the JSON payload.

### 3. API Endpoint (`pages/api/graduation/grad-status.ts`)

- **Responsibility**: Server-side entry point.
- **Action**: Extracts parameters (`takenCourses`, `entryYear`, `userMajor`, `userMinors`) from the request body and invokes the calculation logic.

### 4. Core Logic (`lib/utils/graduation/calculate-grad-status.ts`)

- **Responsibility**: The monolithic function containing the domain logic.
- **Key Function**: `calculateGradStatusV2`
  - **Step A**: Validation (Basic checks).
  - **Step B**: Rule Selection (`pickRuleSet` from `grad-rules.ts`).
  - **Step C**: Classification (`classifyCourse` from `grad-classifier.ts`).
    - Determines if a course is a Major, Minor, or General Elective.
  - **Step D**: Calculation.
    - Sums up credits for each category.
    - Calculates deficits (Current - Required).
  - **Step E**: Detailed Requirements (`buildFineGrainedRequirements` from `grad-requirements.ts`).
    - Checks for specific mandatory courses (e.g., "GS1601 English I").

### 5. Data Flow Summary

1.  **Input**: `UserTakenCourseListType` (List of courses).
2.  **Process**:
    - Iterate list -> Classify -> Accumulate.
    - Check Conditions -> Set `satisfied` flags.
3.  **Output**: `GradStatusResponseType` (Nested object with category status, messages, and totals).
