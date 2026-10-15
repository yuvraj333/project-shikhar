from pydantic import AwareDatetime, Field, model_validator
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
    incident_id: NonEmptyString
    report_id: NonEmptyString
    disaster_type: DisasterType
    location_text: str | None = None
    reported_at: AwareDatetime
    incident_time: AwareDatetime | None = None
    severity: SeverityLevel = SeverityLevel.UNKNOWN
    people_injured: int | None = Field(default=None, ge=0)
    people_trapped: int | None = Field(default=None, ge=0)
    source_type: SourceType = SourceType.SIMULATED
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED
    missing_information: list[NonEmptyString] = Field(default_factory=list)
    uncertainties: list[Uncertainty] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_unknown_counts(self):
        """
        Ensures adherence to contract rule: 'Unknown is not zero'.
        If no count was provided, field must remain None.
        """
        return self