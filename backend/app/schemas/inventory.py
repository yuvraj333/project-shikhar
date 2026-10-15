from typing import List
from pydantic import AwareDatetime, Field
from app.schemas.common import StrictModel, NonEmptyString, SourceType


class InventoryResource(StrictModel):
    resource_id: NonEmptyString
    resource_type: NonEmptyString
    available_quantity: int = Field(ge=0)
    unit: NonEmptyString
    location_text: str | None = None
    status: NonEmptyString = "available"


class InventorySnapshot(StrictModel):
    inventory_snapshot_id: NonEmptyString
    inventory_source: NonEmptyString
    source_type: SourceType = SourceType.SIMULATED
    inventory_checked_at: AwareDatetime
    resources: List[InventoryResource] = Field(default_factory=list)