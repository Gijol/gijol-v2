# Graduation Feature Module (`features/graduation`)

This module encapsulates the new, clean architecture for graduation requirement evaluation.
It replaces the legacy monolithic logic with a structured, layered approach.

## Directory Structure

```text
features/graduation/
├── data/           # Data Repositories & Adapters (Course Metadata, Recommendations)
├── domain/         # Pure Business Logic
│   └── engine/     # The Core Calculation Engine
├── middlewares/    # Input/Output Transformation
│   ├── validation/ # Input Validation & Normalization
│   └── refine/     # Output Refinement for UI (ViewModel creation)
└── usecases/       # Application Logic (Orchestrator)
    └── uploadAndEvaluate.ts
```

## Operation Flow Diagram

This diagram visualizes how the components interacts during a single evaluation request.

```mermaid
flowchart TD
    %% Actors
    Caller[UI / Lab Page]

    %% UseCase Layer
    subgraph UseCase [Orchestration Layer]
        Orchestrator(uploadAndEvaluate)
    end

    %% Middleware Layer
    subgraph Middleware [Middleware Layer]
        Validators[Validation & Normalization]
        Refiner[Refinement]
    end

    %% Domain Layer
    subgraph Domain [Domain Layer]
        Engine[Graduation Engine]
        Rules[Legacy Rules & Classifier]
    end

    %% Data Layer
    subgraph Data [Data Layer]
        Repo[Course Repository]
    end

    %% Flow
    Caller -->|1. Raw Input| Orchestrator

    Orchestrator -->|2. Parse & Validate| Validators
    Validators -->|3. Clean Data| Orchestrator

    Orchestrator -->|4. Strict Logic Eval| Engine
    Engine -.->|Import| Rules
    Engine -->|5. Status Result| Orchestrator

    Orchestrator -->|6. Get Descriptions| Repo

    Orchestrator -->|7. Format for UI| Refiner
    Refiner -->|8. Final ViewModel| Orchestrator

    Orchestrator -->|9. Returns| Caller
```

## Component Roles

### 1. `usecases/`

- **Role**: The entry point for the feature. It coordinates the data flow between layers.
- **Key File**: `uploadAndEvaluate.ts`.

### 2. `middlewares/`

- **Role**: Handles "dirty" work at the boundaries.
- **Validation**: Ensures incoming JSON matches the implementation contract.
- **Refinement**: Decorates the raw business result with UI-specific fields (e.g., help messages, color codes).

### 3. `domain/`

- **Role**: Pure business logic. It does not know about the UI or the Network.
- **Engine**: Calculates credits, checks specific course requirements, and determines graduation status.

### 4. `data/`

- **Role**: Interface to the outside world (Database, external APIs).
- **Goal**: In the future, this will fetch real-time course metadata instead of using mocks.
