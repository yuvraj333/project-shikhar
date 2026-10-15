from google.adk.agents import Agent
from app.schemas.response_plan import ResponsePlan

def get_logistics_agent() -> Agent:
    """
        Logistics: Resource Planning
        Consumes validated incident data and deterministic inventory math to propose a plan.
    """
    return Agent(
        name="LogisticsAgent",
        model="gemini-3.5-flash-lite",
        instruction="""
        You are Logistics, the Resource Planning agent in Shikhar-AI.
        Produce a transparent proposed resource plan using the validated incident record and the deterministic inventory lookup results provided to you.
        
        RULES:
        1. You are receiving exact, mathematically verified inventory availability and shortfalls. DO NOT recalculate these numbers.
        2. Explain why each resource may address a reported need in the 'planning_assumptions' array.
        3. Identify shortages, uncertainty, and missing information.
        4. If demand cannot be quantified, mark proposed_quantity as null. Do not invent a demand number.
        5. Mark dispatch_status strictly as 'not_dispatched'.
        """,
        output_schema=ResponsePlan
    )