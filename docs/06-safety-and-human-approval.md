# Safety and Human Approval

## 1. Purpose

This document defines the safety controls, human-review requirements, privacy protections, and operational boundaries of Shikhar-AI.

Shikhar-AI is an experimental, human-supervised, multi-agent disaster-response decision-support prototype. It transforms simulated incident reports into structured information, proposed resource plans, and draft emergency communications.

The prototype is not an operational emergency dispatch system. Its outputs must not be treated as independently verified emergency intelligence, official public warnings, or authorization to deploy resources.

## 2. Safety Principles

The following principles apply throughout the system:

1. **Human authority:** Authorized humans retain responsibility for consequential decisions.
2. **Evidence before assertion:** Important claims must be traceable to their sources.
3. **Explicit uncertainty:** Unknown, conflicting, approximate, and unverified information must remain distinguishable.
4. **No autonomous external actions:** The prototype must not independently dispatch resources or publish emergency messages.
5. **Privacy by design:** Collect, retain, and display only information necessary for the intended coordination task.
6. **Fail safely:** Invalid outputs, missing dependencies, and failed validations must not bypass safety checks.
7. **Transparent limitations:** Demonstrations must clearly identify simulated data and unsupported operational capabilities.
8. **Auditable decisions:** Human review decisions and response-package changes must be recorded.

## 3. Information Classification and Verification

### 3.1 Required distinctions

Shikhar-AI must distinguish the following information categories:

| Category | Meaning | Required handling |
|---|---|---|
| Simulated | Created for development, testing, or demonstration | Display a clear simulation label |
| Reported | Stated by a source but not independently verified | Preserve the source and original wording |
| Unverified | Not independently confirmed | Do not present as established fact |
| Partially verified | Some details have supporting verification, while others remain uncertain | Identify which fields are supported and which are not |
| Verified | Confirmed through an authorized verification process with recorded evidence | Preserve verification provenance and timestamp |

These categories describe different dimensions. For example, a simulated report may contain a clearly specified fictional fact, but it is not evidence of a real-world incident.

### 3.2 Verification rules

- The language model must not independently mark an incident as verified.
- Verification status must be assigned or changed only through a documented, authorized process.
- A successful schema validation does not establish factual accuracy.
- Multiple reports repeating the same original claim do not necessarily constitute independent corroboration.
- Verification must be recorded at the appropriate field or claim level when different parts of a report have different evidence quality.
- When verification is unavailable, retain the unverified status.

## 4. Evidence and Source Preservation

For every important incident claim, the system should retain:

- Source report identifier.
- Original wording or a relevant source excerpt.
- Extracted or normalized value.
- Associated field name.
- Verification or uncertainty status.
- Source type.
- Report timestamp, when available.
- Any documented correction or verification event.

### 4.1 Source integrity

The original report must remain available as a read-only source record to authorized users. Agent-generated summaries must not overwrite it.

If an extracted location differs from the original wording, both should be retained. For example, an approximate location must not silently become a precise coordinate.

### 4.2 Unsupported claims

When the system cannot associate an important claim with adequate evidence, it must flag the claim, omit it from consequential outputs, or require human review.

The model must not generate fictional citations or evidence excerpts.

## 5. Missing and Conflicting Information

Missing or conflicting information must be visible in the response package rather than hidden inside model prompts or logs.

The dashboard should prominently display:

- Unknown casualty counts.
- Approximate or ambiguous locations.
- Missing road-access information.
- Unconfirmed incident severity.
- Conflicting reports.
- Unknown resource availability.
- Stale inventory timestamps.
- Unresolved assumptions that could affect a recommendation.

### 5.1 Conflicting reports

When two reports disagree:

1. Preserve both original reports.
2. Record the conflicting claims and their source references.
3. Do not silently choose one claim as correct.
4. Mark the affected fields as conflicting.
5. Flag the response package for review when the conflict affects a consequential decision.
6. Allow an authorized reviewer to record a resolution and its supporting evidence.

A newer report must not automatically override an older report unless a documented policy justifies that decision.

