from pydantic import Field
from typing import List
from .common import StrictModel, NonEmptyString

class ResourceRecommendation(StrictModel):
    resource_type: NonEmptyString
    requested_quantity: int | None
    available_quantity: int | None
    proposed_quantity: int | None
    shortfall_quantity: int | None
    unit: NonEmptyString
    planning_assumptions: List[str]
    validation_status: NonEmptyString = "needs_review"

class ResponsePlan(StrictModel):
    plan_id: NonEmptyString
    incident_id: NonEmptyString
    inventory_snapshot_id: NonEmptyString
    recommendations: List[ResourceRecommendation]
    plan_status: NonEmptyString = "needs_review"
    dispatch_status: NonEmptyString = "not_dispatched"
    requires_human_approval: bool = True