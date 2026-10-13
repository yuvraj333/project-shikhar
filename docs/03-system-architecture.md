# Shikhar-AI — System Architecture

## 1. Purpose

This document describes the proposed system architecture for Shikhar-AI, a human-supervised, multi-agent disaster-response decision-support prototype.

The architecture defines the main application components, the incident-processing workflow, the data exchanged between agents, and the failure and approval paths.

The initial implementation uses simulated incident reports and sample inventory data. External model services may be used for language understanding and message generation, while deterministic application code remains responsible for data validation, inventory calculations, workflow state, and approval enforcement.

## 2. Architectural principles

### 2.1 Separate AI reasoning from deterministic logic

AI agents are responsible for tasks that benefit from language understanding and synthesis, such as extracting incident details and drafting communications.

Normal application code is responsible for:

- Validating input and output schemas.
- Checking required fields and data types.
- Performing inventory arithmetic.
- Enforcing resource availability constraints.
- Managing workflow and approval states.
- Recording audit events.
- Preventing unapproved messages from being published or dispatched.

An AI-generated recommendation must never override deterministic inventory constraints.

### 2.2 Use specialized agents

Each agent has a defined responsibility and receives only the structured information required for its task.

- **Scout Agent:** Extracts incident information and identifies uncertainty.
- **Logistics Agent:** Interprets reported needs and prepares proposed allocations using validated inventory calculations.
- **Communications Agent:** Drafts English coordination alerts and Nepali public-facing messages.

The workflow orchestrator controls the execution order and validates outputs before passing them downstream.

### 2.3 Keep humans in control

The system generates a response package for review. A human reviewer can inspect evidence, edit outputs, approve them, or reject them.

Approval is recorded as an application state transition. It does not automatically dispatch resources or publish emergency messages.

### 2.4 Make outputs traceable

Each response package must be linked to its source incident report, extracted incident record, relevant inventory data, recommendations, generated messages, and review decisions.

### 2.5 Handle uncertainty explicitly

Missing, ambiguous, conflicting, and unverified information must remain distinguishable from confirmed facts.

When the available evidence is insufficient, the system should flag the limitation or request clarification rather than inventing details.

## 3. High-level component architecture

The system consists of six logical layers.

### 3.1 User interface

The Shikhar Dashboard provides the interface for:

- Submitting incident reports.
- Viewing structured incident information.
- Inspecting uncertainties and source evidence.
- Reviewing inventory-grounded recommendations.
- Reading and editing draft communications.
- Approving or rejecting the response package.
- Viewing processing errors and review status.

### 3.2 Backend API

The Backend API handles requests from the dashboard.

Its responsibilities include:

- Validating incoming requests.
- Creating and retrieving incident records.
- Initiating processing workflows.
- Returning response-package data and processing status.
- Enforcing authorization for review actions.
- Exposing controlled interfaces to application services.

### 3.3 Workflow orchestrator

The Workflow Orchestrator coordinates the agents and application services.

It is responsible for:

- Managing workflow stages.
- Invoking agents in the required order.
- Validating agent outputs.
- Passing validated data between stages.
- Handling retries and processing failures.
- Preventing downstream execution when required upstream data is invalid.
- Maintaining workflow status and traceability.

The orchestrator must not treat an agent's unvalidated output as trusted application data.

### 3.4 Agent layer

**Scout Agent**

Uses a language model, such as Gemini, where appropriate to extract facts from unstructured reports. It returns structured incident information, source references, and uncertainty indicators.

**Logistics Agent**

Interprets the validated incident record and identifies potentially relevant resource needs. Deterministic inventory services calculate and validate proposed allocations against the available sample inventory.

The language model may help interpret needs, but it must not independently establish inventory availability or override allocation constraints.

**Communications Agent**

Uses the validated incident record and reviewed resource recommendations to draft an English coordination alert and a Nepali public-facing SMS.

Generated messages remain drafts until reviewed and explicitly approved by a human.

### 3.5 Data and application services

**Incident Store**

Persists submitted reports, structured incident records, workflow status, and response packages.

**Sample Resource Inventory**

Stores resource categories, quantities, units, and availability for the prototype.

**Inventory Validation Service**

Performs deterministic calculations and checks whether proposed allocations satisfy inventory constraints.

**Audit and Evaluation Records**

Capture relevant processing events, failures, evidence references, reviewer decisions, and evaluation results without unnecessarily recording sensitive information.

