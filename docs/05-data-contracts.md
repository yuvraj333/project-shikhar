# Data Contracts

## 1. Purpose

This document defines the canonical data structures exchanged between Shikhar-AI components.

The contracts ensure that:

- Scout returns structured incident information.
- Logistics produces resource recommendations grounded in inventory records.
- Communications generates evidence-consistent message drafts.
- The workflow orchestrator can validate outputs before passing them downstream.
- Human reviewers can inspect evidence, uncertainty, recommendations, and decisions.
- Evaluation and audit records can trace outputs to their sources.

All examples in this document are illustrative fixtures for a simulated prototype. They do not describe real incidents or confirmed emergency resources.

## 2. Contract Design Principles

### 2.1 Unknown is not zero

Missing information must be represented explicitly.

- Use `null` when a numeric value is unknown or unreported.
- Use `0` only when zero is explicitly established by reliable evidence or a validated calculation.
- Use an empty list when no entries are recorded in that list; do not interpret it automatically as proof that no relevant events or needs exist.
- Use explicit status fields to distinguish unreported, unknown, approximate, and verified information.

For example, if a report does not mention injured people, `people_injured` must be `null`, not `0`.

### 2.2 Evidence and provenance

Every material factual claim extracted from a report should be traceable to a source reference. Evidence excerpts must come from the actual source text rather than being invented by the model.

Inventory recommendations must identify the inventory snapshot, its source type, and the time it was checked.

### 2.3 Separate reported facts from verified facts

A report can state that an event occurred without proving that the event occurred. Data contracts must preserve this distinction.

### 2.4 Deterministic validation

Pydantic models and ordinary application code validate field types, enumerations, constraints, references, and business rules. A language model's assertion that its output is valid is not sufficient.

### 2.5 Human approval is enforced outside the model

A field such as `requires_human_approval: true` communicates a requirement, but it does not enforce it. The backend must control review states and prevent unauthorized external actions.

## 3. Shared Enumerations

Use explicit enumerations rather than unrestricted strings for fields with a known set of valid values.

| Field | Allowed values |
|---|---|
| `disaster_type` | `earthquake`, `flood`, `landslide`, `fire`, `storm`, `other`, `unknown` |
| `verification_status` | `unverified`, `partially_verified`, `verified` |
| `source_type` | `simulated`, `human_report`, `official_source`, `sensor`, `other` |
| Evidence confidence | `reported_not_verified`, `corroborated`, `verified`, `uncertain` |
| Uncertainty status | `known`, `unknown`, `approximate`, `conflicting`, `not_reported` |
| Processing status | `submitted`, `processing`, `completed`, `needs_clarification`, `failed` |
| Review status | `pending_review`, `approved`, `edited_pending_review`, `rejected` |
| Agent execution status | `success`, `needs_review`, `failed` |
| Resource-plan status | `proposed`, `needs_review`, `infeasible`, `blocked` |
| Message-draft status | `pending_review`, `approved`, `rejected` |

The list of disaster types is an initial prototype vocabulary, not an exhaustive emergency taxonomy. Expand it through documented changes when necessary.

**Verification rule:** `verified` must be assigned only by an authorized verification process with recorded supporting evidence. A model must not independently promote a report to verified.

## 4. Evidence Contract

Evidence records link a claim to its supporting source.

