from pydantic import AwareDatetime, Field
from app.schemas.common import (
    StrictModel,
    NonEmptyString,
    DisasterType,
    VerificationStatus,
    SourceType,
    SeverityLevel,
    Uncertainty,
    Evidence,
)

class Incident(StrictModel):
    """Structured incident extracted from a source report.

    This schema represents reported information. It does not independently
    verify that a disaster occurred or that reported counts are accurate.
    """

    incident_id: NonEmptyString
    report_id: NonEmptyString

    disaster_type: DisasterType
    location_text: NonEmptyString | None = None

    reported_at: AwareDatetime
    incident_time: AwareDatetime | None = None

    severity: SeverityLevel = SeverityLevel.UNKNOWN

    people_injured: int | None = Field(default=None, ge=0)
    people_trapped: int | None = Field(default=None, ge=0)

    # Supply this from trusted report metadata where possible.
    source_type: SourceType

    # Extracted reports remain unverified unless verification is supported
    # by an appropriate source and review process.
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED

    missing_information: list[NonEmptyString] = Field(default_factory=list)
    uncertainties: list[Uncertainty] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)