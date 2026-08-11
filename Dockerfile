# Stage 1: Build the React application
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Package the FastAPI application
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./backend

# Copy the built React app from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/dist ./frontend/dist

# Expose port
EXPOSE 8001

# Run backend application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8001"]
