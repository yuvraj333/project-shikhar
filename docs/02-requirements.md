# Shikhar-AI — Functional and Non-Functional Requirements

## 1. Purpose

This document defines the functional and non-functional requirements for Shikhar-AI, a human-supervised, multi-agent disaster-response decision-support prototype.

Each requirement has a unique identifier and a testable acceptance condition. These identifiers will be used to connect implementation components, automated tests, evaluation scenarios, and documented limitations.

The initial implementation will use simulated incident reports and sample inventory data. Requirements involving live emergency systems or external operational integrations are outside the current prototype scope.

## 2. Requirement priorities

Requirements are classified as follows:

- **Must:** Required for the minimum working prototype.
- **Should:** Important for reliability, usability, or evaluation, but can follow the minimum implementation.

All FR requirements and the traceability, security, and reproducibility requirements are mandatory for the initial evaluated prototype.

## 3. Functional requirements

Functional requirements describe what Shikhar-AI must do.

| ID | Requirement | Priority | Acceptance condition |
|---|---|---|---|
| FR-01 | Accept an incident report | Must | A user can submit a non-empty incident report and retrieve the stored report using its unique identifier. Invalid submissions are rejected with a visible validation message. |
| FR-02 | Extract structured facts | Must | The Scout Agent returns incident information conforming to the defined schema. Valid outputs pass schema validation; invalid outputs are rejected or handled through a controlled error path. |
| FR-03 | Preserve uncertainty | Must | Missing, ambiguous, conflicting, and unverified information is explicitly represented. Unknown numerical values remain unknown or null rather than being silently converted to zero. |
| FR-04 | Check available resources | Must | The Logistics Agent uses the supplied sample inventory to produce recommendations that respect available quantities and applicable inventory constraints. |
| FR-05 | Draft emergency messages | Must | The Communications Agent produces an English coordination alert and a Nepali public-facing SMS draft based on the incident record and proposed response plan. |
| FR-06 | Show supporting evidence | Must | A reviewer can inspect extracted facts, source references, relevant inventory values, and assumptions supporting each recommendation. |
| FR-07 | Require human approval | Must | Generated recommendations and messages remain in draft or pending-review status until a human reviewer explicitly approves them. Editing, rejection, and approval decisions are recorded. |
| FR-08 | Handle failures | Must | Invalid agent outputs, schema-validation failures, and tool or model errors produce visible error states. Failed processing does not silently become a successful response package. |
| FR-09 | Orchestrate specialized agents | Must | The workflow invokes the Scout, Logistics, and Communications agents in the defined order and passes validated outputs between them. |
| FR-10 | Maintain incident traceability | Must | Each response package can be linked to its source incident report, structured incident record, resource recommendations, and generated messages. |
| FR-11 | Display a response package | Must | A user can inspect the incident summary, uncertainties, resource recommendations, draft messages, and review status in one interface. |
| FR-12 | Record review decisions | Must | The system records the reviewer decision, decision timestamp, and relevant edits or comments supported by the implementation. Approval does not automatically dispatch resources or publish messages. |
| FR-13 | Validate resource constraints | Must | Automated tests verify that recommended allocations do not exceed the relevant available inventory quantities and that invalid or unsupported allocations are flagged. |
| FR-14 | Support evaluation scenarios | Must | A predefined scenario can be submitted repeatedly, and the system records outputs and evaluation results for comparison against reference data. |

## 4. Non-functional requirements

Non-functional requirements describe how the system should behave and how its quality will be evaluated.

| ID | Requirement | Priority | Acceptance condition |
|---|---|---|---|
| NFR-01 | Traceability | Must | Every resource recommendation identifies its supporting incident evidence, inventory record, or explicitly stated assumption. Recommendations without sufficient support are flagged. |
| NFR-02 | Reproducibility | Must | Versioned evaluation scenarios can be rerun using documented configuration and input data. Results, failures, and relevant model or prompt versions are recorded. |
| NFR-03 | Security | Must | Credentials and API keys are not committed to GitHub. Configuration secrets are supplied through environment variables or an appropriate secret-management mechanism. |
| NFR-04 | Usability | Must | A new user can complete the documented demonstration workflow without developer intervention, using the provided setup or deployed prototype. |
| NFR-05 | Data validation | Must | Incoming reports, inventory records, and agent outputs are validated against defined schemas or constraints before downstream processing. |
| NFR-06 | Failure isolation | Must | A failure in an agent or external dependency is reported and handled without presenting incomplete processing as a fully successful response. |
| NFR-07 | Privacy | Must | The prototype minimizes personal data collection, avoids unnecessary sensitive information in logs, and uses synthetic or appropriately anonymized demonstration data. |
| NFR-08 | Auditability | Must | Important workflow events, including processing failures and human review decisions, can be inspected through application records or logs without unnecessarily exposing sensitive data. |
| NFR-09 | Maintainability | Should | Agent responsibilities, schemas, configuration, and evaluation logic are organized into documented modules with automated tests. |
| NFR-10 | Performance measurement | Should | Processing duration is recorded for predefined scenarios so response-generation latency can be measured and compared. No performance target is claimed until a baseline is established. |
| NFR-11 | Language quality | Must | English and Nepali message drafts are evaluated against predefined criteria for factual consistency, readability, and unsupported claims. |
| NFR-12 | Graceful degradation | Must | If an agent cannot produce a valid result, the system identifies the failed stage and allows recovery or retry without treating missing output as verified information. |

