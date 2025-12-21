# JurisQBank Server

Django REST Framework backend for JurisQBank.

## Tech Stack
- **Framework**: Django 6.0 (Python 3.13+)
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Storage**: MinIO (S3 Compatible)
- **Task Queue**: (Optional/Planned: Celery with Redis)

## Setup

1.  **Create Virtual Environment**:
    ```bash
    python3 -m venv venv # or python -m venv venv
    source venv/bin/activate # or .\venv\Scripts\activate on Windows
    cd server
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Ensure the root `.env` file is configured (Postgres connection, Redis URL, MinIO credentials).

4. **Run docker environment services**:
    ```bash
    docker compose up -d
    ```

5. **Create migrations for core app**:
    ```bash
    python manage.py makemigrations core
    ```

6. **Migrate**:
    ```bash
    python manage.py migrate
    ```

7. **Run Server**:
    ```bash
    python manage.py runserver
    ```

## Storage (MinIO)
The project uses `django-storages` with MinIO.
- **Bucket**: `learning-materials`
- **Endpoint**: `http://127.0.0.1:9000` (Local)
- **Access**: credentials in `.env`

## Development
- **Create Superuser**: `python manage.py createsuperuser`
- **Tests**: `python manage.py test`
