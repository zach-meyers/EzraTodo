# EzraTodo

A modern, full-stack todo application built with React, TypeScript, Vite, .NET Core, and SQLite. Features a clean architecture with JWT authentication, type safety, and optimistic updates.

## Features

- **Authentication**: Secure login and signup with JWT tokens (HS256) and BCrypt password hashing
- **Todo Management**: Full CRUD operations with optimistic updates for instant UI feedback
- **Filtering**: Client-side text search and field-specific filtering
- **Responsive Design**: Mobile-first design with card-based layout
- **Overdue Indicators**: Visual indicators with red accent for overdue todos
- **Smart Caching**: React Query integration with 5-minute cache and background refetch
- **Global Error Handling**: Centralized error handling with consistent error responses across the stack
- **Database Migrations**: EF Core migrations for version-controlled schema management

## Tech Stack

### Backend

- **.NET 9 Web API** - RESTful API with modern C# features
- **EF Core 9** - ORM with SQLite provider and code-first migrations
- **JWT Authentication** - Bearer token authentication with 24-hour expiration and secure password hashing
- **FluentValidation** - Declarative validation rules with automatic model validation
- **OpenApi / Swagger** - Automatic API documentation

### Frontend

- **React 19** - Modern React with hooks
- **TypeScript 5.9** - Strict type checking enabled
- **Vite 7.2** - Fast build tool and dev server
- **TanStack Query** (React Query) - Server state management with caching
- **Toast** - react-hot-toast notifications for user feedback
- **Forms** - react-hook-form for easy form setup, validation, and submission

## Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v20.19.0 or higher recommended)
- npm (comes with Node.js)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd src/backend/TodoApi
   ```

2. Restore dependencies:

   ```bash
   dotnet restore
   ```

3. Run the backend:

   ```bash
   dotnet run
   ```

   The API will start on `https://localhost:5001` and `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd src/frontend/todo-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The app will start on `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Login**: Sign in with your credentials
3. **Create Todo**: Click "New Todo" to create a new todo item
4. **Edit Todo**: Click the edit icon on any todo card to edit it
5. **Filter Todos**: Use the search bar and filters to find specific todos
6. **Delete Todos**: Click the trash icon on any todo card to delete it

### Next Steps

- **Soft Deletes**: Add status columns for todoItem and todoItemTag so a history can be preserved
- **Refresh Tokens**: Improve security with short-lived access tokens
- **Email Verification**: Ensure the user's email is correct on signup so we can send info
- **Password Reset**: Allow users to reset their password by sending short-lived token to their email
- **Password Complexity**: Enforce password complexity to prevent users from using easily guessable secrets
- **Profile Management**: Store more user info and allow users to modify this data
- **Pagination**: Add server-side pagination/filtering for large datasets
- **Todo Completion**: Allow users to "complete" their todos and have those items moved off the main list
- **Pnpm**: Use `pnpm` as the package manager for faster installs and a smaller `node_modules`
- **API Versioning**: Prepare for future changes
- **Health Checks**: `/health` endpoint for monitoring
- **CORS**: Add CORS to configuration for production deployment
- **Rate Limiting**: Protect against abuse
- **Logging/Monitoring**: Setup logging and monitoring to ensure service availability
- **Docker**: Containerize for easier deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **E2E Testing**: Frontend user flows with Playwright/Cypress
- **Frontend Error Logging**: Log frontend errors to service for debugging
