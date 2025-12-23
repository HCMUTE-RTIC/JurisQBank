# Backend Testing Guide (JurisQBank)

This document provides instructions for Testers/Developers on how to run Unit Tests for the Django server.

## 1. Prerequisites

Before running tests, ensure you have:

1.  **Installed Python 3.13+** and created a virtual environment (`venv`).
2.  **Installed dependencies**: `pip install -r requirements.txt`.
3.  **Docker running**: Tests require a connection to the Postgres database (and Redis). Ensure the `postgres` container (and `redis` if applicable) is running.
    ```bash
    docker compose up -d
    ```

## 2. How to Run Tests

You need to be in the project root or the `server/` directory.

### Option 1: Run from Root Directory

If you are in `d:\RTIC\JurisQBank`:

```bash
# Activate venv (if not already active)
.\venv\Scripts\activate

# Run all tests in server/tests
python server/manage.py test server.tests
```

### Option 2: Run from Server Directory

If you are in `d:\RTIC\JurisQBank\server`:

```bash
# Run all tests
python manage.py test tests

# Run a specific test file (e.g., test_auth.py)
python manage.py test tests.test_auth
```

## 3. Test Structure

Tests are located in the `server/tests/` directory:

*   `test_auth.py`: Tests for Login, Google Login, and Password Reset features.
*   *(Other test files will be added here)*

## 4. Troubleshooting

### `Connection refused` (Database error)
*   **Cause**: Database is not running or cannot be reached at port 5432.
*   **Fix**:
    1.  Open Docker Desktop.
    2.  Run `docker ps` to see if containers are up.
    3.  If not, run `docker compose up -d`.

### `ModuleNotFoundError`
*   **Cause**: Incorrect path or virtual environment not activated.
*   **Fix**: Ensure your venv is activated (`.\venv\Scripts\activate`) and run the commands exactly as shown in Section 2.
