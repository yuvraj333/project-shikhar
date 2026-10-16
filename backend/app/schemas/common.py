from enum import Enum
from typing import Annotated
# from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic import BaseModel, ConfigDict,Field, field_validator, model_validator

NonEmptyString = Annotated[str, Field(min_length=1)]

class StrictModel(BaseModel):
    """Base model for validated Shikhar-AI data contracts."""

    model_config = ConfigDict(
        validate_assignment=True,
        validate_default=True,
    )

    @field_validator("*", mode="before")
    @classmethod
    def strip_string_values(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @model_validator(mode="before")
    @classmethod
    def reject_extra_fields(cls, data):
        if isinstance(data, dict):
            extra = set(data) - set(cls.model_fields)
            if extra:
                raise ValueError(
                    f"Extra fields are not permitted: {sorted(extra)}"
                )
        return data

# class StrictModel(BaseModel):
#     """Base model for validated Shikhar-AI data contracts."""

#     model_config = ConfigDict(
#         extra="forbid",
#         str_strip_whitespace=True,
#         validate_assignment=True,
#         validate_default=True,
#     )

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

class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class Evidence(StrictModel):
    """Evidence connecting an extracted claim to its source."""

    source_reference: NonEmptyString
    field: NonEmptyString
    source_excerpt: NonEmptyString
    confidence: EvidenceConfidence

class Uncertainty(StrictModel):
    """An explicit record of missing, approximate, or conflicting information."""

    field: NonEmptyString
    status: UncertaintyStatus
    reason: NonEmptyString
    requires_clarification: bool = False