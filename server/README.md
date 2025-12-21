# JurisQBank Server

Django REST Framework backend for JurisQBank.

## Tech Stack
- **Framework**: Django 6.0
- **Database**: PostgreSQL 16
- **Cache**: Redis
- **Storage**: MinIO (S3 Compatible)
- **Task Queue**: (Optional/Planned: Celery with Redis)

## Setup

1.  **Create Virtual Environment**:
    ```bash
    python3 -m venv venv # or python -m venv venv
    source venv/bin/activate # or .\venv\Scripts\activate on Windows
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Ensure the root `.env` file is configured (Postgres connection, Redis URL, MinIO credentials).

4.  **Database Migration**:
    ```bash
    python manage.py migrate
    ```

5.  **Run Server**:
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
