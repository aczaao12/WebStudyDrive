# Project Blueprint

## Overview
This document outlines the design and implementation of both the Admin Panel and the User-Facing Application for a document management system. The system leverages React for the frontend and Firebase (Authentication, Firestore, Storage) for the backend.

## Admin Panel

### Core Features

#### 1. Create Document Tab
- **Objective**: Allows administrators to create new documents with essential fields.
- **Input Fields**:
    - **Chuyên ngành (Major/Specialty)**: Creatable dropdown using `react-select/creatable`. Allows selecting existing majors or creating new ones, which are saved to Firestore.
    - **Mô tả (Description)**: Simple text input using `TextField` (previously `react-quill`, changed for React 18 compatibility).
    - **Tag**: Multi-select creatable input using `react-select/creatable`. Allows selecting existing tags or creating new ones, which are saved to Firestore.
    - **Link đến tài liệu (Document Link)**: URL input with validation.
    - **File Upload**: Removed as per user request.
- **Logic**:
    - Form validation using `react-hook-form` and `yup`.
    - Data submission to Firebase Firestore (`documents` collection).
    - Success/error notifications using `react-toastify`.

#### 2. Edit Document Tab
- **Objective**: Allows administrators to search, view, update, and delete existing documents.
- **Search Functionality**:
    - `TextField` for searching by major name or description (basic implementation).
    - Displays results in an MUI `Table`.
- **RUD Operations**:
    - **View/Edit Dialog**: Opens a dialog to display document details. Can switch to edit mode.
    - **Update**: In edit mode, fields become editable. Changes are saved to Firebase Firestore (`updateDoc`). File re-upload functionality removed.
    - **Delete**: Confirmation dialog before deleting a document from Firestore (`deleteDoc`).
- **Logic**:
    - Fetches documents from Firestore, resolving major names for display.
    - Form validation for updates using `react-hook-form` and `yup`.
    - Success/error notifications using `react-toastify`.

### Technologies Used (Admin Panel)
- **Frontend**: React, Vite
- **UI Library**: Material-UI (MUI)
- **Form Management**: `react-hook-form`, `yup` for validation, `@hookform/resolvers`
- **Rich Text Editor**: Replaced with `TextField` for compatibility.
- **Select/Tagging**: `react-select/creatable`
- **Notifications**: `react-toastify`
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: `react-router-dom`

## User-Facing Application

### Firestore Schema

#### 1. Collection: "users"
- **Purpose**: Stores basic user information.
- **Document ID**: UID from Firebase Auth.
- **Fields**:
  ```json
  {
    "uid": "abc123",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": Timestamp,
    "lastLogin": Timestamp
  }
  ```
- **Subcollections under `users/{userId}`**:
    - **"bookmarks"**: Stores bookmarked documents.
        - **Document ID**: `docId` from "documents" collection.
        - **Fields**: `docId` (string), `addedAt` (Timestamp), `note` (string, optional).
    - **"notes"**: Stores private notes for documents.
        - **Document ID**: `docId` from "documents" collection.
        - **Fields**: `docId` (string), `content` (string), `updatedAt` (Timestamp).
    - **"shares"** (Optional): Stores history of shared documents.
        - **Document ID**: Auto-generated.
        - **Fields**: `docId` (string), `sharedWith` (array<string>), `sharedAt` (Timestamp), `message` (string, optional).

#### 2. Collection: "documents"
- **Purpose**: Stores document metadata (read-only for users, writeable by admins).
- **Fields**: `major`, `description`, `tags`, `documentLink`, `createdAt` (from admin panel), plus optional `views` (number), `sharesCount` (number).

#### 3. Collection: "shares" (Global)
- **Purpose**: For public or notification-style sharing between users.
- **Document ID**: Auto-generated.
- **Fields**: `fromUserId` (string), `toUserIds` (array<string>), `docId` (string), `message` (string, optional), `sharedAt` (Timestamp), `status` (string).

### UI Components (User-Facing)

#### 1. Dashboard Component (`src/components/Dashboard.jsx`)
- **Purpose**: Main entry point for logged-in users.
- **Sections**:
    - **Search Section**: Allows searching for documents by major or description.
    - **Bookmarks Section**: Displays a list of documents bookmarked by the user.
    - **Notes Section**: Displays a list of notes created by the user for various documents.
- **Functionality**:
    - Fetches documents, bookmarks, and notes from Firestore.
    - Allows bookmarking/unbookmarking documents.
    - Allows viewing/editing notes for documents via a dialog.
    - Uses `react-toastify` for user feedback.

### Technologies Used (User-Facing)
- **Frontend**: React, Vite
- **UI Library**: Material-UI (MUI)
- **Notifications**: `react-toastify`
- **Backend**: Firebase (Authentication, Firestore)
- **Routing**: `react-router-dom`

## Project Structure
```
/home/user/studyrecord/
├── admin-panel/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminAuth.jsx
│   │   │   ├── CreateDocument.jsx
│   │   │   └── EditDocument.jsx
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   └── ... (other admin-panel files)
├── src/
│   ├── components/
│   │   ├── Auth.jsx
│   │   ├── BorrowForm.jsx
│   │   ├── Catalog.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
└── blueprint.md (this file)
```

## Setup and Running

### Admin Panel
1.  **Install Dependencies**: Navigate to the `admin-panel` directory and run `npm install`.
2.  **Firebase Configuration**: Ensure your Firebase project configuration is correctly set up in `admin-panel/src/firebase.js`.
3.  **Run Development Server**: Run `npm run dev` in the `admin-panel` directory.
4.  **Access Admin Panel**: Open your browser to the provided local address (e.g., `http://localhost:5173/admin-login`).

### User-Facing Application
1.  **Install Dependencies**: Navigate to the root directory (`/home/user/studyrecord/`) and run `npm install` (if not already done for the main app).
2.  **Firebase Configuration**: Ensure your Firebase project configuration is correctly set up in `src/firebase.js`.
3.  **Run Development Server**: Run `npm run dev` in the root directory.
4.  **Access Application**: Open your browser to the provided local address (e.g., `http://localhost:5173/`).

### Firebase Security Rules
**Crucial**: Apply the Firestore Security Rules provided in the previous response to your Firebase project to ensure proper data access and security.

## Future Improvements
- Implement more robust multi-field and full-text search for documents.
- Add pagination/infinite scroll for document listings.
- Implement a proper admin role check in Firebase Security Rules.
- Consider a React 18 compatible rich text editor if rich text is required for descriptions.
- Implement the optional global `shares` collection and related UI.
