# Shikhar-AI — Problem and Users

## 1. Problem overview

Disaster-response coordination depends on gathering information from reports, identifying affected locations and needs, assessing available resources, and communicating proposed actions to relevant stakeholders.

Incoming information may be incomplete, inconsistent, duplicated, ambiguous, or unverified. A report may mention an affected area without providing an exact location, describe urgent needs without specifying quantities, or contain conflicting estimates from different sources.

Coordinators must organize this information before they can prepare a useful initial response plan. They must also avoid treating assumptions as facts or recommending resources that are unavailable.

Shikhar-AI addresses this coordination problem through a human-supervised workflow that structures incident reports, identifies uncertainty, checks recommendations against a sample inventory, and prepares communication drafts for review.

The prototype focuses on the quality, traceability, and efficiency of information processing rather than claiming to solve disaster response as a whole.

## 2. Exact coordination problem

The specific problem is:

**How can a response coordinator transform an unstructured disaster report into a structured, evidence-linked initial response package without losing important information, hiding uncertainty, or recommending resources unsupported by available inventory data?**

The initial response package consists of:

- Structured incident details.
- Reported affected locations and needs.
- Missing, ambiguous, conflicting, or unverified information.
- Resource recommendations based on the sample inventory.
- Supporting evidence and documented assumptions.
- Draft English coordination alerts.
- Draft Nepali public-facing messages.
- A human review and approval record.

## 3. Who experiences the problem?

### 3.1 Local disaster-response coordinators

**Their responsibility:** Organize incident reports, determine what is known, identify information gaps, and prepare initial response priorities.

**Potential difficulty:** Reports may arrive in different formats and may not contain all the details needed for planning.

**How Shikhar-AI may help:** Structure incoming reports into a consistent format and highlight information that requires confirmation.

### 3.2 Emergency operations and relief-planning teams

**Their responsibility:** Compare reported needs with available supplies and prepare proposed resource allocations.

**Potential difficulty:** Resource quantities, availability, and reported needs may need to be reconciled manually.

**How Shikhar-AI may help:** Compare structured needs with a sample inventory and generate recommendations that expose quantities, constraints, evidence, and assumptions.

### 3.3 Humanitarian organizations

**Their responsibility:** Coordinate relief activities and communicate proposed priorities to team members and relevant stakeholders.

**Potential difficulty:** Information may need to be reformatted for different audiences, and messages may inadvertently contain unsupported details.

**How Shikhar-AI may help:** Prepare consistent communication drafts using structured incident information, while requiring human review before use.

## 4. Current process and its limitations

For the prototype, the following is a working model of a possible manual coordination process. It is not a claim that every organization follows the same procedure.

1. A coordinator receives an incident report through a message, document, call summary, or other channel.
2. The coordinator reads the report and manually identifies the incident type, location, reported needs, and available details.
3. Missing information is noted, and clarification may be requested from the reporting source.
4. The coordinator checks available inventory records or consults the responsible team.
5. Proposed resource allocations are prepared using the reported needs and available supplies.
6. Coordination messages and public-facing updates are drafted separately.
7. A responsible person reviews the information and decides what should be communicated or acted upon.

### Potential sources of inefficiency and confusion

- Repeatedly reading and reformatting unstructured reports.
- Omitting important details when transferring information between documents.
- Confusing reported information with assumptions or inferences.
- Failing to identify missing or contradictory details early.
- Recommending quantities without checking inventory constraints.
- Producing inconsistent messages from different versions of an incident report.
- Having limited traceability between a recommendation and the evidence supporting it.

These are hypotheses to validate with intended users, not established findings about all disaster-response organizations.

## 5. Proposed solution

Shikhar-AI organizes the initial information-processing workflow through three specialized agents and a human review stage.

### 5.1 Scout Agent — Incident intelligence

**Input:** An incoming incident report.

**Responsibilities:**

- Extract incident type, location, reported time, affected population when available, and reported needs.
- Preserve the distinction between source-reported facts and model-generated inferences.
- Identify missing, ambiguous, conflicting, or unverified details.
- Associate extracted facts with source text or evidence references.
- Return structured incident information for downstream processing.

**Expected output:** A structured incident record with evidence references, uncertainty indicators, and missing-information fields.

### 5.2 Logistics Agent — Resource planning

**Input:** The structured incident record and sample inventory data.

**Responsibilities:**

- Compare reported needs with available resource categories and quantities.
- Identify shortages and inventory constraints.
- Propose resource allocations supported by available records.
- State assumptions and explain when information is insufficient for a recommendation.
- Avoid presenting unavailable inventory or unverified quantities as confirmed.

**Expected output:** A resource recommendation containing proposed quantities, inventory references, constraints, supporting evidence, and unresolved questions.

### 5.3 Communications Agent — Emergency communication

**Input:** Structured incident information and proposed resource recommendations.

**Responsibilities:**

- Draft an English coordination alert.
- Draft a Nepali public-facing message.
- Preserve uncertainty and avoid inventing locations, casualty figures, resource availability, or official instructions.
- Flag information that requires verification before publication.
- Keep messages consistent with the information provided to the agent.

**Expected output:** Draft messages with a clear review status and references to the information used.

