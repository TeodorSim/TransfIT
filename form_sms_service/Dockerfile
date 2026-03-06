FROM python:3.11-slim

WORKDIR /app

# Copy requirements from the form_sms code folder
COPY form_sms/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the code from the form_sms folder
COPY form_sms/ .

# Adjust to your actual entry point script
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
