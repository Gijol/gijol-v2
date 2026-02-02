# Graduation Logic Test Suite

## Overview

This directory contains the comprehensive test suite for verifying the graduation requirement logic of the Gijol service. The tests ensure that the system correctly calculates credits, classifies courses, and determines graduation status across various complex scenarios.

## Test Files

- **`graduation_cases.spec.ts`**: The main test file implementing 10 specific user scenarios (Test Cases 01-10).
- **`types_check.spec.ts`**: Verifies type consistency (existing).
- **`graduation.spec.ts`**: Legacy tests (existing).

## Key Logic Changes & Refinements

The implementation of this test suite drove significant improvements in the graduation engine's validation middleware (`features/graduation/middlewares/validation/index.ts`):

1.  **F Grade Exclusion**:
    - Courses with a grade of 'F' are now automatically filtered out during the normalization process.
    - Verified by **Case 07**.

2.  **Retake Handling (Deduplication)**:
    - If a student takes the same course code multiple times (retakes), the system now keeps only the attempt with the **highest grade**.
    - If grades are identical, the most recent attempt is preferred.
    - **Exception**: Repeatable courses (e.g., `UC9331` GIST College Colloquium) are exempt from deduplication and counted multiple times as appropriate.
    - Verified by **Case 07**.

## Test Case Summary (`graduation_cases.spec.ts`)

| Case ID | Scenario           | Description & Verification Goals                                                                                                |
| :------ | :----------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| **01**  | 2020 CS Standard   | Validates a standard graduation path for a 2020 CS major. Verifies all categories (Major, Humanities, etc.) are satisfied.      |
| **02**  | 2021 EE Major      | Checks that a student with only EE courses fails the CS major requirements but correctly accumulates credits in Free Electives. |
| **03**  | Bio/Med Focus      | Verifies handling of Bio/Med courses and checks for Minor logic (if applicable) or Free Elective classification.                |
| **04**  | Humanities Focus   | Tests a student heavily loaded with Humanities. Verifies distinction between HUS/PPE and total Humanities credits.              |
| **05**  | 2019 Early Grad    | Verifies application of 2019-specific rule sets (e.g., Thesis/Capstone requirements).                                           |
| **06**  | Exchange/Summer    | Checks handling of Exchange student credits and Summer semester coursework.                                                     |
| **07**  | F Grades & Retakes | **Critical**: Verifies that 'F' grades contribute 0 credits and are removed, and only the best grade from retakes is counted.   |
| **08**  | Dirty Data         | Tests robustness against invalid raw data rows (missing names, credits, etc.).                                                  |
| **09**  | 2021 Transfer      | Verifies handling of Transfer credits (often marked as 'TR' or distinct codes).                                                 |
| **10**  | Double Major       | Verifies logic for checking requirements of two majors simultaneously (CS + Math).                                              |

## Fixture Updates

To ensure valid test cases (like Case 01, 04, 07) passed as expected, several fixture JSON files in `tests/fixtures/` were updated:

- **Case 01 (`case01_cs_standard_2020.json`)**: Added required Thesis courses (`EC9102`, `EC9103`) and an Art course to meet the 130-credit and Mandatory criteria.
- **Case 04 (`case04_humanities_heavy_2022.json`)**: Adjusted course list to ensure the specific balance of HUS vs. PPE credits was met.
- **Case 07 (`case07_retake_fail_pass_2020.json`)**: Significantly augmented with Thesis, Art, and additional Major Electives to satisfy the total credit requirement (130+) while retaining the F-grade and Retake scenarios for verification.
