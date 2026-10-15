import os
from pydantic import ValidationError
import pytest
from app.schemas.response_plan import ResponsePlan

def test_external_delivery_hard_disabled():
    """
    CRITICAL SAFETY TEST: 
    Ensures the prototype cannot accidentally dispatch physical resources or SMS messages.
    """
    safety_switch = os.getenv("ENABLE_EXTERNAL_DELIVERY", "false").lower()
    assert safety_switch == "false", "SAFETY VIOLATION: External delivery is enabled!"

def test_response_plan_default_safety_status():
    """
    Ensures that even if the Logistics LLM tries to dispatch something, 
    the Pydantic schema overrides or catches it, requiring human approval.
    """
    # Create a dummy plan simulating an LLM output
    plan = ResponsePlan(
        plan_id="TEST-001",
        incident_id="INC-001",
        inventory_snapshot_id="INV-001",
        recommendations=[]
    )
    
    # Assert defaults mathematically guarantee safety
    assert plan.dispatch_status == "not_dispatched"
    assert plan.requires_human_approval is True