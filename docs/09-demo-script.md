# Shikhar-AI Demo Script

## 1. Purpose

This document defines a reproducible three-minute demonstration of Shikhar-AI's disaster-response decision-support workflow.

The demonstration shows how specialized agents can transform a simulated emergency report into structured incident information, resource recommendations, and communication drafts while keeping consequential decisions under human control.

**Demo duration:** 3 minutes  
**Scenario:** Simulated landslide with reported trapped people and limited emergency supplies  
**Audience:** Technical reviewers, potential collaborators, mentors, and project evaluators

## 2. Demo Preparation

Before the demonstration:

- Deploy and verify the intended application revision, or run the application locally.
- Confirm that all three agent stages are available.
- Load a clearly labeled sample inventory.
- Prepare a known-good simulated incident report.
- Confirm that the inventory calculations and approval gate work.
- Ensure the English alert and Nepali SMS can be displayed.
- Keep a backup screenshot or recorded walkthrough available in case the live demo fails.
- Do not use real personal information or imply that the scenario represents a verified ongoing disaster.

### Sample incident report

Use the following fictional report as the standard demonstration input:

> **SIMULATED INCIDENT — NOT A REAL EMERGENCY**
>
> A landslide has reportedly affected a settlement near a hillside road in a fictional demonstration area. A local volunteer reports that 12 people may be trapped. Several households may need drinking water and first-aid supplies. The exact location, number of injured people, road accessibility, and availability of rescue teams have not been confirmed.

### Sample inventory

Use a fixed fixture so the demonstration is repeatable.

| Resource | Available quantity | Unit |
|---|---:|---|
| Drinking water | 100 | bottles |
| First-aid kits | 20 | kits |
| Rescue stretchers | 4 | units |

For the demonstration, set the proposed water requirement to 150 bottles only if the report, an explicit planning rule, or a clearly labeled scenario assumption justifies that quantity. Do not present the quantity as an independently verified real-world need.

Expected calculation:

- Proposed water requirement: 150 bottles.
- Sample inventory: 100 bottles.
- Calculated shortfall: 50 bottles.

The inventory is mock data, not a statement about actual supplies in any location.

## 3. Three-Minute Walkthrough

### 0:00–0:25 — Introduce the problem

**Show:** Project overview and workflow diagram.

**Say:**

"During a disaster, reports can be incomplete, conflicting, and difficult to coordinate. Shikhar-AI is a human-supervised, multi-agent decision-support prototype. It organizes reported information, checks a sample inventory, and prepares communication drafts so a human coordinator can review the result."

Emphasize that this demonstration uses simulated data and does not connect to live emergency services.

### 0:25–0:55 — Submit a simulated emergency report

**Show:** Incident submission screen.

**Actions:**

1. Point out the simulated-data label.
2. Submit the prepared landslide report.
3. Show the incident ID and processing status.

**Say:**

"We start with an unstructured report. The system creates a traceable incident record and passes the report through a controlled workflow. The original report remains the evidence source; the AI should not turn an allegation into a verified fact."

**Expected result:** The report is accepted and the workflow begins, or the interface displays a controlled error if submission fails.

### 0:55–1:25 — Show the Scout Agent

**Show:** Structured incident facts, evidence, and uncertainty.

**Actions:**

1. Point to the reported landslide.
2. Show the report of 12 potentially trapped people.
3. Show the missing exact location and unconfirmed injuries.
4. Show the source references or evidence supporting the extracted fields.

**Say:**

"The Scout Agent converts the report into structured fields. It distinguishes what the report says from what has actually been verified. For example, 12 people are reported as potentially trapped; that is not the same as independently confirming that 12 people are trapped."

**Expected result:** Extracted facts have traceable evidence, and missing or uncertain details remain visible.

### 1:25–1:55 — Show the Logistics Agent

**Show:** Sample inventory and proposed resource plan.

**Actions:**

