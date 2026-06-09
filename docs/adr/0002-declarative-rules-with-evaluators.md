# Use Declarative Rules with Named Evaluators

Graduation rules should be declarative in the static rule catalog whenever possible, but complex calculated requirements may reference a named evaluator with explicit parameters and source citations. This keeps ordinary requirements inspectable as data while allowing rules such as science three-field selection by completion order to remain precise, testable code instead of becoming unreadable data encodings.
