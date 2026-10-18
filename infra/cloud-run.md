# Infrastructure & Deployment Guide (Google Cloud Run)

Shikhar-AI uses a serverless, containerized architecture deployed on **Google Cloud Run** to ensure high reliability, zero downtime during emergency traffic surges, and low operational overhead.

---

## Architecture Overview

The platform is split into two independent containerized services:
1. **Frontend Service (Next.js):** Handles the user interface, public safety portal, and operator command dashboard.
2. **Backend Service (FastAPI):** Manages asynchronous API endpoints, SQLite database operations, and the Google Gemini multi-agent reasoning pipeline.

---

## Deployment Steps

### Prerequisites
* [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk) installed and authenticated.
* [Docker](https://www.docker.com/) installed locally.
* A GCP Project with billing enabled and the **Cloud Run** and **Artifact Registry** APIs enabled.

---

### 1. Build & Push Backend (FastAPI)
Navigate to your backend directory or root where the backend Dockerfile is located, then build and push the image to Google Artifact Registry:

```bash
# Set your variables
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"

# Build container image
docker build -t gcr.io/$PROJECT_ID/shikhar-backend:latest -f Dockerfile.backend .

# Push to Google Cloud Container/Artifact Registry
docker push gcr.io/$PROJECT_ID/shikhar-backend:latest

```

### 2. Deploy Backend to Cloud Run

```bash
gcloud run deploy shikhar-backend \
  --image gcr.io/$PROJECT_ID/shikhar-backend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your_gemini_api_key_here"

```

---

### 3. Build & Push Frontend (Next.js)

Update your frontend environment configuration to point to your deployed backend Cloud Run URL, then build and push:

```bash
# Build frontend container image
docker build -t gcr.io/$PROJECT_ID/shikhar-frontend:latest -f Dockerfile.frontend .

# Push image
docker push gcr.io/$PROJECT_ID/shikhar-frontend:latest

```

### 4. Deploy Frontend to Cloud Run

```bash
gcloud run deploy shikhar-frontend \
  --image gcr.io/$PROJECT_ID/shikhar-frontend:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL="https://shikhar-backend-<random-hash>.a.run.app"

```

---

## Environment Variables

Ensure the following variables are securely injected during Cloud Run deployment or configured via GCP Secret Manager:

* `GEMINI_API_KEY`: Google Gemini API key for running the Scout, Logistics, and Communication multi-agent workflows.
* `NEXT_PUBLIC_API_URL`: Public HTTPS endpoint URL of the deployed FastAPI backend.

```