1. Show the inventory snapshot and its simulated-data label.
2. Show the water requirement and available stock.
3. Show the calculated shortage.
4. Point out the planning assumptions.

**Say:**

"The Logistics Agent proposes resource needs, while deterministic application code checks the quantities against the sample inventory. Here, a scenario requirement of 150 bottles compared with 100 available produces a shortage of 50. This is a planning calculation, not a dispatch order."

**Expected result:** The calculation is correct, inventory constraints are enforced, and unavailable or unknown stock is not treated as available.

### 1:55–2:25 — Show the Communications Agent

**Show:** English coordination alert and Nepali public-facing SMS draft.

**Actions:**

1. Open the English draft.
2. Open the Nepali SMS draft.
3. Point out the source information and uncertainty warnings.
4. Confirm the delivery status is `NOT SENT`.

**Say:**

"The Communications Agent prepares messages for human review. The drafts should preserve uncertainty, avoid unsupported instructions, and clearly distinguish a reported incident from a confirmed emergency. Nothing is automatically broadcast."

**Expected result:** Both drafts are visible, traceable to the incident, and marked as pending review and not sent.

### 2:25–2:45 — Demonstrate the human approval gate

**Show:** Draft editing and review controls.

**Actions:**

1. Edit a draft or reject it.
2. Show that the changed package requires review again.
3. Demonstrate approval only after inspecting the current version, if time permits.

**Say:**

"AI output is not authorization. A reviewer can edit, reject, or request clarification. Changes invalidate an earlier approval where required. Approval records a human decision; it does not dispatch resources or send messages."

**Expected result:** The review status updates correctly and unauthorized actions remain blocked.

If the deployed interface does not yet implement these controls, demonstrate the documented workflow with a labeled mock-up and explicitly disclose that the controls are not yet implemented. Do not present a mock-up as working software.

### 2:45–3:00 — Show evaluation and limitations

**Show:** Evaluation summary and system architecture.

**Say:**

"We evaluate extraction accuracy, uncertainty preservation, inventory correctness, schema validity, and approval enforcement. We report measured results only after running the tests. Shikhar-AI is currently a prototype using simulated reports and sample inventory; it is not a live disaster-monitoring, dispatch, or emergency-broadcasting system."

**Expected result:** The audience sees the evaluation methodology, architecture, and project boundaries.

## 4. Reproducibility

Use the same:

- Incident report fixture.
- Inventory fixture.
- Model configuration and version, where available.
- Workflow configuration.
- Expected resource calculations.
- Evaluation cases.

Record the application revision, configuration, model identifier, execution time, and test results. Model-generated wording can vary between runs, so evaluate factual correctness and safety properties rather than expecting identical prose.

## 5. Demo Failure Plan

| Failure | Response |
|---|---|
| Application unavailable | Use the prepared recording or screenshots and disclose the outage. |
| Model timeout | Show the controlled failure state; do not invent a successful result. |
| Invalid structured output | Show validation failure and the bounded retry or escalation behavior. |
| Inventory service unavailable | Show stock as unknown rather than zero or available. |
| Incorrect message draft | Reject or edit the draft and record the issue. |
| Approval control unavailable | Do not claim that the approval gate works; demonstrate the documented design separately. |
| Network failure | Switch to a local demonstration if already tested, or use the prepared backup. |

## 6. Success Criteria

The demo is successful when the audience can observe:

- A simulated report being submitted.
- Structured facts with traceable evidence.
- Explicit missing information and uncertainty.
- Correct inventory arithmetic.
- English and Nepali message drafts.
- A clear human review state.
- No automatic dispatch or broadcasting.
- An honest account of measured results and limitations.

## 7. After the Demo

Record:

- Date and application revision.
- Whether the demo completed end to end.
- Which stages worked or failed.
- Test results and any unexpected outputs.
- Approximate cloud and model usage, when available.
- Reviewer feedback.
- Issues to resolve before the next demonstration.

Never substitute target metrics or expected outcomes for actual measured results.