## 5. Validation and data-handling rules

The following rules apply across the functional requirements.

### 5.1 Unknown values

Unknown values must remain distinguishable from confirmed values.

For example, if a report does not specify the number of affected people, the system must not assume that the number is zero.

The data contract should distinguish among:

- A known value supported by the report.
- A value explicitly reported as zero.
- A missing value.
- An ambiguous or conflicting value.
- An unverified value.

The exact representation will be defined in `05-data-contracts.md`.

### 5.2 Evidence and assumptions

The system must distinguish source-supported facts from model-generated inferences and planning assumptions.

A recommendation should identify the evidence used, the relevant inventory information, and any assumptions that affect the proposed allocation.

If the available evidence is insufficient, the system should identify the limitation instead of inventing a confident recommendation.

### 5.3 Inventory constraints

Resource recommendations must respect the inventory data provided to the workflow.

For example, if the sample inventory contains 100 available blankets, a recommendation cannot allocate 120 blankets from that inventory.

The system must also account for any applicable reservation, unit, or availability rules implemented in the inventory model.

### 5.4 Human approval

Approval is an explicit review decision, not an automatic consequence of successful AI processing.

Generated communications remain drafts until a reviewer approves them. Approval within the prototype does not authorize automatic emergency broadcasting, rescue dispatch, or external publication.

### 5.5 Error handling

Errors must be distinguishable from valid results.

The application must not silently replace failed agent output with fabricated data, treat malformed output as valid, or mark an incomplete response package as fully processed.

## 6. Requirement-to-test mapping

The following mapping provides the initial test plan. Detailed scenarios and expected outputs will be documented in `07-evaluation-and-testing.md`.

| Requirement IDs | Test method | Example test |
|---|---|---|
| FR-01 | API or interface integration test | Submit a valid report, retrieve it by ID, and reject an empty report. |
| FR-02, NFR-05 | Schema-validation test | Validate a correct Scout output and reject malformed or incomplete required fields. |
| FR-03 | Unit and scenario tests | Submit reports with missing population figures, conflicting locations, and explicitly reported zero values. |
| FR-04, FR-13 | Inventory constraint test | Request more supplies than available and verify that the system does not recommend an unsupported allocation. |
| FR-05, NFR-11 | Integration and human-review tests | Generate both language drafts and check their factual consistency against the incident record. |
| FR-06, NFR-01 | Traceability test | Inspect a recommendation and verify that its evidence and inventory references resolve correctly. |
| FR-07, FR-12 | Workflow integration test | Verify that drafts require explicit approval and that approval, editing, and rejection are recorded. |
| FR-08, NFR-06, NFR-12 | Failure-injection test | Simulate a model timeout, malformed output, or downstream agent failure and verify visible error handling. |
| FR-09 | Workflow integration test | Verify agent execution order and validate the data passed between agents. |
| FR-10, FR-11 | End-to-end test | Open a response package and trace it back to the original report. |
| FR-14, NFR-02 | Reproducibility test | Rerun a versioned scenario and compare outputs with reference data and previously recorded results. |
| NFR-03 | Repository and configuration audit | Scan tracked files for committed secrets and verify the configuration process. |
| NFR-04 | Usability test | Ask a new user to complete the demo using the documented instructions. |
| NFR-07, NFR-08 | Privacy and audit review | Inspect logs for unnecessary personal information and verify that key review events are recorded. |
| NFR-09 | Code review and test inspection | Verify that core modules have defined responsibilities and can be tested independently. |
| NFR-10 | Timed scenario test | Measure processing duration across a documented set of reports. |

## 7. Definition of done

A requirement is considered implemented only when:

1. The corresponding functionality exists in the codebase.
2. Its acceptance condition is documented and testable.
3. The relevant automated or documented test has been executed.
4. Test failures and known limitations are recorded.
5. The implementation does not violate the project's safety and human-approval requirements.

A requirement must not be marked complete solely because a corresponding interface element or agent prompt exists.

## 8. Change management

New requirements must have a unique identifier, a clear purpose, and an acceptance condition that can be tested.

Changes to existing requirements should preserve traceability to implementation and tests. Changes affecting safety, data contracts, agent responsibilities, or human approval must also be documented in `10-decisions-and-risks.md`.

Requirements will evolve as the prototype is implemented and evaluated. Any changes must remain consistent with the project charter and its stated limitations.