### 5.2 Clarification

When missing information prevents safe or meaningful planning, the workflow must pause the affected stage or mark the package as requiring clarification.

The system may prepare a clarification request, but it must not invent the missing information to complete the workflow.

## 6. Human Approval and Review Workflow

### 6.1 Required workflow

Every generated response package must pass through the following stages:

1. The backend validates the submitted incident report.
2. Scout extracts incident facts and uncertainty.
3. The backend validates Scout's output and source references.
4. Logistics prepares a proposed resource plan using validated inventory results.
5. Deterministic application code validates resource quantities and constraints.
6. Communications generates editable English and Nepali message drafts.
7. The backend validates the response package and persists it as pending review.
8. An authorized human inspects the evidence, uncertainties, recommendations, and drafts.
9. The reviewer approves, edits, rejects, or requests clarification.
10. The backend records the decision and preserves the relevant package version.

If a required validation fails, the system must not silently proceed as if the stage succeeded.

### 6.2 Review decisions

| Decision | Meaning | System behavior |
|---|---|---|
| Approve | Reviewer accepts the specific response-package version | Record approval and retain the approved version |
| Edit | Reviewer changes the content | Save a new version and require review of that version |
| Reject | Reviewer declines the proposed package or draft | Record the rejection and reason, when provided |
| Request clarification | Essential information is missing or conflicting | Return the workflow to the appropriate clarification stage |

Approval means only that the reviewer approved the specified content within the prototype's workflow. It does not mean the incident has been independently verified or that external action is authorized.

### 6.3 Approval enforcement

Approval must be enforced by backend application logic, not by relying on a model prompt.

The backend must:

- Authenticate reviewers.
- Authorize review actions.
- Validate the current review state.
- Associate the decision with the exact response-package version.
- Record the decision timestamp.
- Reject unauthorized or invalid state transitions.
- Invalidate previous approval when approved content is edited.
- Prevent sending or dispatching through the prototype.

A button labeled “Approve” must not trigger an external operation.

## 7. Audit Trail

The prototype must record important workflow and review events.

An audit event should contain:

| Field | Purpose |
|---|---|
| `event_id` | Unique audit-event identifier |
| `incident_id` | Associated incident |
| `run_id` | Workflow execution identifier |
| `response_package_version` | Version involved in the event, if applicable |
| `actor_type` | `system` or `human` |
| `actor_id` | Authenticated reviewer identifier for human actions, where appropriate |
| `event_type` | Submission, validation, edit, approval, rejection, failure, or other defined event |
| `timestamp` | Server-generated timestamp |
| `details` | Minimal relevant event information |

Record who approved, edited, or rejected each draft or response package, along with the timestamp and version.

Audit records must be protected against unauthorized modification. Access must be restricted to authorized users.

Avoid logging secrets, authentication tokens, unnecessary personal data, or entire sensitive reports when a smaller event record is sufficient.

## 8. Privacy and Personal Information

Disaster reports may contain sensitive personal information, including names, contact details, medical information, or details about vulnerable individuals.

Shikhar-AI must follow data-minimization principles:

- Collect only information needed for the prototype's defined purpose.
- Avoid requesting names or identifying details unless necessary for an explicitly defined and authorized workflow.
- Restrict access to source reports and sensitive fields.
- Exclude unnecessary personal data from public-facing message drafts.
- Avoid copying sensitive details into model prompts when they are not needed.
- Use synthetic personal information in demonstrations.
- Define data retention and deletion rules before handling real personal data.
- Keep credentials and API keys out of reports, prompts, source control, and logs.

The prototype must not claim legal or regulatory compliance without an appropriate assessment.

## 9. Prompt Injection and Untrusted Input

Incident reports, uploaded documents, and external source content must be treated as untrusted data.

A report may contain text attempting to override agent instructions, fabricate evidence, disclose secrets, or bypass approval.

Controls include:

