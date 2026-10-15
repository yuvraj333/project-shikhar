from typing import List
from .common import StrictModel, NonEmptyString

class MessageDraft(StrictModel):
    draft_id: NonEmptyString
    language: NonEmptyString # "en" or "ne"
    audience: NonEmptyString
    message_type: NonEmptyString
    body: NonEmptyString
    supporting_source_references: List[str]
    warnings: List[str]
    status: NonEmptyString = "pending_review"

class CommunicationPackage(StrictModel):
    incident_id: NonEmptyString
    drafts: List[MessageDraft]
    delivery_status: NonEmptyString = "not_sent"
    requires_human_approval: bool = True