### 5.4 Human reviewer — Final decision authority

**Responsibilities:**

- Verify extracted incident details against source information.
- Review evidence and uncertainty indicators.
- Examine resource recommendations and inventory constraints.
- Edit, approve, or reject generated communications and recommendations.
- Decide whether any approved output is appropriate for its intended use.

**Expected output:** A reviewed response package with a recorded decision.

Human approval within the prototype does not authorize automatic dispatch, official warnings, or external publication.

## 6. What Shikhar-AI can improve

The prototype is designed to test whether AI-assisted information processing can:

- Reduce the manual effort required to structure an incident report.
- Make missing and conflicting information more visible.
- Improve consistency in structured incident records.
- Ensure resource recommendations respect the available sample inventory.
- Make the evidence supporting recommendations easier to inspect.
- Reduce unsupported statements in draft communication messages.
- Provide a repeatable review process for incident information and generated outputs.

These are intended benefits. Their achievement must be established through evaluation rather than assumed from the use of AI agents.

## 7. How improvement will be measured

| Evaluation area | Measurement | Evidence |
|---|---|---|
| Report processing | Time required to produce a structured incident record | Timed tests on predefined reports |
| Extraction quality | Precision, recall, and F1-score for applicable extracted fields | Comparison with human-annotated reference records |
| Location accuracy | Correct identification of reported locations and preservation of ambiguity | Scenario-based reference answers |
| Uncertainty handling | Correct identification of missing, ambiguous, conflicting, and unverified information | Annotated uncertainty cases |
| Inventory correctness | Whether recommended quantities respect recorded availability and inventory constraints | Automated constraint checks |
| Recommendation traceability | Whether recommendations link to supporting incident and inventory evidence | Evidence-reference validation |
| Communication consistency | Whether drafts accurately reflect the incident record and recommendations | Human review using a defined rubric |
| Unsupported claims | Number and severity of unsupported factual claims in generated outputs | Human-annotated error analysis |
| Human review | Whether reviewers can inspect and edit outputs and record approval or rejection | Workflow and usability tests |
| Reliability | Successful completion rate and frequency of workflow failures | Repeated tests across predefined scenarios |

### Initial evaluation method

1. Create a set of simulated disaster reports representing different incident types and levels of information completeness.
2. Prepare reference annotations for incident facts, missing information, conflicting details, and expected inventory constraints.
3. Run the same scenarios through the system.
4. Compare agent outputs with the reference annotations.
5. Record incorrect extractions, unsupported claims, invalid resource allocations, and workflow failures.
6. Measure processing time against a documented manual baseline where feasible.
7. Document limitations and revise the system based on the observed failures.

Specific numerical targets will be established in `docs/07-evaluation-and-testing.md` before final evaluation. No reduction in casualties or real-world emergency response times will be claimed without an appropriate real-world study.

## 8. Initial assumptions

The following assumptions guide the first prototype and require validation.

- **A1 — Report structure:** Simulated incident reports will represent common information gaps found in unstructured emergency reporting.
- **A2 — Inventory availability:** A sample inventory can demonstrate resource-planning logic without requiring integration with a live inventory system.
- **A3 — Agent specialization:** Separating extraction, resource planning, and communication into specialized agents will make responsibilities and failures easier to inspect.
- **A4 — Evidence traceability:** Linking outputs to source information will make recommendations easier for a human reviewer to verify.
- **A5 — Human oversight:** Reviewers will be able to identify and correct important errors when the system presents evidence, uncertainty, and editable outputs clearly.
- **A6 — Bilingual communication:** The system can generate useful English and Nepali drafts, subject to language-quality testing and human review.
- **A7 — Prototype usefulness:** The workflow will be useful enough to justify further development if it demonstrates measurable improvements in information organization, correctness, or reviewability.

## 9. Validation plan

To validate the assumptions, the project should:

- Review the workflow with people familiar with disaster response or humanitarian coordination.
- Ask intended users which incident fields and resource constraints are essential.
- Test reports containing missing locations, conflicting needs, ambiguous quantities, and unverified claims.
- Compare agent-generated records with manually annotated reference data.
- Check whether recommendations remain within inventory constraints.
- Evaluate whether reviewers can locate supporting evidence and correct generated outputs.
- Collect feedback on the clarity and usefulness of the dashboard and communication drafts.

If direct user research is not available, the project must describe its conclusions as prototype evaluation results rather than validated real-world operational findings.

## 10. Definition of a successful prototype

The problem-solving workflow will be demonstrated when a user can submit a simulated incident report, inspect the structured facts and uncertainties, review inventory-grounded resource recommendations, examine draft English and Nepali communications, and approve, edit, or reject the response package.

The demonstration must also show how the system handles missing information and at least one scenario in which it cannot safely make a confident recommendation.

## 11. Limitations

Shikhar-AI initially operates on simulated reports and sample inventory data. Its outputs depend on the quality of the supplied information, the implemented agent logic, and the reliability of the underlying models.

Successful prototype tests will not, by themselves, establish suitability for operational disaster management. Real-world use would require further validation, appropriate authorization, reliable data sources, operational safeguards, and review by qualified personnel.
