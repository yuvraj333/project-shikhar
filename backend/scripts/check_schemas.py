
from datetime import datetime, timezone
import json
from pathlib import Path

from pydantic import ValidationError

from app.schemas.common import SourceType
from app.schemas.incident import Incident
from app.schemas.response_plan import (
    ResponsePlan,
    ResourceRecommendation,
)
from app.schemas.communications import (
    CommunicationPackage,
    MessageDraft,
)
from app.schemas.inventory import InventorySnapshot


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "fixtures" / "inventory.json"
NOW = datetime.now(timezone.utc)

passed = 0
failed = 0


def check(name, test):
    """Run one test and report its result."""
    global passed, failed

    try:
        test()
        passed += 1
        print(f"PASS: {name}")
    except Exception as exc:
        failed += 1
        print(f"FAIL: {name}")
        print(f"      {type(exc).__name__}: {exc}")


def must_reject(model, data):
    """Assert that invalid data raises a Pydantic ValidationError."""
    try:
        model.model_validate(data)
    except ValidationError:
        return

    raise AssertionError(
        f"{model.__name__} accepted invalid data when rejection was expected."
    )


def load_inventory_fixture():
    """Load the inventory fixture or raise a useful error."""
    if not FIXTURE.is_file():
        raise FileNotFoundError(f"Inventory fixture not found: {FIXTURE}")

    try:
        return json.loads(FIXTURE.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Inventory fixture contains invalid JSON: {FIXTURE}"
        ) from exc


def valid_incident_data():
    return {
        "incident_id": "INC-001",
        "report_id": "REP-001",
        "disaster_type": "landslide",
        "reported_at": NOW,
        "source_type": SourceType.SIMULATED,
    }


def valid_recommendation_data(**overrides):
    data = {
        "resource_type": "tents",
        "requested_quantity": 5,
        "available_quantity": 0,
        "proposed_quantity": 0,
        "shortfall_quantity": 5,
        "unit": "units",
        "planning_assumptions": ["Test assumption"],
    }
    data.update(overrides)
    return data


# ---------------------------------------------------------------------
# Incident schema tests
# ---------------------------------------------------------------------

def test_incident_unknown_counts():
    incident = Incident.model_validate(valid_incident_data())

    assert incident.people_trapped is None
    assert incident.people_injured is None
    assert incident.verification_status.value == "unverified"


def test_incident_negative_count_rejected():
    data = valid_incident_data()
    data["people_trapped"] = -1

    must_reject(Incident, data)


def test_incident_requires_source_type():
    data = valid_incident_data()
    del data["source_type"]

    must_reject(Incident, data)


def test_extra_fields_rejected():
    data = valid_incident_data()
    data["invented_fact"] = "unsupported"

    must_reject(Incident, data)


# ---------------------------------------------------------------------
# Resource recommendation tests
# ---------------------------------------------------------------------

def test_resource_shortfall_consistent():
    item = ResourceRecommendation.model_validate(
        valid_recommendation_data()
    )

    assert item.shortfall_quantity == 5


def test_incorrect_shortfall_rejected():
    must_reject(
        ResourceRecommendation,
        valid_recommendation_data(shortfall_quantity=0),
    )


def test_unknown_stock_stays_unknown():
    item = ResourceRecommendation.model_validate(
        valid_recommendation_data(
            requested_quantity=10,
            available_quantity=None,
            proposed_quantity=None,
            shortfall_quantity=None,
            unit="unknown",
        )
    )

    assert item.available_quantity is None
    assert item.shortfall_quantity is None


def test_unknown_stock_with_proposal_rejected():
    must_reject(
        ResourceRecommendation,
        valid_recommendation_data(
            available_quantity=None,
            proposed_quantity=5,
            shortfall_quantity=None,
        ),
    )


def test_proposal_cannot_exceed_stock():
    must_reject(
        ResourceRecommendation,
        valid_recommendation_data(
            requested_quantity=10,
            available_quantity=3,
            proposed_quantity=4,
            shortfall_quantity=7,
        ),
    )


def test_negative_quantity_rejected():
    must_reject(
        ResourceRecommendation,
        valid_recommendation_data(requested_quantity=-1),
    )


# ---------------------------------------------------------------------
# Communications schema tests
# ---------------------------------------------------------------------

