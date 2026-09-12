// Retrieved from GitHub on 2026-09-12. Evidence revision:
// BABARALIKHAN098/Machine-learning-project-content-optimization@ed1508d6e69fc29484433e8abd95bbe9ac9d6f52
// Sources: readme.md, pyproject.toml, app/main.py, and SPEC-07 evaluation/decision reports.
PORTFOLIO_PROJECTS.unshift({
  id: 'content-optimization',
  category: 'ml',
  categoryLabel: 'Machine Learning & Content Analytics',
  title: 'Content Trend Classification',
  status: 'Research application - not production-ready',
  problem: 'Content teams need evidence to prioritize human review of published content that may decline, without automatically changing content based on uncertain model scores.',
  solution: 'A leakage-aware scikit-learn workflow, packaged research models, and a FastAPI application with a vanilla JavaScript workspace for single-content and JSON-batch predictions.',
  tech: ['Python', 'Scikit-learn', 'FastAPI', 'Pandas', 'JavaScript', 'Pytest'],
  result: 'Random forest validation macro F1: 0.430224; down-class recall: 0.861367. The reused validation evidence is not an independent generalization estimate, and macro F1 remains below the 0.45 target. Neither finalist is recommended for production.',
  details: {
    users: 'Content analysts and research operators prioritizing content-refresh review; predictions support human decisions only.',
    data: 'The documented source has 30,000 rows and 44 columns. Complete client groups are assigned to separate partitions, with strict column-role validation and hashed identifiers in split artifacts.',
    architecture: 'Validated tabular inputs -> training-only preprocessing and feature engineering -> client-grouped model selection -> frozen research packages -> token-protected FastAPI inference -> browser workspace and JSON downloads.',
    approach: 'Train-only imputation, one-hot encoding, previous-period ratios, feature ablations, and grouped logistic-regression/random-forest comparisons. The frontend supports single records, strict JSON batches, optional uncalibrated scores, search, pagination, and full-response downloads.',
    evaluation: 'SPEC-07 replays two frozen finalists on previously used validation data. Logistic regression macro F1 is 0.389920 and random forest macro F1 is 0.430224. Historical test results also exist; this replay is not a fresh holdout evaluation.',
    decisions: 'Explicit no-promotion decisions, hash-checked model packages, schema-driven requests, and opt-in model scores keep research evidence separate from production claims. Tokens, inputs, and predictions are not written to browser storage.',
    limitations: 'Both models miss the 0.45 macro-F1 target. Metadata cutoff evidence and final-test policy remain unresolved. Scores are uncalibrated and non-causal; production runtime readiness is unverified. No public live demo is documented.'
  },
  links: {github: 'https://github.com/BABARALIKHAN098/Machine-learning-project-content-optimization'}
});
