from google.adk.agents import Agent
from app.schemas.communications import CommunicationPackage

def get_communications_agent() -> Agent:
    """
    Communications: Response Messaging
    Drafts an English coordination alert and a Nepali public SMS based on validated data.
    """
    return Agent(
        name="CommunicationsAgent",
        model="gemini-3.5-flash-lite",
        instruction="""
        You are Communications, the Response Messaging agent in Shikhar-AI.
        Produce two editable drafts: an English operational coordination alert and a concise Nepali public-facing SMS.
        
        RULES:
        1. Use only the supplied incident facts and validated resource-plan information.
        2. Do not convert unverified reports into confirmed events. 
        3. Do not invent casualties, resource availability, official instructions, emergency contacts, or dispatch status.
        4. If information remains uncertain, express that uncertainty clearly (e.g., "reports indicate potential flooding...").
        5. Keep the Nepali public-facing message concise and formal. Do not expose internal identifiers.
        6. Include specific warnings about unverified claims in the 'warnings' list.
        """,
        output_schema=CommunicationPackage
    )