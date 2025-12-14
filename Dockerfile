FROM python:3.10-slim

# Install system dependencies required for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY ai_detection/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy the rest of the application
COPY ai_detection/ ai_detection/
COPY ai_detection/model ai_detection/model

# Expose the port Render will use
ENV PORT=10000
EXPOSE 10000

# Run the application
CMD gunicorn -b 0.0.0.0:$PORT ai_detection.api_server:app
