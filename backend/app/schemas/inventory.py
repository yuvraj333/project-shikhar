from enum import Enum
from pydantic import AwareDatetime, Field, model_validator
from app.schemas.common import StrictModel, NonEmptyString, SourceType

class InventoryStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
class InventoryResource(StrictModel):
    """A resource entry from one inventory snapshot."""
    resource_id: NonEmptyString
    resource_type: NonEmptyString
    available_quantity: int = Field(ge=0)
    unit: NonEmptyString
    location_text: NonEmptyString | None = None
    status: InventoryStatus = InventoryStatus.AVAILABLE
    
    @model_validator(mode="after")
    def validate_status_and_quantity(self):
        if (
            self.status == InventoryStatus.UNAVAILABLE
            and self.available_quantity != 0
        ):
            raise ValueError(
                "An unavailable resource must have zero available quantity."
            )
        return self

class InventorySnapshot(StrictModel):
    """A timestamped inventory snapshot used for deterministic lookups."""
    inventory_snapshot_id: NonEmptyString
    inventory_source: NonEmptyString
    source_type: SourceType
    inventory_checked_at: AwareDatetime
    resources: list[InventoryResource] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_unique_resources(self):
        resource_ids = [
            resource.resource_id for resource in self.resources
        ]
        resource_types = [
            resource.resource_type for resource in self.resources
        ]
        if len(resource_ids) != len(set(resource_ids)):
            raise ValueError("Inventory resource IDs must be unique.")
        normalized_types = [
            resource_type.strip().lower()
            for resource_type in resource_types
        ]
        if len(normalized_types) != len(set(normalized_types)):
            raise ValueError(
                "This inventory schema currently supports only one entry "
                "per resource type."
            )
        return self
        
