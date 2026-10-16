import json
from pathlib import Path
from typing import Any
from pydantic import ValidationError
from app.schemas.inventory import InventorySnapshot

class InventoryService:
    """Deterministic inventory lookup and shortfall calculation.
    Loads and validates a timestamped inventory snapshot. All quantity
    calculations are performed by Python, not by an LLM.
    Missing inventory is treated as unknown, never as zero.
    """

    def __init__(
        self,
        filepath: str | Path = "fixtures/inventory.json",
    ) -> None:
        self.filepath = Path(filepath)
        self._snapshot = self._load_inventory()

    def _load_inventory(self) -> InventorySnapshot:
        """Load and validate the complete inventory snapshot."""

        if not self.filepath.is_file():
            raise FileNotFoundError(
                f"Inventory file not found: {self.filepath}"
            )
        try:
            with self.filepath.open("r", encoding="utf-8") as file:
                data = json.load(file)
        except json.JSONDecodeError as exc:
            raise ValueError(
                f"Invalid JSON in inventory file: {self.filepath}"
            ) from exc
        try:
            return InventorySnapshot.model_validate(data)
        except ValidationError as exc:
            raise ValueError(
                f"Inventory snapshot failed schema validation: "
                f"{self.filepath}\n{exc}"
            ) from exc
        
    @property
    def snapshot(self) -> InventorySnapshot:
        """Return the validated inventory snapshot."""
        return self._snapshot

    def check_availability(
        self,
        resource_type: str,
        requested_quantity: int | None = None,
    ) -> dict[str, Any]:
        """Return validated inventory information and a known shortfall.
        Unknown resource:
            available_quantity=None
            shortfall_quantity=None
        Unknown demand:
            requested_quantity=None
            shortfall_quantity=None
        Known demand and stock:
            shortfall_quantity=max(0, demand - available stock)
        """
        if not isinstance(resource_type, str) or not resource_type.strip():
            raise ValueError("resource_type must be a non-empty string.")
        if requested_quantity is not None:
            if isinstance(requested_quantity, bool) or not isinstance(
                requested_quantity, int
            ):
                raise ValueError(
                    "requested_quantity must be a non-negative integer "
                    "or None."
                )
            if requested_quantity < 0:
                raise ValueError(
                    "requested_quantity cannot be negative."
                )
        normalized_type = resource_type.strip().lower()
        item = next(
            (
                resource
                for resource in self._snapshot.resources
                if resource.resource_type.strip().lower()
                == normalized_type
            ),
            None,
        )
        snapshot = self._snapshot
        common = {
            "resource_type": normalized_type,
            "requested_quantity": requested_quantity,
            "inventory_snapshot_id": snapshot.inventory_snapshot_id,
            "inventory_source": snapshot.inventory_source,
            "inventory_checked_at": snapshot.inventory_checked_at.isoformat(),
            "source_type": snapshot.source_type.value,
        }
        # No matching inventory record means stock is unknown.
        if item is None:
            return {
                **common,
                "available_quantity": None,
                "shortfall_quantity": None,
                "unit": "unknown",
                "status": "not_found",
                "location_text": None,
                "resource_id": None,
            }
        available = item.available_quantity
        shortfall = (
            max(0, requested_quantity - available)
            if requested_quantity is not None
            else None
        )
        return {
            **common,
            "resource_type": item.resource_type,
            "available_quantity": available,
            "shortfall_quantity": shortfall,
            "unit": item.unit,
            "status": item.status.value,
            "location_text": item.location_text,
            "resource_id": item.resource_id,
        }