```json
{
  "source_reference": "REP-DEMO-001",
  "field": "people_trapped",
  "source_excerpt": "Twelve people are reported trapped.",
  "confidence": "reported_not_verified"
}
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `source_reference` | Non-empty string | Identifier of the source report or record |
| `field` | Non-empty string | Field or claim supported by the evidence |
| `source_excerpt` | Non-empty string | Short excerpt copied from the source |
| `confidence` | Enumeration | Evidence or verification status of the claim |

Rules:

- The backend must confirm that `source_reference` refers to an existing, accessible record.
- Evidence excerpts must match the source text or an explicitly recorded normalized representation.
- An excerpt stating that twelve people are reported trapped supports the fact that the report made that claim; it does not independently prove the number is correct.
- Model-generated explanations are not source evidence.
- If a claim has no adequate evidence, mark it uncertain or unsupported rather than fabricating a citation.

## 5. Incident Contract

### 5.1 Canonical incident object

The incident object is Scout's primary structured output and the shared factual record used by downstream agents.

```json
{
  "incident_id": "SHK-DEMO-001",
  "report_id": "REP-DEMO-001",
  "disaster_type": "landslide",
  "location_text": "Example settlement, Nepal",
  "reported_at": "2026-10-13T10:30:00+05:45",
  "incident_time": null,
  "severity": "high",
  "people_injured": null,
  "people_trapped": 12,
  "source_type": "simulated",
  "verification_status": "unverified",
  "missing_information": [
    "road_access_status",
    "people_injured"
  ],
  "uncertainties": [
    {
      "field": "people_injured",
      "status": "not_reported",
      "reason": "The source report does not state an injury count."
    },
    {
      "field": "location_text",
      "status": "approximate",
      "reason": "The source does not provide verified coordinates."
    }
  ],
  "evidence": [
    {
      "source_reference": "REP-DEMO-001",
      "field": "disaster_type",
      "source_excerpt": "A landslide was reported near the example settlement.",
      "confidence": "reported_not_verified"
    },
    {
      "source_reference": "REP-DEMO-001",
      "field": "people_trapped",
      "source_excerpt": "Twelve people are reported trapped.",
      "confidence": "reported_not_verified"
    }
  ]
}
```

This fixture assumes a fictional report containing the quoted statements. The incident and the stated count are not real.

### 5.2 Field definitions

| Field | Type | Required | Rules |
|---|---|---|---|
| `incident_id` | String | Yes | Stable application-generated identifier |
| `report_id` | String | Yes | Identifier of the source report |
| `disaster_type` | Enumeration | Yes | Use `unknown` if the type cannot be determined |
| `location_text` | String or `null` | Yes | Preserve reported wording; do not invent precision |
| `reported_at` | Datetime | Yes | Time the report was received or recorded, not necessarily when the disaster began |
| `incident_time` | Datetime or `null` | Yes | Time of the incident, if supported by the source |
| `severity` | `low`, `medium`, `high`, `critical`, `unknown` | Yes | Must follow documented criteria and available evidence |
| `people_injured` | Non-negative integer or `null` | Yes | Unknown or unreported counts are `null` |
| `people_trapped` | Non-negative integer or `null` | Yes | Unknown or unreported counts are `null` |
| `source_type` | Enumeration | Yes | Identifies the actual source category |
| `verification_status` | Enumeration | Yes | Must follow the verification process |
| `missing_information` | List of strings | Yes | Fields or facts needed but not available |
| `uncertainties` | List of uncertainty records | Yes | Records ambiguous, unknown, conflicting, or approximate fields |
| `evidence` | List of evidence records | Yes | Supporting references for extracted claims |

### 5.3 Timestamp rules

Use timezone-aware ISO 8601 timestamps.

Examples:

- Nepal local time: `2026-10-13T10:30:00+05:45`
- UTC: `2026-10-13T04:45:00Z`

The backend must normalize timestamps consistently when storing or comparing them. Never assume that `reported_at` is the time the disaster began.

### 5.4 Severity rules

Severity is not an arbitrary model-generated label.

Define a documented classification policy using available indicators, such as reported structural damage, access disruption, immediate threats, or confirmed casualties. If the available information is insufficient to classify severity, use `unknown`.

For the prototype, any rules that map report details to severity must be explicit, version-controlled, and evaluated against labeled examples.

## 6. Uncertainty Contract

```json
{
  "field": "road_access_status",
  "status": "unknown",
  "reason": "The report does not describe road access.",
  "requires_clarification": true
}
```

Required fields:

- `field`: the affected field.
- `status`: one of `known`, `unknown`, `approximate`, `conflicting`, or `not_reported`.
- `reason`: a concise explanation.
- `requires_clarification`: whether clarification is required before a dependent decision can proceed.

The orchestrator may use this information to stop a workflow stage, request clarification, or flag the package for review.

Unknown information must remain unknown unless new evidence is provided. Downstream agents must not silently fill missing values with guesses.

## 7. Resource Inventory Contract

Inventory data must identify its source and the time at which it was recorded.

```json
{
  "inventory_snapshot_id": "INV-SNAPSHOT-DEMO-001",
  "inventory_source": "sample_csv",
  "source_type": "simulated",
  "inventory_checked_at": "2026-10-13T10:35:00+05:45",
  "resources": [
    {
      "resource_id": "WATER-DEMO-001",
      "resource_type": "drinking_water",
      "available_quantity": 100,
      "unit": "bottles",
      "location_text": "Simulated warehouse A",
      "status": "available"
    }
  ]
}
```

### Resource inventory fields

| Field | Type | Rules |
|---|---|---|
| `inventory_snapshot_id` | String | Unique identifier for the snapshot |
| `inventory_source` | String | Identifies the dataset or service |
| `source_type` | Enumeration | Distinguishes simulated from real source data |
| `inventory_checked_at` | Datetime | Time the snapshot was retrieved or checked |
| `resource_id` | String | Stable identifier for the inventory item |
| `resource_type` | String or controlled enumeration | Resource category |
| `available_quantity` | Non-negative number | Must be calculated from the authoritative inventory record |
| `unit` | String | Explicit unit, such as `bottles`, `kits`, or `liters` |
| `location_text` | String or `null` | Known inventory location, if available |
| `status` | Enumeration | Such as `available`, `unavailable`, or `unknown` |

A simulated inventory record must never be presented as verified real-world availability.

For real inventory integrations, the schema should additionally account for reservations, damaged or expired stock, eligibility, storage location, and other operational constraints.

## 8. Resource Plan Contract

Logistics produces a proposed resource plan based on a validated incident and a specific inventory snapshot.

### 8.1 Example

```json
{
  "plan_id": "PLAN-DEMO-001",
  "incident_id": "SHK-DEMO-001",
  "inventory_snapshot_id": "INV-SNAPSHOT-DEMO-001",
  "inventory_source": "sample_csv",
  "inventory_checked_at": "2026-10-13T10:35:00+05:45",
  "recommendations": [
    {
      "resource_type": "drinking_water",
      "requested_quantity": null,
      "available_quantity": 100,
      "proposed_quantity": null,
      "shortfall_quantity": null,
      "unit": "bottles",
      "planning_assumptions": [
        "Drinking water may be relevant to the reported incident.",
        "The number of affected people is unknown.",
        "Demand cannot yet be quantified."
      ],
      "validation_status": "needs_review",
      "requires_human_approval": true
    }
  ],
  "plan_status": "needs_review",
  "dispatch_status": "not_dispatched",
  "requires_human_approval": true
}
```

The values are illustrative. In particular, the example does not establish that 100 bottles are available in the real world.

### 8.2 Field definitions

| Field | Type | Rules |
|---|---|---|
| `plan_id` | String | Unique plan identifier |
| `incident_id` | String | Must reference an existing incident |
| `inventory_snapshot_id` | String | Must reference the snapshot used |
| `inventory_source` | String | Source name or identifier |
| `inventory_checked_at` | Datetime | Snapshot retrieval/check time |
| `resource_type` | String or enumeration | Resource category |
| `requested_quantity` | Non-negative number or `null` | Quantity required; `null` if demand is unknown |
| `available_quantity` | Non-negative number or `null` | Eligible quantity; `null` if availability is unknown |
| `proposed_quantity` | Non-negative number or `null` | Quantity proposed by the plan |
| `shortfall_quantity` | Non-negative number or `null` | Computed shortage, when demand and availability are known |
| `unit` | String | Required when a quantity is specified |
| `planning_assumptions` | List of strings | Explicit assumptions used to interpret the need |
| `validation_status` | Enumeration | Such as `valid`, `needs_review`, or `infeasible` |
| `requires_human_approval` | Boolean | Whether human approval is required |
| `plan_status` | Enumeration | `proposed`, `needs_review`, `infeasible`, or `blocked` |
| `dispatch_status` | Enumeration | Initially `not_dispatched`; never imply dispatch without a separate authorized system |

### 8.3 Resource calculation rules

For compatible units and valid inputs:

`shortfall_quantity = max(0, requested_quantity - available_quantity)`

A proposed quantity must never exceed eligible available stock.

If demand is unknown, `requested_quantity` should be `null`. Unless demand can be determined from a documented policy, the system should not fabricate a proposed quantity or a shortage.

The deterministic inventory service—not the language model—must calculate authoritative quantities and enforce stock constraints.

## 9. Communications Contract

Communications consumes a validated incident record, a resource plan, and audience requirements.

### 9.1 Example

```json
{
  "incident_id": "SHK-DEMO-001",
  "drafts": [
    {
      "draft_id": "DRAFT-DEMO-EN-001",
      "language": "en",
      "audience": "operational_coordinator",
      "message_type": "coordination_alert",
      "body": "A landslide has been reported near the example settlement. Twelve people are reported trapped, but the information has not been independently verified. Please verify the location, road access, and immediate needs.",
      "supporting_source_references": [
        "REP-DEMO-001"
      ],
      "warnings": [
        "Incident unverified",
        "Road access unknown"
      ],
      "status": "pending_review"
    },
    {
      "draft_id": "DRAFT-DEMO-NE-001",
      "language": "ne",
      "audience": "public",
      "message_type": "public_sms",
      "body": "उदाहरण बस्ती नजिक पहिरो गएको भन्ने सूचना प्राप्त भएको छ। १२ जना पुरिएको भन्ने विवरणको स्वतन्त्र पुष्टि भएको छैन। कृपया आधिकारिक निकायबाट प्राप्त सूचनालाई प्राथमिकता दिनुहोस्।",
      "supporting_source_references": [
        "REP-DEMO-001"
      ],
      "warnings": [
        "Incident unverified",
        "Nepali wording requires human review"
      ],
      "status": "pending_review"
    }
  ],
  "delivery_status": "not_sent",
  "requires_human_approval": true
}
```

This is a fictional example. The Nepali wording must be reviewed for suitability before operational use. A public message should include only information necessary for its audience and should not expose unnecessary personal or sensitive details.

### 9.2 Draft fields

| Field | Type | Rules |
|---|---|---|
| `draft_id` | String | Unique identifier |
| `language` | String | Use documented language codes, such as `en` and `ne` |
| `audience` | Enumeration | Such as `operational_coordinator` or `public` |
| `message_type` | Enumeration | Such as `coordination_alert` or `public_sms` |
| `body` | String | Non-empty editable message |
| `supporting_source_references` | List of strings | References that support the message's factual claims |
| `warnings` | List of strings | Uncertainty, verification, or review warnings |
| `status` | Enumeration | Initially `pending_review` |

`delivery_status` is application-managed. For this prototype it must remain `not_sent`, because message generation does not authorize external delivery.

## 10. Workflow and Review Contract

Processing status and review status represent different dimensions.

### 10.1 Workflow record

```json
{
  "incident_id": "SHK-DEMO-001",
  "run_id": "RUN-DEMO-001",
  "processing_status": "completed",
  "review_status": "pending_review",
  "current_stage": "human_review",
  "requires_human_approval": true,
  "created_at": "2026-10-13T10:30:00+05:45",
  "updated_at": "2026-10-13T10:36:00+05:45"
}
```

A processing status of `completed` means that the configured processing stages finished; it does not mean that the incident was verified or that the response package was approved.

### 10.2 Review decision record

```json
{
  "decision_id": "DECISION-DEMO-001",
  "incident_id": "SHK-DEMO-001",
  "response_package_version": 1,
  "decision": "rejected",
  "reviewer_id": "REVIEWER-DEMO-001",
  "decided_at": "2026-10-13T10:40:00+05:45",
  "comments": "Confirm the reported location and road access before reconsidering."
}
```

This is an illustrative fixture, not a real review. The application must authorize the reviewer and generate the timestamp and decision identifier.

Allowed decisions are:

- `approved`
- `edited_pending_review`
- `rejected`

An approval applies only to the exact response-package version reviewed. Editing an approved package must invalidate its previous approval until the revised version is reviewed.

Approval must not automatically dispatch resources or broadcast messages.

## 11. Pydantic Validation

Use Pydantic models to define the canonical contracts in code. The models should reject invalid enumerations, malformed timestamps, negative quantities, missing required fields, and unexpected fields where strictness is appropriate.

Recommended implementation location:

```text
schemas/
├── common.py
├── evidence.py
├── incident.py
├── inventory.py
├── resource_plan.py
├── communications.py
└── workflow.py
```

These are proposed file names. They should be created as part of implementation.

### Example: common models and incident schema

The following is an initial implementation pattern for Pydantic v2:

```python
from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import (
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


NonEmptyString = Annotated[str, Field(min_length=1, strip_whitespace=True)]


class StrictModel(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )


class DisasterType(str, Enum):
    EARTHQUAKE = "earthquake"
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    FIRE = "fire"
    STORM = "storm"
    OTHER = "other"
    UNKNOWN = "unknown"


class VerificationStatus(str, Enum):
    UNVERIFIED = "unverified"
    PARTIALLY_VERIFIED = "partially_verified"
    VERIFIED = "verified"


class SourceType(str, Enum):
    SIMULATED = "simulated"
    HUMAN_REPORT = "human_report"
    OFFICIAL_SOURCE = "official_source"
    SENSOR = "sensor"
    OTHER = "other"


class EvidenceConfidence(str, Enum):
    REPORTED_NOT_VERIFIED = "reported_not_verified"
    CORROBORATED = "corroborated"
    VERIFIED = "verified"
    UNCERTAIN = "uncertain"


class UncertaintyStatus(str, Enum):
    KNOWN = "known"
    UNKNOWN = "unknown"
    APPROXIMATE = "approximate"
    CONFLICTING = "conflicting"
    NOT_REPORTED = "not_reported"


class Evidence(StrictModel):
    source_reference: NonEmptyString
    field: NonEmptyString
    source_excerpt: NonEmptyString
    confidence: EvidenceConfidence


class Uncertainty(StrictModel):
    field: NonEmptyString
    status: UncertaintyStatus
    reason: NonEmptyString


class Incident(StrictModel):
    incident_id: NonEmptyString
    report_id: NonEmptyString
    disaster_type: DisasterType
    location_text: str | None
    reported_at: AwareDatetime
    incident_time: AwareDatetime | None = None
    severity: str
    people_injured: int | None = Field(default=None, ge=0)
    people_trapped: int | None = Field(default=None, ge=0)
    source_type: SourceType
    verification_status: VerificationStatus
    missing_information: list[NonEmptyString]
    uncertainties: list[Uncertainty]
    evidence: list[Evidence]

    @model_validator(mode="after")
    def validate_unknown_counts(self):
        # Unknown values remain None, not zero.
        # Cross-field evidence and source checks are performed
        # by the application validation service.
        return self
```

This is a starting point, not the complete contract implementation. Before production use, refine severity into an enumeration, define the complete uncertainty policy, and implement cross-field validation against actual source records.

The application must not trust a model-provided `confidence` or `verification_status` blindly. Validate these values against source evidence and the authorized verification process.

## 12. Invalid Output and Bounded Retries

Every agent response must pass through a deterministic validation boundary.

Recommended flow:

1. Validate the input before calling the agent.
2. Request output in the expected structured format.
3. Parse the response and validate it against the appropriate Pydantic model.
4. If validation fails, perform at most two configured correction attempts after the initial attempt.
5. Pass validation errors to the correction step without exposing secrets or unnecessary sensitive data.
6. Validate the corrected output from scratch.
7. If all attempts fail, mark the stage as `failed` or `needs_review`, depending on whether safe recovery is possible.
8. Record the failure and show a clear status to the reviewer.
9. Do not pass invalid output to the next agent.

The retry limit should be configurable. Retrying does not make invalid output trustworthy; the final attempt must pass the same validation rules.

### Example validation wrapper

```python
import json
from typing import TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


def parse_and_validate(
    raw_output: str,
    model: type[T],
) -> T:
    try:
        payload = json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise ValueError("Agent returned invalid JSON.") from exc

    try:
        return model.model_validate(payload)
    except ValidationError as exc:
        raise ValueError(
            "Agent output failed schema validation."
        ) from exc
```

The wrapper deliberately validates one response rather than implementing a retry loop. Retry orchestration belongs in the workflow layer so attempts, timeouts, provider errors, and final failure states can be recorded consistently.

Do not expose raw internal exception details or sensitive input text to end users. Show a clear message such as:

> The agent returned output that did not meet the required data contract. The workflow has stopped this stage. Please retry or review the incident manually.

## 13. Cross-Field Business Rules

Pydantic field validation is necessary but not sufficient. Add application-level checks for rules that depend on multiple fields or external records.

At minimum:

1. Every incident `report_id` must refer to an existing source report.
2. Every evidence `source_reference` must refer to an accessible source.
3. Every evidence excerpt must be checked against the original source text.
4. A missing count must not be converted into zero.
5. A `verified` status requires an authorized verification event.
6. Every resource plan must reference the inventory snapshot used to calculate its quantities.
7. Resource quantities must use compatible units.
8. Proposed quantities must not exceed eligible available stock.
9. Unknown demand or availability must not be represented as a confirmed numeric value.
10. A response package cannot be approved unless the authorized reviewer approves the exact version.
11. Editing a package must invalidate approval of the prior version.
12. External sending or dispatching must remain blocked unless a separate authorized integration is implemented.

## 14. Contract Versioning

Add an explicit contract version to persisted records and, where practical, to agent response envelopes.

Example:

```json
{
  "contract_version": "1.0.0",
  "incident_id": "SHK-DEMO-001"
}
```

Use semantic versioning as a guideline:

- **Major:** incompatible changes to fields, types, meanings, or required validation rules.
- **Minor:** backward-compatible additions.
- **Patch:** clarifications or compatible validation fixes.

When a schema changes, update the corresponding documentation, test fixtures, validators, and evaluation cases together.

## 15. Contract Testing

Create tests for valid examples, invalid values, missing information, evidence integrity, and cross-field rules.

| Test case | Expected result |
|---|---|
| Valid incident fixture | Accepted |
| Negative injury count | Rejected |
| Missing required incident ID | Rejected |
| Naive timestamp without timezone | Rejected |
| Unknown injury count represented by `null` | Accepted |
| Unknown injury count represented by `0` without evidence | Must fail the applicable business-rule validation |
| Unsupported verification status | Rejected |
| Evidence references nonexistent report | Rejected by application validation |
| Resource allocation exceeds available stock | Rejected |
| Unknown demand converted to an invented quantity | Rejected or flagged |
| Invalid JSON from an agent | Bounded retry, then controlled failure |
| Edited package retains prior approval | Rejected by review-state validation |
| Simulated inventory described as confirmed real stock | Rejected by policy/evaluation checks |

A numeric zero can be legitimate when supported by evidence. Therefore, zero must not be rejected universally; tests should check the evidence and business rules relevant to the field.

## 16. Definition of Done

The data-contract layer is ready for agent integration when:

- Canonical Pydantic models exist for incidents, evidence, inventory, resource plans, communications drafts, and workflow/review records.
- Required fields, nullability, enumerations, and constraints are documented.
- Timezone-aware timestamps are enforced.
- Source references and evidence excerpts are validated.
- Unknown values remain distinct from zero.
- Inventory calculations and allocation constraints are deterministic.
- Invalid model output is rejected and handled through bounded retries.
- Contract and cross-field tests pass.
- Contract versions and validation failures can be traced.
- Human approval and external-action restrictions are enforced in application code.

**Status:** This document defines the intended contracts and an initial Pydantic implementation pattern. The contracts must be implemented, tested, and versioned before the agents are connected to the live workflow.
