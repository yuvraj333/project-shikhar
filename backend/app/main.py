from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.workflow.orchestrator import ShikharOrchestrator

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