# JurisQBank

JurisQBank is a platform for ... (Add project description here).

## Architecture
The project is divided into two main parts:
- **Client**: Next.js (TypeScript) frontend.
- **Server**: Django (Python) backend.
- **Infrastructure**: Docker Compose (PostgreSQL, Redis, MinIO).

## Prerequisites
- Docker & Docker Compose
- Python 3.13+ (Django 6.0 support only in Python 3.13+)
- Node.js & pnpm

## Quick Start

1.  **Setup Environment Variables**:
    ```bash
    cp .env.example .env
    # Edit .env with your credentials if needed
    ```

2.  **Start Infrastructure Services**:
    ```bash
    docker compose up -d
    ```
    This starts PostgreSQL, Redis, and MinIO.

3.  **Backend Setup**:
    See [server/README.md](server/README.md).

4.  **Frontend Setup**:
    See [client/README.md](client/README.md).

5.  **Testing**:
    See [tests/README.md](tests/README.md).

## Services Info
- **Postgres**: Port `5432`
- **Redis**: Port `6379`
- **MinIO Console**: `http://localhost:9001`
- **MinIO API**: `http://localhost:9000`
- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`
