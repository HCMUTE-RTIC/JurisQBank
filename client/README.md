# JurisQBank Client

Next.js frontend for JurisQBank, built with TypeScript and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Setup

1.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

2.  **Run Development Server**:
    ```bash
    pnpm dev
    ```

3.  **Build for Production**:
    ```bash
    pnpm build
    pnpm start
    ```

## Proxy / API
The frontend is configured to communicate with the Django backend at `http://localhost:8000`.
Ensure the backend services are running before developing.

## Project Structure
- `app/`: App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Utility functions and API clients.
- `public/`: Static assets.
