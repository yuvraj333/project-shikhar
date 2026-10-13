# Shikhar-AI Decisions and Risks

## 1. Purpose

This document maintains the project's architecture decision log and risk register.

The decision log records important technical and product decisions, including the reasoning behind them and their consequences. The risk register tracks potential failures, their probability and impact, mitigation measures, ownership, and current status.

These records should be updated as the prototype evolves. A proposed decision is not an implemented feature, and a planned mitigation is not evidence that a risk has been resolved.

## 2. Decision Log

### Decision statuses

- **Proposed:** Under consideration; not yet accepted.
- **Accepted:** Selected approach; implementation may still be pending.
- **Implemented:** Implemented and verified.
- **Superseded:** Replaced by a later decision.

### Architecture and product decisions

| ID | Decision | Rationale | Trade-off | Status |
|---|---|---|---|---|
| ADR-001 | Use a multi-agent workflow with Scout, Logistics, and Communications responsibilities. | Separates incident extraction, resource planning, and communication drafting. | Adds orchestration complexity compared with one model call. | Accepted |
| ADR-002 | Begin with simulated reports and sample inventory. | Enables reproducible development without depending on live emergency feeds or operational inventory systems. | Demonstrates workflow behavior, not real-world readiness. | Accepted |
| ADR-003 | Keep inventory arithmetic and constraint validation in deterministic application code. | Makes quantities, shortages, and allocation constraints testable and reproducible. | Requires explicit schemas, validation rules, and service logic. | Accepted |
| ADR-004 | Require human review for consequential recommendations and communication drafts. | Prevents model-generated output from becoming operational authorization. | Adds a review step and associated interface requirements. | Accepted |
| ADR-005 | Preserve source evidence, uncertainty, and verification status in structured records. | Makes claims traceable and discourages unsupported certainty. | Increases schema and interface complexity. | Accepted |
| ADR-006 | Start with a modular application rather than separate microservices. | Simplifies local development, deployment, testing, and demonstration. | Components are less independently scalable at the beginning. | Proposed |
| ADR-007 | Use Google Cloud Run as the initial cloud deployment target. | Provides a managed container deployment path suitable for a small prototype. | Introduces cloud configuration, IAM, and usage-based costs. | Proposed |
| ADR-008 | Use a configured language-model provider behind a provider abstraction where practical. | Reduces unnecessary coupling to one provider and makes controlled testing easier. | Adds configuration and adapter code. | Proposed |
| ADR-009 | Keep external dispatch and automatic emergency broadcasting disabled. | Avoids unauthorized real-world actions and limits the prototype's operational risk. | The prototype cannot independently execute a response. | Accepted |
| ADR-010 | Evaluate the workflow using fixed fixtures, safety tests, and measurable metrics. | Enables repeatable comparisons and makes failures visible. | Requires maintaining test data and evaluation procedures. | Accepted |

**Status note:** The table distinguishes accepted direction from implementation. Update each status only when the corresponding decision has been made or verified.

## 3. Decision Record Template

Create a new entry for any decision that materially changes architecture, safety, deployment, data handling, or operating cost.

```markdown
### ADR-XXX: Short decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Accepted / Implemented / Superseded
- **Context:** What problem or constraint requires a decision?
- **Decision:** What approach was selected?
- **Alternatives considered:** What other approaches were evaluated?
- **Rationale:** Why is this approach preferred?
- **Consequences:** What benefits, limitations, and costs follow?
- **Risks:** What new risks or dependencies are introduced?
- **Verification:** How will the decision be tested or confirmed?
- **Owner:** Responsible role or person.
- **Related documents:** Relevant requirements, architecture, or tests.
```

Keep previous decisions rather than silently rewriting project history. When an accepted decision changes, add a new record and mark the old decision as superseded.

## 4. Risk Rating Method

### Probability

| Rating | Meaning |
|---|---|
| Low | Unlikely under current assumptions, but possible. |
| Medium | Plausible during development, testing, or demonstration. |
| High | Likely enough to require active mitigation. |

### Impact

| Rating | Meaning |
|---|---|
| Low | Minor inconvenience with limited effect on the demonstration. |
| Medium | Significant rework, degraded functionality, or a failed demo stage. |
| High | Major data-integrity, security, safety, financial, or project-delivery consequences. |

For prioritization, combine probability and impact with engineering judgment. A low-probability safety or security risk may still require mandatory controls.

## 5. Risk Register

The ratings below are **initial qualitative assessments**, not measured probabilities. Reassess them as the implementation, test evidence, deployment configuration, and usage patterns become clearer.