1. Keep agent system instructions separate from report content.
2. Explicitly instruct agents to treat report text as data rather than instructions.
3. Validate all structured model outputs.
4. Restrict agent tools to the minimum necessary permissions.
5. Keep authorization and approval decisions outside the language model.
6. Prevent report text from directly invoking tools or changing workflow states.
7. Include adversarial examples in the evaluation suite.
8. Reject unsupported claims even when the report explicitly requests the model to invent them.

Prompt instructions alone are insufficient. These controls must be backed by deterministic validation and permission checks.

## 10. Resource and Communication Boundaries

### 10.1 Resource planning

The prototype may generate resource recommendations based on sample inventory data.

It must not:

- Treat mock inventory as real-world availability.
- Claim that resources have been reserved or dispatched without an authorized integration confirming the action.
- Allow model-generated quantities to bypass deterministic inventory constraints.
- Automatically allocate real-world supplies.

### 10.2 Emergency communications

The prototype may generate editable message drafts.

It must not:

- Automatically publish emergency alerts.
- Automatically send SMS messages or emails.
- Broadcast messages to the public.
- Impersonate government agencies or emergency services.
- Present unverified information as an official warning.

Any future integration for real communications or dispatch would require a separate authorization model, operational validation, and documented safety assessment.

## 11. Demo and Interface Safety

All demonstration scenarios and sample inventory must be labeled clearly.

Recommended labels include:

- `SIMULATED INCIDENT`
- `UNVERIFIED REPORT`
- `MOCK INVENTORY — NOT REAL STOCK`
- `AI-GENERATED DRAFT — HUMAN REVIEW REQUIRED`
- `NOT SENT`
- `NOT DISPATCHED`

Labels must appear in the dashboard and relevant exported demo artifacts, not only in the documentation.

Use fictional locations and synthetic personal information. Avoid implying that a real emergency is occurring.

### Required disclaimer

Display the following statement in the demo interface and README:

> **Shikhar-AI is an experimental decision-support prototype, not an operational emergency dispatch system. Its reports, inventory, recommendations, and messages may be simulated or unverified. It does not automatically dispatch resources or publish emergency alerts. It must not replace official emergency information or established emergency-response procedures.**

In a real emergency, users should follow instructions from authorized emergency-response authorities.

## 12. Safety Testing

Safety controls must be tested, not merely documented.

Required tests include:

- Unverified claims remain labeled unverified.
- Missing casualty counts remain unknown rather than being converted to zero.
- Conflicting reports remain visible.
- Mock inventory cannot be presented as confirmed real stock.
- Invalid allocations are rejected.
- Public drafts omit unnecessary personal data.
- Prompt-injection text cannot bypass validation or authorization.
- Unauthorized users cannot approve drafts.
- Edited content invalidates approval of the previous version.
- Rejected drafts cannot be marked approved without a new authorized review.
- The prototype cannot automatically send messages or dispatch resources.
- Failed validation blocks unsafe downstream progression.

Record the test results in `docs/07-evaluation-and-testing.md`.

## 13. Incident Handling and Safety Failures

If a safety control fails:

1. Stop the affected workflow stage.
2. Prevent the affected output from being approved or used downstream.
3. Record the failure without unnecessarily exposing sensitive data.
4. Mark the response package as failed or requiring review.
5. Allow an authorized developer or reviewer to investigate.
6. Add a regression test before considering the issue resolved.

Do not silently discard safety failures or report a successful workflow when a required control was bypassed.

## 14. Definition of Done

The safety and human-approval implementation is ready for prototype evaluation when:

- Simulated, reported, unverified, and verified information is distinguishable.
- Important claims retain source references and original wording.
- Missing and conflicting information is visible.
- Human review and version-specific approval are enforced by backend code.
- Reviewer decisions and timestamps are recorded.
- Mock inventory and fictional scenarios are labeled throughout the demo.
- Personal information is minimized and access is restricted.
- Prompt-injection tests cannot bypass authorization or validation.
- No automatic dispatch or message broadcasting is possible.
- The prototype disclaimer is visible.
- Safety tests have documented results.

**Status:** This document defines the intended safety controls. A control must not be described as implemented until its code and corresponding tests exist.
