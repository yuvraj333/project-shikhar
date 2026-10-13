# Shikhar-AI — Project Charter

## 1. Vision

Shikhar-AI is a human-supervised, multi-agent disaster-response decision-support prototype that transforms incoming emergency reports into structured incident information, evidence-linked resource recommendations, and draft coordination messages.

Its vision is to help disaster-response coordinators organize incomplete information, identify immediate reported needs, assess available resources, and prepare consistent communications through a transparent and reviewable AI-assisted workflow.

The system is intended to support human decision-making, not independently make or execute emergency-response decisions.

## 2. Problem statement

During a disaster, information may arrive through incomplete, inconsistent, ambiguous, or unstructured reports. Response coordinators must interpret these reports, identify affected locations and reported needs, determine what information remains unknown, assess available supplies, and communicate priorities to relevant stakeholders.

When these activities are performed manually across separate documents and communication channels, information can be difficult to organize, verify, and update consistently.

Shikhar-AI aims to reduce the manual effort involved in organizing incident information and preparing an initial response package. It will use specialized AI agents to extract reported facts, represent uncertainty, generate inventory-grounded recommendations, and draft communications for human review.

The effectiveness of the prototype will be assessed through predefined scenarios and measurable evaluation criteria rather than assumed improvements in real-world emergency outcomes.

## 3. Target users

### Primary users

- **Local disaster-response coordinators:** Organize incoming incident reports and prepare initial response plans.
- **Emergency operations and relief-planning teams:** Review reported needs, assess available resources, and coordinate proposed actions.
- **Humanitarian organizations:** Prepare resource recommendations and draft communications for relief coordination.

### Secondary stakeholders

- Supervisors responsible for reviewing proposed response actions.
- Technical evaluators assessing the reliability and safety of AI-assisted workflows.
- Researchers exploring multi-agent systems for disaster-management decision support.

These groups are intended users of the prototype. Their actual needs and workflows must be validated through feedback and scenario-based testing.

## 4. Core workflow

The prototype follows a supervised, sequential multi-agent workflow.

1. **Incident submission:** A user submits a simulated disaster report containing the available incident information.
2. **Scout Agent — Incident intelligence:** Extracts structured facts, affected locations, reported needs, evidence references, missing fields, and uncertainties.
3. **Logistics Agent — Resource planning:** Examines the structured incident information and available inventory, then proposes resource allocations with quantities, supporting evidence, and explicit assumptions.
4. **Communications Agent — Message preparation:** Drafts an English coordination alert and a Nepali public-facing message using the reviewed incident information and proposed response plan.
5. **Human review:** A reviewer inspects the source information, extracted facts, uncertainties, inventory availability, recommendations, and communication drafts.
6. **Approval or rejection:** The reviewer approves, edits, or rejects the response package. Approval must not automatically trigger real-world dispatch or public broadcasting.

The workflow must preserve traceability between the original report, the extracted facts, the resource recommendations, and the generated messages.

## 5. Prototype boundaries

### In scope

- Simulated disaster reports and predefined incident scenarios.
- Structured extraction of incident details.
- Identification of missing, ambiguous, conflicting, or unverified information.
- Sample resource inventory with traceable quantities and availability.
- Resource recommendations based on inventory constraints and documented assumptions.
- Draft English coordination alerts and Nepali public-facing messages.
- Multi-agent orchestration with structured inputs and outputs.
- Human review, editing, approval, and rejection.
- Evidence traceability and basic audit records.
- Evaluation against predefined test scenarios.
- Deployment preparation and demonstration on Google Cloud.

### Out of scope

- Autonomous dispatch of rescue teams, vehicles, or supplies.
- Automatic emergency alerts or public broadcasts.
- Claims of verified live emergency monitoring without an implemented and validated data source.
- Integration with government emergency systems unless implemented and explicitly authorized.
- Unsupervised execution of consequential emergency decisions.
- Claims of reduced casualties, improved survival rates, or specific real-world response-time improvements without credible supporting evaluation.
- Treating AI-generated estimates or unverified reports as confirmed facts.

## 6. Success definition

The prototype will be considered successful when a user can:

1. Submit an incident report through a working interface.
2. Inspect structured incident information extracted by the Scout Agent.
3. Identify missing, uncertain, or conflicting information.
4. Review resource recommendations grounded in the available sample inventory.
5. Inspect the evidence and assumptions supporting each recommendation.
6. Generate draft English and Nepali communications consistent with the available incident information.
7. Approve, edit, or reject the response package through a human review interface.
8. Trace generated recommendations and messages back to their supporting information.
9. Evaluate the workflow against predefined scenarios and documented acceptance criteria.

Quantitative success thresholds will be established in the evaluation plan before final testing.

## 7. Guiding principles

### Evidence-grounded recommendations

Recommendations must be supported by available incident information, inventory records, or explicitly stated assumptions. Unsupported details must not be presented as verified facts.

### Explicit uncertainty

The system must distinguish reported facts, inferred information, missing information, conflicting reports, and unverified claims.

### Human oversight

The system assists authorized reviewers. It does not independently authorize consequential response actions or communicate official emergency instructions.

### Privacy and data minimization

The prototype should use synthetic or appropriately anonymized data wherever possible and avoid collecting unnecessary personal information.

### Traceability

Users should be able to inspect the source information and reasoning-relevant evidence supporting extracted facts and recommendations.

### Reproducible evaluation

System performance must be assessed using documented test scenarios, expected outputs, measurable criteria, and recorded failures.

### Transparent limitations

Documentation and demonstrations must clearly distinguish implemented capabilities from planned features and experimental results.

## 8. Initial deliverables

- Project documentation and requirements.
- System architecture and architecture diagram.
- Agent specifications and structured data contracts.
- A simulated incident dataset and sample inventory.
- A working multi-agent response workflow.
- A human review dashboard.
- Automated tests and an evaluation report.
- A reproducible demonstration scenario.
- Deployment and operational documentation.

## 9. Project status

**Current stage:** Prototype design and development.

The initial focus is to define the problem, requirements, system architecture, agent boundaries, data contracts, and safety controls before completing implementation and evaluation.

## 10. Approval and change management

Changes to the project's scope, safety requirements, data contracts, or consequential workflow behavior should be documented in `docs/10-decisions-and-risks.md`.

A capability should be described as implemented only after its implementation has been verified through appropriate tests.
