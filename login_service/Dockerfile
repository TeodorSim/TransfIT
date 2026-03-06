# Use Python base image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements from the code folder
COPY backend_services/backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual code from the backend_services folder
COPY backend_services/ .

# 3. FIX: Tell Python to look in the current folder ( /app ) for modules
ENV PYTHONPATH=/app/backend

# Command to run your app (adjust 'main.py' to your entry point)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8002"]
