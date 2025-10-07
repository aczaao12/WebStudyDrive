## Project Overview

This project consists of two separate React applications built with Vite: a main application and an admin panel. Both applications utilize Material-UI for the UI, Firebase for backend services (authentication, Firestore), and React Router for navigation. The admin panel specifically uses `react-hook-form` and `yup` for form management and validation, `react-quill` for rich text editing, and `react-select` for enhanced select inputs.

## Building and Running

Both applications are standard React/Vite projects.

### Main Application

*   **To install dependencies:** `npm install` in the root directory.
*   **To run in development mode:** `npm run dev` in the root directory.
*   **To build for production:** `npm run build` in the root directory.
*   **To preview the production build:** `npm run preview` in the root directory.

### Admin Panel

*   **To install dependencies:** `npm install` in the `admin-panel` directory.
*   **To run in development mode:** `npm run dev` in the `admin-panel` directory.
*   **To build for production:** `npm run build` in the `admin-panel` directory.
*   **To preview the production build:** `npm run preview` in the `admin-panel` directory.

## Development Conventions

*   **Framework:** React with Vite.
*   **UI Library:** Material-UI.
*   **Backend:** Firebase (Firestore, Authentication).
*   **Routing:** React Router DOM.
*   **Form Management (Admin Panel):** `react-hook-form` with `yup` for schema validation.
*   **Code Quality:** ESLint is configured for both projects. Run `npm run lint` in respective directories.