The initial implementation may combine these logical services within a single backend application. They do not require separate microservices.

### 3.6 External model provider

A model provider such as Gemini can support language-dependent tasks, including:

- Extracting structured information from reports.
- Interpreting reported needs.
- Drafting communications in English and Nepali.

Model outputs must be validated by application code. Provider timeouts, malformed outputs, quota limits, and other failures must be handled explicitly.

The model provider is not the authoritative source of incident facts, inventory quantities, approval status, or operational authorization.

## 4. High-level component diagram

The component diagram is maintained in `docs/assets/architecture.mmd`.

It illustrates the main components, their responsibilities, and the flow of information between the dashboard, backend, orchestrator, agents, inventory services, data stores, model provider, and human reviewer.

The diagram is a logical architecture. Deployment topology and specific technology choices may evolve as implementation proceeds.

## 5. End-to-end incident sequence

The following sequence describes the expected lifecycle of an incident.

1. **Submission:** A user submits an incident report through the dashboard.
2. **Input validation:** The backend validates the request and stores the original report with a unique incident identifier.
3. **Workflow initialization:** The orchestrator creates a processing record and invokes the Scout Agent.
4. **Incident extraction:** Scout extracts reported facts, source evidence, and uncertainty indicators.
5. **Schema validation:** Application code validates the extracted output. Invalid results follow the failure path rather than proceeding as trusted data.
6. **Resource planning:** The orchestrator sends the validated incident record to the Logistics Agent.
7. **Inventory checking:** The inventory service retrieves the relevant sample inventory. Deterministic code validates quantities and calculates feasible allocations.
8. **Recommendation validation:** The system checks inventory constraints and attaches evidence references, assumptions, and unresolved questions.
9. **Message drafting:** The Communications Agent receives the validated incident record and resource recommendation and drafts English and Nepali messages.
10. **Package validation:** The orchestrator validates the generated messages and checks their consistency with the incident record and recommendations.
11. **Response package creation:** The application stores the results and marks the package as pending human review.
12. **Human review:** The reviewer inspects the facts, uncertainty indicators, resource allocations, supporting evidence, and messages.
13. **Review decision:** The reviewer edits, approves, or rejects the response package. Missing or conflicting information may require clarification and reprocessing.
14. **Audit and retrieval:** The application records the decision and makes the latest package and its review status available through the dashboard.

A successful AI call does not imply that the incident information is correct or that a recommendation is safe. Validation and human review remain separate steps.

## 6. Data flowing between agents

### 6.1 Incident submission to Scout

**Input:**

- Incident identifier.
- Original report text.
- Submission timestamp.
- Optional source metadata.

**Output:**

- Structured incident fields.
- Source evidence references.
- Missing-information indicators.
- Ambiguity and conflict indicators.
- Verification status where available.

The original report must be preserved so that extracted details can be checked against their source.

### 6.2 Scout to Logistics

Scout provides a schema-validated incident record containing relevant reported needs, affected locations, available quantities when explicitly reported, and uncertainty indicators.

Logistics must not silently convert unknown values into zero or treat unverified estimates as confirmed quantities.

If essential information is missing, the system should flag the limitation and, where appropriate, request clarification.

### 6.3 Inventory service to Logistics

The inventory service provides the current sample inventory records required for planning.

Relevant fields include:

- Resource identifier and category.
- Available quantity.
- Unit of measurement.
- Inventory record identifier.
- Availability or reservation status where implemented.

The inventory service is authoritative for the prototype's recorded stock values. A language model must not invent or alter these values.

### 6.4 Logistics to Communications

Logistics provides a structured recommendation containing:

- Proposed resource allocations.
- Supporting inventory references.
- Relevant reported needs.
- Assumptions and constraints.
- Shortages or unmet needs.
- Unresolved questions.
- Validation status.

Only validated recommendations should be passed as confirmed planning results. Infeasible or uncertain proposals must remain explicitly flagged.

### 6.5 Communications to the response package

Communications produces:

- An English coordination alert draft.
- A Nepali public-facing SMS draft.
- References to the incident information used.
- Verification flags for potentially uncertain statements.
- Draft status.

The communications agent must not introduce unsupported casualty figures, locations, resource quantities, official instructions, or claims of verified conditions.

### 6.6 Response package to the human reviewer

The final package combines the original report, structured incident record, uncertainty indicators, inventory-grounded recommendations, draft messages, validation results, and workflow status.

The reviewer can inspect and edit this information before making a decision.

