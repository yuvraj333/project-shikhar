import json
import os
from typing import Dict, Any, Optional

class InventoryService:
    def __init__(self, filepath: str = "fixtures/inventory.json"):
        self.filepath = filepath
        self._inventory_data = self._load_inventory()

    def _load_inventory(self) -> Dict[str, Any]:
        if not os.path.exists(self.filepath):
            raise FileNotFoundError(f"Inventory file not found: {self.filepath}")
        with open(self.filepath, "r") as f:
            return json.load(f)

    def check_availability(self, resource_type: str, requested_quantity: Optional[int] = None) -> Dict[str, Any]:
        """Deterministically checks inventory and calculates shortfalls."""
        resources = self._inventory_data.get("resources", [])
        
        # Find the resource by type
        item = next((r for r in resources if r["resource_type"] == resource_type), None)
        
        if not item:
            return {
                "resource_type": resource_type,
                "available_quantity": 0,
                "requested_quantity": requested_quantity,
                "shortfall_quantity": requested_quantity if requested_quantity else 0,
                "unit": "unknown",
                "status": "not_found",
                "inventory_snapshot_id": self._inventory_data["inventory_snapshot_id"]
            }

        available = item["available_quantity"]
        shortfall = max(0, requested_quantity - available) if requested_quantity is not None else None

        return {
            "resource_type": resource_type,
            "available_quantity": available,
            "requested_quantity": requested_quantity,
            "shortfall_quantity": shortfall,
            "unit": item["unit"],
            "status": item["status"],
            "inventory_snapshot_id": self._inventory_data["inventory_snapshot_id"]
        }