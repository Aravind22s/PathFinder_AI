# Pathfinder AI - Local Setup Guide

This guide will help you set up and run Pathfinder AI on your local machine.

## Prerequisites

-   **Node.js**: Version 18 or higher.
-   **npm**: Usually comes with Node.js.
-   **Firebase Project**: You'll need a Firebase project to use the database and authentication features.

## Getting Started

### 1. Export the Code
If you haven't already, use the **Export** feature in the AI Studio settings menu to download the project as a ZIP file or push it to a GitHub repository.

### 2. Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory by copying the example:
```bash
cp .env.example .env
```
Open `.env` and fill in your secrets:
-   `GEMINI_API_KEY`: Get this from [Google AI Studio](https://aistudio.google.com/app/apikey).
-   `APP_URL`: Set this to `http://localhost:3000` for local development.

### 4. Firebase Configuration
The project already contains a `firebase-applet-config.json` file. If you want to use your own Firebase project:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (or use an existing one).
3.  Add a Web App to your project.
4.  Copy the Firebase configuration object and update `firebase-applet-config.json` with your values.
5.  **Enable Authentication**: Enable Google Sign-In in the Authentication section.
6.  **Enable Firestore**: Create a Firestore database.
7.  **Deploy Rules**: You can use the `firestore.rules` file in this project to set up your security rules in the Firebase Console.

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Scripts

-   `npm run dev`: Starts the Vite development server.
-   `npm run build`: Builds the application for production.
-   `npm run preview`: Previews the production build locally.
-   `npm run lint`: Runs TypeScript type checking.
