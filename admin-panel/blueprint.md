# Admin Panel Blueprint

## Overview
This document outlines the design and implementation of the Admin Panel for managing documents, majors, and tags. The panel provides two main functionalities: creating new documents and managing (view, edit, delete) existing documents.

## Core Features

### 1. Create Document Tab
- **Objective**: Allows administrators to create new documents with essential fields.
- **Input Fields**:
    - **Chuyên ngành (Major/Specialty)**: Creatable dropdown using `react-select/creatable`. Allows selecting existing majors or creating new ones, which are saved to Firestore.
    - **Mô tả (Description)**: Rich text editor using `react-quill` with basic formatting.
    - **Tag**: Multi-select creatable input using `react-select/creatable`. Allows selecting existing tags or creating new ones, which are saved to Firestore.
    - **Link đến tài liệu (Document Link)**: URL input with validation.
    - **File Upload**: Option to upload a file to Firebase Storage, which then generates a URL for the `Document Link` field.
- **Logic**:
    - Form validation using `react-hook-form` and `yup`.
    - Data submission to Firebase Firestore (`documents` collection).
    - File uploads to Firebase Storage.
    - Success/error notifications using `react-toastify`.

### 2. Edit Document Tab
- **Objective**: Allows administrators to search, view, update, and delete existing documents.
- **Search Functionality**:
    - `TextField` for searching by major name or description (basic implementation).
    - Displays results in an MUI `Table`.
- **RUD Operations**:
    - **View/Edit Dialog**: Opens a dialog to display document details. Can switch to edit mode.
    - **Update**: In edit mode, fields become editable. Changes are saved to Firebase Firestore (`updateDoc`). Supports file re-upload.
    - **Delete**: Confirmation dialog before deleting a document from Firestore (`deleteDoc`).
- **Logic**:
    - Fetches documents from Firestore, resolving major names for display.
    - Form validation for updates using `react-hook-form` and `yup`.
    - File uploads to Firebase Storage during updates.
    - Success/error notifications using `react-toastify`.

## Technologies Used
- **Frontend**: React, Vite
- **UI Library**: Material-UI (MUI)
- **Form Management**: `react-hook-form`, `yup` for validation, `@hookform/resolvers`
- **Rich Text Editor**: `react-quill`
- **Select/Tagging**: `react-select/creatable`
- **Notifications**: `react-toastify`
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Routing**: `react-router-dom`

## Project Structure (admin-panel)
```
admin-panel/
├── src/
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   ├── AdminAuth.jsx
│   │   ├── DocumentManager.jsx
│   │   ├── CreateDocument.jsx
│   │   └── EditDocument.jsx
│   └── assets/
├── public/
├── package.json
├── vite.config.js
├── eslint.config.js
└── blueprint.md (this file)
```

## Setup and Running
1.  **Install Dependencies**: Navigate to the `admin-panel` directory and run `npm install`.
2.  **Firebase Configuration**: Ensure your Firebase project configuration is correctly set up in `src/firebase.js`.
3.  **Run Development Server**: Run `npm run dev` in the `admin-panel` directory.
4.  **Access Admin Panel**: Open your browser to the provided local address (e.g., `http://localhost:5173/admin-login`).

## Future Improvements (as per original request)
- Implement more robust multi-field and full-text search for documents.
- Add pagination/infinite scroll for document listings.
- Enhance UX for major/tag creation with more explicit feedback.
- Implement more specific error handling for file uploads (size, type).
- Configure Firebase Security Rules for production use.
- Customize ReactQuill toolbar.
