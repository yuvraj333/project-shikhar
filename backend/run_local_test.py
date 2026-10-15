import json
import asyncio
from dotenv import load_dotenv
from google.genai import types
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from app.agents.scout import get_scout_agent

load_dotenv()

async def main():
    session_service = InMemorySessionService()
    scout_agent = get_scout_agent()
    
    # FIX: Pass the agent directly to the Runner
    runner = Runner(agent=scout_agent, app_name="shikhar_test", session_service=session_service)
    print("Scout Agent initialized successfully.")

    with open("fixtures/test_reports.json", "r") as f:
        reports = json.load(f)
        
    test_report = reports[0]["report_text"]
    print(f"\n--- Processing Report ---\n{test_report}\n")

    session = await session_service.create_session(
        state={}, 
        app_name="shikhar_test", 
        user_id="local_tester",
        session_id="test_session_001"
    )

    print("[1/3] Running Scout Agent...")
    content = types.Content(role='user', parts=[types.Part(text=test_report)])
    
    scout_events = runner.run_async(
        session_id=session.id,
        user_id=session.user_id,
        new_message=content
    )
    
    scout_result = ""
    async for event in scout_events:
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    scout_result += part.text

    print(f"\nScout JSON Output:\n{scout_result}")

if __name__ == "__main__":
    asyncio.run(main())