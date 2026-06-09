# Use a Three-State Graduation Outcome

The domain result should represent the final graduation outcome as `satisfied`, `unsatisfied`, or `needs_review` instead of relying only on a boolean. Existing API responses may keep `totalSatisfied` temporarily for UI compatibility, but new code should consume the three-state outcome because missing applicability information must not be collapsed into a false negative.
