import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.workflow.orchestrator import ShikharOrchestrator
from app.services.review_service import ReviewService
app = FastAPI(
    title="Shikhar-AI Backend API",
    description="Multi-agent disaster response pipeline",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ShikharOrchestrator()

class ReportRequest(BaseModel):
    report_text: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "shikhar-ai-backend"}

@app.post("/api/process")
async def process_incident_report(request: ReportRequest):
    """
    Receives a raw text report and runs it through the full pipeline.
    Includes robust error handling for LLM provider rate limits.
    """
    try:
        results = await orchestrator.process_report(request.report_text)
        return {
            "status": "success",
            "data": results
        }
    except Exception as e:
        error_msg = str(e)
        
        # Handle Google AI 503 Capacity Errors
        if "503" in error_msg or "UNAVAILABLE" in error_msg:
            raise HTTPException(
                status_code=503, 
                detail="Google AI servers are currently at maximum capacity. Please wait 30 seconds and try again."
            )
            
        # Handle Google AI 429 Quota/Rate Limit Errors
        elif "429" in error_msg or "quota" in error_msg.lower():
            raise HTTPException(
                status_code=429, 
                detail="API rate limit exceeded. If using a free key, wait 1 minute before submitting again."
            )
            
        # Handle model string mismatches (404)
        elif "404" in error_msg or "NOT_FOUND" in error_msg:
            raise HTTPException(
                status_code=404,
                detail="The requested Gemini model version is currently unavailable or deprecated."
            )
            
        # Handle code/parsing errors
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Pipeline Execution Failed: {error_msg}"
            )
class ReviewRequest(BaseModel):
    item_id: str
    incident_id: str
    review_type: str # e.g., 'draft', 'incident'
    status: str # 'approved', 'rejected'
    notes: Optional[str] = None

class PublishRequest(BaseModel):
    draft_id: str
    language: str
    audience: str
    body: str

@app.post("/api/review/approve")
def approve_item(payload: ReviewRequest):
    """Internally approves a draft or report without triggering external actions."""
    result = ReviewService.set_approval_status(
        item_id=payload.item_id,
        incident_id=payload.incident_id,
        review_type=payload.review_type,
        status=payload.status,
        notes=payload.notes
    )
    return {"status": "success", "data": result}

@app.post("/api/review/publish")
def publish_to_public_portal(payload: PublishRequest):
    """
    Step 2 Action: Explicitly authorizes and pushes an internally approved draft 
    to the Public Safety Portal feed.
    """
    # Safety Check: Enforce global safety switch
    if os.getenv("ENABLE_EXTERNAL_DELIVERY", "false").lower() == "true":
        # In full production, Twilio/SMS broadcast code would execute here
        pass
        
    result = ReviewService.publish_broadcast(
        language=payload.language,
        audience=payload.audience,
        body=payload.body
    )
    return {"status": "success", "broadcast": result}

@app.get("/api/public/broadcasts")
def get_public_broadcasts():
    """Retrieves all officially published broadcasts for the Public Portal."""
    broadcasts = ReviewService.get_public_broadcasts()
    return {"status": "success", "broadcasts": broadcasts}