from enum import Enum
from typing import Literal
from pydantic import Field, model_validator
from app.schemas.common import StrictModel, NonEmptyString

class PlanStatus(str, Enum):
    DRAFT = "draft"
    NEEDS_REVIEW = "needs_review"
    APPROVED = "approved"
    REJECTED = "rejected"

class ValidationStatus(str, Enum):
    NEEDS_REVIEW = "needs_review"
    BLOCKED = "blocked"
    UNKNOWN = "unknown"

class ResourceRecommendation(StrictModel):
    """A proposed resource allocation, not a dispatch instruction."""
    resource_type: NonEmptyString
    requested_quantity: int | None = Field(default=None, ge=0)
    available_quantity: int | None = Field(default=None, ge=0)
    proposed_quantity: int | None = Field(default=None, ge=0)
    shortfall_quantity: int | None = Field(default=None, ge=0)
    unit: NonEmptyString
    planning_assumptions: list[NonEmptyString] = Field(default_factory=list)
    validation_status: ValidationStatus = ValidationStatus.NEEDS_REVIEW
    @model_validator(mode="after")
    def validate_resource_quantities(self):
        """Ensure quantities are internally consistent.
        Unknown inventory is not zero inventory.
        Unknown demand does not imply zero demand.
        """
        # A shortfall can be calculated only when demand and available stock
        # are both known.
        if (
            self.requested_quantity is None
            or self.available_quantity is None
        ):
            if self.shortfall_quantity is not None:
                raise ValueError(
                    "shortfall_quantity must be None when demand or "
                    "available inventory is unknown."
                )
        else:
            expected_shortfall = max(
                0,
                self.requested_quantity - self.available_quantity,
            )
            if self.shortfall_quantity != expected_shortfall:
                raise ValueError(
                    "shortfall_quantity does not match requested quantity "
                    "and available inventory."
                )
        # Do not propose a concrete allocation when stock is unknown.
        if (
            self.proposed_quantity is not None
            and self.available_quantity is None
        ):
            raise ValueError(
                "proposed_quantity must be None when available inventory "
                "is unknown."
            )
        # A proposed allocation must not exceed known stock.
        if (
            self.proposed_quantity is not None
            and self.available_quantity is not None
            and self.proposed_quantity > self.available_quantity
        ):
            raise ValueError(
                "proposed_quantity cannot exceed available_quantity."
            )

        return self

class ResponsePlan(StrictModel):
    """Human-reviewable resource plan for a reported incident."""
    plan_id: NonEmptyString
    incident_id: NonEmptyString
    inventory_snapshot_id: NonEmptyString
    recommendations: list[ResourceRecommendation] = Field(
        default_factory=list
    )
    plan_status: PlanStatus = PlanStatus.NEEDS_REVIEW
    # This prototype records recommendations only; it does not dispatch.
    dispatch_status: Literal["not_dispatched"] = "not_dispatched"

    # Approval remains part of the workflow for every generated plan.
    requires_human_approval: bool = True