The detailed schemas and field definitions belong in `05-data-contracts.md`.

## 7. Failure paths

Failures must be explicit, traceable, and recoverable where possible.

### 7.1 Invalid incident submission

If a submitted report fails input validation, the backend returns a clear validation error. An invalid report must not enter the normal processing workflow.

### 7.2 Scout extraction failure

If Scout times out, returns malformed data, or fails schema validation, the orchestrator records the failure and marks the relevant processing stage as failed or awaiting retry.

Logistics must not receive an invalid incident record as if it were valid.

### 7.3 Missing or conflicting information

If an incident report omits essential information or contains conflicting claims, the system records the uncertainty and exposes it for review.

The system may continue with the information that is safe and sufficient to process, but it must not invent missing values. If the missing information prevents a defensible recommendation, that limitation must be explicit.

### 7.4 Inventory failure or infeasible allocation

If inventory data cannot be retrieved or validated, the system must not fabricate stock quantities.

If a proposed allocation exceeds available stock, deterministic validation rejects or flags it. The application may propose a feasible alternative only when that alternative can be calculated from the available data and applicable constraints.

### 7.5 Communications failure

If the Communications Agent fails, the response package must identify that message generation did not complete successfully.

A missing or invalid message must not be presented as a completed draft. The application may allow a retry without silently changing the underlying incident facts or validated inventory results.

### 7.6 Model provider failure

If the external model provider is unavailable, times out, or returns an invalid response, the application records the failure and provides a visible status.

Retries should be bounded and should not create duplicate incident records or duplicate review decisions.

### 7.7 Persistence or backend failure

If a required persistence operation fails, the system must not report the corresponding operation as successfully saved.

The application should return a suitable error and preserve consistency between workflow status and persisted response data as far as the storage design permits.

## 8. Human approval and review paths

The review workflow separates AI-generated content from human-authorized decisions.

### Pending review

The response package is available for inspection, but generated messages remain drafts.

### Approved

An authorized reviewer explicitly approves the package or the relevant draft. The system records the decision and timestamp. Any later modification to approved content must invalidate or supersede the applicable approval.

Approval does not automatically trigger external publication or resource dispatch.

### Edited

If a reviewer modifies a message or recommendation, the changes are saved and the relevant content returns to a pending-review state until explicitly approved again.

### Rejected

A reviewer can reject the proposed package or draft and record a reason. Rejected content must not be treated as approved.

### Needs clarification

If the reviewer identifies missing or conflicting information, the package can be marked as requiring clarification. After the information is updated, the relevant processing stages can be rerun.

### Error

If required processing or validation fails, the system displays the failure and prevents the affected package from being marked as successfully completed.

## 9. State management

The implementation should distinguish processing status from review status.

Suggested processing states:

- `submitted`
- `processing`
- `completed`
- `needs_clarification`
- `failed`

Suggested review states:

- `pending_review`
- `approved`
- `edited_pending_review`
- `rejected`

These are proposed application states. The final state model, permitted transitions, and persistence rules must be specified and tested before implementation.

An incident can have completed processing while still awaiting human review. A successful processing status must never be interpreted as approval.

## 10. Security and operational boundaries

- Protect review and approval endpoints with appropriate authorization.
- Keep model provider credentials outside source control.
- Validate all external and model-generated inputs before use.
- Limit logs to information needed for troubleshooting and auditability.
- Use synthetic or appropriately anonymized data for demonstrations.
- Do not expose autonomous dispatch or broadcasting capabilities in the prototype.
- Record model and prompt versions where practical for reproducibility.
- Keep the prototype's limitations visible in the interface and documentation.

## 11. Relationship to other documents

- `02-requirements.md` defines the acceptance conditions the architecture must support.
- `04-agent-specifications.md` defines each agent's detailed responsibilities, inputs, outputs, and failure behavior.
- `05-data-contracts.md` defines schemas and data exchanged between components.
- `06-safety-and-human-approval.md` defines approval controls and safety requirements.
- `07-evaluation-and-testing.md` defines the scenarios and tests used to assess correctness.
- `08-deployment-and-operations.md` defines deployment and operational procedures.
- `10-decisions-and-risks.md` records significant architecture decisions, risks, and mitigations.

## 12. Implementation status

This document describes the intended first-version architecture. Components should be marked as implemented only after they exist in the codebase and their acceptance conditions have been tested.

Architecture changes must be documented when they materially affect component responsibilities, data contracts, inventory validation, failure handling, or human approval.
