from google.adk.agents import Agent
from app.schemas.incident import Incident

def get_scout_agent() -> Agent:
    """
    Scout: Incident Intelligence
    Extracts facts from unstructured text and enforces uncertainty rules.
    """
    return Agent(
        name="ScoutAgent",
        model="gemini-3.5-flash-lite",
        instruction="""
        You are Scout, the Incident Intelligence agent in Shikhar-AI.
        Extract incident information from the supplied report without adding facts that are not supported by the source.
        
        RULES:
        1. Preserve the original wording of locations when necessary.
        2. Distinguish reported facts from interpretations. Do not invent casualty counts, coordinates, or verification status.
        3. If information is missing (like trapped counts), return null. Do NOT assume 0.
        4. Provide an exact quote in the 'source_excerpt' field for every claim.
        5. Mark verification_status as 'unverified' unless explicitly stated otherwise by an official source.
        """,
        output_schema=Incident
    )