| ID | Risk | Probability | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R-001 | The model invents incident facts, casualty counts, locations, or resource needs. | Medium | High | Require source-linked extraction, schema validation, uncertainty fields, adversarial tests, and human review. | AI/ML Lead | Open |
| R-002 | A reported or uncertain location is presented as confirmed. | High | High | Preserve location text as reported, distinguish verified from unverified data, avoid fabricated coordinates, and request clarification when needed. | Scout Agent Owner | Open |
| R-003 | The Logistics Agent recommends quantities that exceed available stock or violate constraints. | Medium | High | Calculate allocations deterministically, validate units and nonnegative quantities, and test shortages and unavailable inventory. | Backend Lead | Open |
| R-004 | A communication draft converts an unverified claim into a confirmed warning. | Medium | High | Ground every material claim in incident evidence, flag unsupported wording, and require reviewer approval before use. | Communications Agent Owner | Open |
| R-005 | Prompt injection in a report changes agent behavior or exposes protected instructions. | Medium | High | Treat report contents as untrusted data, separate instructions from input, restrict tools, and test malicious fixtures. | AI/ML Lead | Open |
| R-006 | A reviewer mistakenly treats simulated data as live operational information. | Medium | High | Display prominent simulation and mock-inventory labels, show verification status, and use explicit not-sent/not-dispatched indicators. | Product Lead | Open |
| R-007 | Cloud or model costs exceed the demonstration budget. | Medium | Medium | Set budget alerts, cap instances and concurrency, limit report size and retries, bound model calls, and review actual usage. | Deployment Owner | Open |
| R-008 | A deployment fails because of missing configuration, IAM permissions, or incompatible dependencies. | Medium | Medium | Use reproducible builds, pre-deployment checks, documented configuration, health checks, and a tested rollback procedure. | Deployment Owner | Open |
| R-009 | The live demo is inaccessible because of network, authentication, or service availability issues. | Medium | Medium | Test access beforehand, keep a known-good local path if available, and prepare a recording or screenshots as backup. | Demo Owner | Open |
| R-010 | A model provider times out, returns malformed output, or reaches a rate limit. | High | Medium | Use timeouts, bounded retries, schema validation, clear failure states, and safe escalation. | Backend Lead | Open |
| R-011 | The application leaks credentials or sensitive incident data through source control, logs, or configuration. | Medium | High | Use Secret Manager or appropriate local configuration, review `.gitignore`, redact logs, apply least privilege, and rotate exposed credentials. | Security Owner | Open |
| R-012 | A change to one agent breaks another stage's data contract. | Medium | Medium | Version schemas, validate outputs at boundaries, maintain integration tests, and update contracts alongside code. | Backend Lead | Open |
| R-013 | The prototype reports strong evaluation results that cannot be reproduced. | Medium | High | Fix test fixtures, record application and model versions, retain raw evaluation summaries, and distinguish targets from measured results. | Evaluation Owner | Open |
| R-014 | Nepali drafts are unclear, inaccurate, or unsuitable for the intended audience. | Medium | High | Use fluent human review, test representative messages, preserve uncertainty, and reject misleading or ambiguous wording. | Communications Agent Owner | Open |
| R-015 | An approval bypass allows an edited or unreviewed package to be treated as approved. | Medium | High | Enforce authorization in the backend, bind approval to the exact package version, invalidate stale approvals, and test unauthorized requests. | Backend Lead | Open |
| R-016 | The prototype is presented as operationally ready without sufficient field validation. | Medium | High | State limitations prominently, prohibit automatic dispatch and broadcasting, document evaluation gaps, and require separate authorization for any future operational integration. | Product Lead | Open |
| R-017 | Duplicate or conflicting reports are merged incorrectly or treated as independent confirmation. | Medium | High | Preserve source identities, model conflicts explicitly, avoid assuming source independence, and test duplicate and conflicting-report scenarios. | Scout Agent Owner | Open |
| R-018 | A database or persistence failure loses a report, review decision, or audit event. | Medium | High | Test persistence failures, use appropriate transaction boundaries, verify recovery and backups if persistence is configured, and avoid reporting a write as successful before confirmation. | Backend Lead | Open |

### Ownership guidance

Assign each owner to a named team member or a clearly defined role before the project depends on the control. If one person owns several roles, record that explicitly. Do not leave a critical risk without an accountable owner.

### Status definitions

- **Open:** Risk identified; mitigation is incomplete or has not been verified.
- **Mitigating:** Controls are being implemented.
- **Monitoring:** Controls exist, and residual risk is being tracked.
- **Closed:** Evidence shows the specific risk has been resolved or formally retired.
- **Accepted:** An authorized project decision-maker explicitly accepts the remaining risk and documents the rationale.

A mitigation being planned or a code change being merged is not sufficient by itself to close a risk.

## 6. Risk Review Procedure

Review the register:

- Before each major deployment.
- Before each public or external demonstration.
- After a security incident, unexpected model output, or serious workflow failure.
- When adding a new model provider, external data source, or integration.
- When changing approval, inventory, or communication behavior.
- At regular project milestones.

For each review:

1. Reassess probability and impact.
2. Check whether the mitigation is implemented.
3. Inspect relevant test results or operational evidence.
4. Record unresolved dependencies.
5. Assign an owner and next action.
6. Update the status and review date.

Prioritize high-impact safety, privacy, security, and data-integrity risks before cosmetic or low-impact issues.

## 7. Initial Priority Actions

Before presenting Shikhar-AI as a working end-to-end prototype:

1. Validate the three agent contracts against the canonical data schemas.
2. Verify deterministic inventory calculations and unit validation.
3. Test that unknown information remains unknown instead of being fabricated.
4. Test conflicting reports and prompt-injection attempts.
5. Verify that edited packages require fresh approval.
6. Confirm that approval does not trigger dispatch or broadcasting.
7. Run the safety and evaluation suite and preserve the results.
8. Verify deployment authentication, secret handling, and cost controls.
9. Rehearse the three-minute demo and its failure plan.
10. Record which capabilities are implemented, partially implemented, mocked, or still planned.

## 8. Change Management

For material changes:

1. Describe the proposed change and its motivation.
2. Identify affected requirements, schemas, agents, tests, and deployment settings.
3. Evaluate new or increased risks.
4. Record an architecture decision when the change affects a major design choice.
5. Implement and test the change.
6. Update the documentation.
7. Record verification evidence and update the relevant risk status.

Changes that weaken safety controls, remove traceability, or permit external actions require explicit review before acceptance.

## 9. Project Status and Limitations

This document is the initial decision and risk baseline for Shikhar-AI. Risk ratings are preliminary and do not represent measured incident rates or validated safety guarantees.

The existence of this register does not mean the listed mitigations are already implemented. Update the register using actual test results, deployment evidence, and reviewed project decisions.

Shikhar-AI remains an experimental decision-support prototype. Real-world emergency use would require additional validation, authorized integrations, operational procedures, security review, and appropriate human oversight.
