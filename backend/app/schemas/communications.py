from enum import Enum
from typing import Literal
from pydantic import Field
from app.schemas.common import StrictModel, NonEmptyString

class DraftStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class MessageDraft(StrictModel):
    """A communication draft prepared for human review."""

    draft_id: NonEmptyString
    language: Literal["en", "ne"]
    audience: NonEmptyString
    message_type: NonEmptyString
    body: NonEmptyString
    supporting_source_references: list[NonEmptyString] = Field(
        default_factory=list
    )
    warnings: list[NonEmptyString] = Field(default_factory=list)
    status: DraftStatus = DraftStatus.PENDING_REVIEW

class CommunicationPackage(StrictModel):
    """Draft messages associated with one incident."""
    incident_id: NonEmptyString
    drafts: list[MessageDraft] = Field(default_factory=list)
    # Shikhar-AI currently prepares drafts but does not deliver them.
    delivery_status: Literal["not_sent"] = "not_sent"

    # Messages must go through human review before any external use.
    requires_human_approval: bool = True