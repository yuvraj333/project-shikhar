# Contributing to Shikhar-AI

First off, thank you for your interest in contributing to **Shikhar-AI**! Whether it's bug fixes, feature implementations, documentation improvements, or local testing, your help is deeply appreciated.

---

## Tech Stack Overview
Before diving in, make sure you are familiar with our core stack:
* **Frontend:** Next.js (React / TypeScript)
* **Backend:** FastAPI (Python)
* **Database & Storage:** Embedded SQLite
* **AI & Multi-Agent Engine:** Google Gemini API (Flash models)
* **Containerization:** Docker & Docker Compose

---

## Getting Started

### 1. Fork and Clone the Repository
```bash
git clone [https://github.com/yuvraj333/project-shikhar.git](https://github.com/yuvraj333/project-shikhar.git)
cd project-shikhar

```

### 2. Environment Setup

Create your local environment variables file based on the required credentials (e.g., Gemini API keys).

```bash
cp .env.example .env
# Add your GEMINI_API_KEY and other configurations inside .env

```

### 3. Running with Docker (Recommended)

The easiest way to run the full stack locally is via Docker Compose:

```bash
docker-compose up --build

```

* **Frontend UI:** `http://localhost:3000`
* **FastAPI Docs:** `http://localhost:8000/docs`

---

## How to Contribute

1. **Find an Issue:** Look through open issues or create a new issue to discuss proposed changes or bug reports.
2. **Create a Branch:** Name your branch descriptively following git-flow conventions:
* `feature/your-feature-name`
* `bugfix/issue-description`


3. **Commit Changes:** Write clear, concise commit messages.
* `git commit -m "feat: add IoT telemetry ingestion agent"`


4. **Push to Your Fork:**
* `git push origin feature/your-feature-name`


5. **Open a Pull Request:** Submit your PR against the `main` branch with a clear description of the problem solved or feature added.

---

## Code Style Guidelines

* **Python (FastAPI):** Follow PEP 8 guidelines. Keep asynchronous endpoints clean and ensure proper type hinting.
* **TypeScript (Next.js):** Maintain strict type checking and follow functional component patterns with Tailwind CSS styling.
* **Commit Etiquette:** Use prefix keywords where possible (`feat:`, `fix:`, `docs:`, `refactor:`).

---

## Code of Conduct

Please be respectful, collaborative, and inclusive. Shikhar-AI is built for critical emergency response; code quality, safety guardrails, and reliability are our top priorities.

Thank you for helping make disaster response faster and smarter!
