import json
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agents.scout import get_scout_agent
from app.agents.logistics import get_logistics_agent
from app.agents.communications import get_communications_agent
from app.services.inventory import InventoryService

from app.schemas.incident import Incident
from app.schemas.response_plan import ResponsePlan
from app.schemas.communications import CommunicationPackage

class ShikharOrchestrator:
    def __init__(self):
        self.session_service = InMemorySessionService()
        self.inventory_service = InventoryService()
        
        self.scout_agent = get_scout_agent()
        self.logistics_agent = get_logistics_agent()
        self.comms_agent = get_communications_agent()

    async def _extract_json(self, runner, session, prompt: str) -> str:
        """Helper to run an agent and clean markdown tags from JSON outputs."""
        content = types.Content(role='user', parts=[types.Part(text=prompt)])
        events = runner.run_async(
            session_id=session.id,
            user_id=session.user_id,
            new_message=content
        )
        result = ""
        async for event in events:
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        result += part.text
                        
        # Strip markdown formatting so Pydantic can parse it cleanly
        return result.strip().removeprefix("```json").removesuffix("```").strip()

    async def process_report(self, report_text: str, user_id: str = "demo_user") -> dict:
        session = await self.session_service.create_session(
            state={}, 
            app_name="shikhar_app", 
            user_id=user_id
        )

        # Scout Stage: Extract Incident
        scout_runner = Runner(agent=self.scout_agent, app_name="shikhar_app", session_service=self.session_service)
        scout_json = await self._extract_json(scout_runner, session, report_text)
        incident = Incident.model_validate_json(scout_json)

        # Logistics Stage: Apply Deterministic Math + LLM Planning
        inventory_snapshot = json.dumps(self.inventory_service._inventory_data)
        logistics_prompt = f"Validated Incident:\n{incident.model_dump_json()}\n\nInventory Availability:\n{inventory_snapshot}"
        
        logistics_runner = Runner(agent=self.logistics_agent, app_name="shikhar_app", session_service=self.session_service)
        logistics_json = await self._extract_json(logistics_runner, session, logistics_prompt)
        response_plan = ResponsePlan.model_validate_json(logistics_json)

        # Communications Stage: Draft Messages
        comms_prompt = f"Validated Incident:\n{incident.model_dump_json()}\n\nResponse Plan:\n{response_plan.model_dump_json()}"
        
        comms_runner = Runner(agent=self.comms_agent, app_name="shikhar_app", session_service=self.session_service)
        comms_json = await self._extract_json(comms_runner, session, comms_prompt)
        communications = CommunicationPackage.model_validate_json(comms_json)

        # Return the final package ready for human review
        return {
            "incident": incident.model_dump(),
            "response_plan": response_plan.model_dump(),
            "communications": communications.model_dump()
        }