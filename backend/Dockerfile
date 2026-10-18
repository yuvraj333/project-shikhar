FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Force Linux security updates to clear the vulnerability warning
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Prevent Python from writing pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy dependency list first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application
COPY . .

# Expose port 8080 (Cloud Run standard port)
EXPOSE 8080

# Command to run FastAPI using the dynamic PORT environment variable provided by Cloud Run
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]