def test_communication_draft_defaults():
    draft = MessageDraft(
        draft_id="DRAFT-001",
        language="ne",
        audience="Public",
        message_type="safety_notice",
        body="कृपया आधिकारिक सूचनाको पालना गर्नुहोस्।",
    )

    assert draft.status.value == "pending_review"


def test_invalid_language_rejected():
    must_reject(
        MessageDraft,
        {
            "draft_id": "DRAFT-002",
            "language": "fr",
            "audience": "Public",
            "message_type": "notice",
            "body": "Test message",
        },
    )


def test_blank_message_rejected():
    must_reject(
        MessageDraft,
        {
            "draft_id": "DRAFT-003",
            "language": "ne",
            "audience": "Public",
            "message_type": "notice",
            "body": "   ",
        },
    )


def test_communication_cannot_be_marked_sent():
    must_reject(
        CommunicationPackage,
        {
            "incident_id": "INC-001",
            "drafts": [],
            "delivery_status": "sent",
            "requires_human_approval": True,
        },
    )


# ---------------------------------------------------------------------
# Response plan tests
# ---------------------------------------------------------------------

def test_response_plan_defaults():
    plan = ResponsePlan(
        plan_id="PLAN-001",
        incident_id="INC-001",
        inventory_snapshot_id="INV-001",
        recommendations=[],
    )

    assert plan.dispatch_status == "not_dispatched"
    assert plan.requires_human_approval is True
    assert plan.plan_status.value == "needs_review"


# ---------------------------------------------------------------------
# Inventory schema tests
# ---------------------------------------------------------------------

def test_inventory_fixture_validates():
    data = load_inventory_fixture()
    snapshot = InventorySnapshot.model_validate(data)

    assert len(snapshot.resources) > 0
    assert (
        snapshot.inventory_snapshot_id
        == data["inventory_snapshot_id"]
    )


def test_inventory_duplicate_resource_type_rejected():
    data = load_inventory_fixture()

    duplicate = dict(data["resources"][0])
    duplicate["resource_id"] = "DUPLICATE-001"

    # Deliberately retain the same resource_type.
    data["resources"].append(duplicate)

    must_reject(InventorySnapshot, data)


def test_unavailable_inventory_with_stock_rejected():
    data = load_inventory_fixture()

    item = dict(data["resources"][0])
    item["resource_id"] = "TEST-UNAVAILABLE"
    item["resource_type"] = "test_resource"
    item["status"] = "unavailable"
    item["available_quantity"] = 5

    # Isolate the invalid record to test status/quantity consistency.
    data["resources"] = [item]

    # The schema must reject unavailable stock with a non-zero quantity.
    must_reject(InventorySnapshot, data)


# ---------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------

TESTS = [
    ("Incident preserves unknown counts", test_incident_unknown_counts),
    ("Negative incident count rejected", test_incident_negative_count_rejected),
    ("Incident requires source type", test_incident_requires_source_type),
    ("Unexpected incident fields rejected", test_extra_fields_rejected),
    ("Resource shortfall consistency", test_resource_shortfall_consistent),
    ("Incorrect shortfall rejected", test_incorrect_shortfall_rejected),
    ("Unknown stock remains unknown", test_unknown_stock_stays_unknown),
    ("Proposal with unknown stock rejected", test_unknown_stock_with_proposal_rejected),
    ("Proposal exceeding stock rejected", test_proposal_cannot_exceed_stock),
    ("Negative resource quantity rejected", test_negative_quantity_rejected),
    ("Communication draft defaults", test_communication_draft_defaults),
    ("Invalid language rejected", test_invalid_language_rejected),
    ("Blank communication rejected", test_blank_message_rejected),
    ("Sending status rejected", test_communication_cannot_be_marked_sent),
    ("Response plan defaults", test_response_plan_defaults),
    ("Inventory fixture validates", test_inventory_fixture_validates),
    ("Duplicate inventory type rejected", test_inventory_duplicate_resource_type_rejected),
    ("Unavailable inventory with stock rejected", test_unavailable_inventory_with_stock_rejected),
]


if __name__ == "__main__":
    print("Running Shikhar-AI schema tests...\n")

    for name, test in TESTS:
        check(name, test)

    total = len(TESTS)

    print(f"\nResults: {passed} passed, {failed} failed, {total} total")

    if failed:
        raise SystemExit(1)

    print("All schema tests passed.")
