from enum import Enum
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field

# NonEmptyString = Annotated[str, Field(min_length=1, strip_whitespace=True)]
# NonEmptyString = Annotated[str, Field(min_length=1)]
NonEmptyString = Annotated[str, Field(min_length=1)]

class StrictModel(BaseModel):
    """Base model that forbids unmapped fields."""

    # model_config = ConfigDict(
    #     extra="forbid"
    # )
    pass


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
    source_reference: NonEmptyString
    field: NonEmptyString
    source_excerpt: NonEmptyString
    confidence: EvidenceConfidence


class Uncertainty(StrictModel):
    field: NonEmptyString
    status: UncertaintyStatus
    reason: NonEmptyString
    requires_clarification: bool = False