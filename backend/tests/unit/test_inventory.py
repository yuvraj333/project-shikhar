import pytest
from app.services.inventory import InventoryService

def test_deterministic_shortfall_calculation():
    """
    Ensures the InventoryService mathematically calculates shortfalls
    correctly, preventing the LLM from hallucinating numbers.
    """
    # Initialize service with our mock JSON
    service = InventoryService(filepath="fixtures/inventory.json")
    
    # Test Case 1: We have enough water (500 available, 100 requested)
    water_check = service.check_availability("drinking_water", 100)
    assert water_check["available_quantity"] == 500
    assert water_check["shortfall_quantity"] == 0
    
    # Test Case 2: We don't have enough tents (0 available, 5 requested)
    tent_check = service.check_availability("tents", 5)
    assert tent_check["available_quantity"] == 0
    assert tent_check["shortfall_quantity"] == 5
    
    # Test Case 3: Resource doesn't exist
    unknown_check = service.check_availability("helicopters", 1)
    assert unknown_check["status"] == "not_found"
    assert unknown_check["shortfall_quantity"] == 1