# EzraTodo

A modern, full-stack todo application built with React, TypeScript, Vite, .NET Core, and SQLite. Features a clean architecture with optimistic updates, comprehensive type safety, and JWT authentication.

## Features

- **Authentication**: Secure login and signup with JWT tokens (HS256) and BCrypt password hashing
- **Todo Management**: Full CRUD operations with optimistic updates for instant UI feedback
- **Rich Todo Details**:
  - Name (required)
  - Due date (required)
  - Notes (optional, searchable)
  - Tags (optional, multiple tags with flexible filtering)
  - Location (optional, searchable)
  - Auto-tracked creation date
- **Advanced Filtering**:
  - Client-side search (name, notes, location)
  - Server-side filtering (date ranges, exact tag match)
  - Hybrid approach for optimal performance
- **Responsive Design**: Mobile-first design with card-based layout
- **Overdue Indicators**: Visual indicators with red accent for overdue todos
- **Real-time UI Updates**: Optimistic updates with automatic rollback on errors
- **Smart Caching**: React Query integration with 5-minute cache and background refetch

## Technology Stack

### Backend
- **.NET 10.0** - Latest .NET runtime with minimal hosting model
- **ASP.NET Core Web API** - RESTful API with modern C# features (records, nullable reference types)
- **Entity Framework Core 9.0** - ORM with SQLite provider
- **SQLite Database** - File-based database (`todos.db`)
- **JWT Authentication** - Bearer token authentication with 24-hour expiration
- **BCrypt.Net-Next 4.0.3** - Adaptive password hashing with automatic salting
- **Microsoft.AspNetCore.OpenApi** - Automatic API documentation

**Architecture Patterns:**
- Layered architecture (Controllers → Services → Data)
- Dependency injection throughout
- DTO pattern for API contracts
- Options pattern for configuration
- Repository pattern (directly on DbContext for simplicity)

### Frontend
- **React 19.2.0** - Modern React with hooks
- **TypeScript 5.9.3** - Strict type checking enabled
- **Vite 7.2.4** - Fast build tool and dev server
- **TanStack Query 5.90.11** (React Query) - Server state management with caching
- **React Router 7.9.6** - Client-side routing with route guards
- **Axios 1.13.2** - HTTP client with request interceptors
- **React Icons 5.5.0** - Icon library (Font Awesome)
- **jwt-decode 4.0.0** - JWT token parsing

**Architecture Patterns:**
- Hooks-only components (no classes)
- Custom hooks for logic reuse
- Context API for authentication
- Optimistic updates with React Query
- Centralized type definitions
- Path aliases for clean imports

## Project Structure

```
src/
├── backend/
│   └── TodoApi/
│       ├── Controllers/      # API controllers
│       ├── Models/           # Database models
│       ├── Data/             # DbContext
│       ├── DTOs/             # Data transfer objects
│       ├── Services/         # Business logic services
│       └── Program.cs        # Application entry point
└── frontend/
    └── todo-app/
        └── src/
            ├── components/   # Reusable React components
            ├── pages/        # Page components
            ├── contexts/     # React contexts (Auth)
            └── services/     # API service layer
```

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

2. Restore dependencies (if needed):
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

2. Install dependencies (if not already installed):
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
3. **Create Todos**: Click "New Todo" to create a new todo item
4. **Filter Todos**: Use the search bar and filters to find specific todos
5. **Delete Todos**: Click the trash icon on any todo card to delete it

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT token

### Todos (Requires Authentication)
- `GET /api/todos` - Get all todos for authenticated user (supports filtering via query params)
- `GET /api/todos/{id}` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo

## Database

The application uses SQLite for data storage. The database file (`todos.db`) is automatically created in the backend directory when you first run the application.

### Database Schema

**Users Table**
- Id (Primary Key)
- Email (Unique)
- PasswordHash
- CreatedAt

**TodoItems Table**
- Id (Primary Key)
- UserId (Foreign Key)
- Name
- DueDate
- Notes
- Location
- CreatedDate

**TodoItemTags Table**
- Id (Primary Key)
- TodoItemId (Foreign Key)
- Tag

## Security Features

### Authentication & Authorization
- **BCrypt Password Hashing**: Adaptive algorithm with automatic salting (never stores plain text)
- **JWT Bearer Tokens**: HS256 algorithm with 24-hour expiration
- **Token Claims**: Includes user ID (sub), email, JWT ID (jti), issuer, and audience
- **Protected Routes**: `[Authorize]` attribute on all todo endpoints
- **User Isolation**: All queries automatically filter by authenticated user ID

### API Security
- **CORS Configuration**: Restricted to localhost origins (development)
- **HTTPS Redirection**: Enforced in middleware pipeline
- **SQL Injection Protection**: Parameterized queries via Entity Framework Core
- **Input Validation**: Manual validation in controllers (required fields, format checks)
- **Error Information Disclosure**: Generic error messages to clients, detailed logging server-side

### Token Flow
1. Login/Signup → JWT generated with user claims
2. Token stored in localStorage (client-side)
3. Axios interceptor automatically adds `Authorization: Bearer <token>` header
4. Backend validates token on every protected endpoint
5. Token expiration validated on app initialization (removes expired tokens)

### Production Considerations
- Move JWT secret to environment variables or Azure Key Vault
- Tighten CORS to specific production domains
- Implement refresh tokens for better security
- Add rate limiting to prevent abuse
- Consider email verification on signup
- Enforce password complexity requirements

## Configuration

### Backend Configuration (appsettings.json)

The JWT secret key and database connection are configured in `src/backend/TodoApi/appsettings.json`.

**Note**: For production, move the JWT secret key to environment variables or secure configuration.

### Frontend Configuration

The API base URL is set to `http://localhost:5000/api` in `src/frontend/todo-app/src/services/api.js`. Update this if your backend runs on a different port.

## Development

### Building for Production

**Backend**:
```bash
cd src/backend/TodoApi
dotnet publish -c Release
```

**Frontend**:
```bash
cd src/frontend/todo-app
npm run build
```

The production build will be in the `dist` folder.

## Architecture Overview

### Backend Architecture

**Layered Design:**
```
HTTP Request
    ↓
Controllers (AuthController, TodosController)
    ↓
Services (IAuthService, AuthService)
    ↓
Data Access (AppDbContext, Entity Framework)
    ↓
Database (SQLite - todos.db)
```

**Key Components:**
- **Controllers**: Handle HTTP requests, validation, and responses
- **Services**: Business logic (password hashing, JWT generation)
- **DTOs**: Data transfer objects separate API contracts from database models
- **Models**: Entity Framework entities (User, TodoItem, TodoItemTag)
- **DbContext**: Database configuration with Fluent API

**Design Patterns:**
- Dependency Injection (built-in ASP.NET Core container)
- Options Pattern (type-safe configuration binding)
- DTO Pattern (prevents over-posting, maintains API contracts)
- Record Types (immutable DTOs with value-based equality)

### Frontend Architecture

**Component Hierarchy:**
```
App (Routing + AuthProvider)
  ├── ProtectedRoute (Auth guard)
  │   └── Home (Todo list page)
  │       ├── TodoCard (Display component)
  │       └── TodoModal (Create/Edit form)
  └── PublicRoute (Guest guard)
      ├── Login
      └── Signup
```

**State Management:**
- **Server State**: TanStack Query (caching, background refetch, optimistic updates)
- **Auth State**: React Context API (user, login, logout methods)
- **Local State**: useState for forms and UI state

**Custom Hooks:**
- `useTodos(filters)` - Fetch todos with optional filtering
- `useTodo(id)` - Fetch single todo (conditional)
- `useCreateTodo()` - Create mutation with cache invalidation
- `useUpdateTodo()` - Update mutation with optimistic updates
- `useDeleteTodo()` - Delete mutation with optimistic removal

### Data Flow

**Create Todo Flow:**
1. User submits form → `TodoModal` component
2. `useCreateTodo().mutate()` → API call via Axios
3. Backend creates `TodoItem` + `TodoItemTag` records
4. Success → Invalidate list queries, cache new todo detail
5. UI automatically refetches and displays new todo

**Update Todo with Optimistic Updates:**
1. User edits todo → `TodoModal` component
2. `onMutate`: Cancel in-flight queries, snapshot current state, update cache immediately
3. API call in background
4. `onSuccess`: Replace optimistic data with server response
5. `onError`: Rollback to snapshot
6. `onSettled`: Refetch to ensure consistency

**Delete Todo with Optimistic Updates:**
1. User clicks delete → Confirmation dialog
2. `onMutate`: Remove from all list caches immediately
3. API call in background
4. `onSuccess`: Remove detail cache, invalidate lists
5. `onError`: Restore all affected caches

### Tag Architecture

**Database Design:**
- Separate `TodoItemTags` table (one-to-many relationship)
- Each tag is a separate row linked to a `TodoItem`
- Cascade delete: Deleting todo deletes all its tags

**API Transformation:**
- Database: `ICollection<TodoItemTag>` entities
- API Response: `List<string>` (just tag values)
- Frontend: Comma-separated input → Array → API

**Update Strategy:**
- Full replacement: Delete all existing tags + Insert new tags
- Simpler than diff algorithm, no orphaned tags

## Performance Optimizations

### Caching Strategy (React Query)

**Configuration:**
- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (cache retention)
- **Retry**: 3 attempts with exponential backoff
- **Background Refetch**: On window focus and reconnect

**Query Keys:**
```typescript
['todos']                          // All todos queries
['todos', 'list']                  // All list queries
['todos', 'list', { filters }]     // Specific filtered list
['todos', 'detail', id]            // Individual todo
```

**Cache Invalidation:**
- Create: Invalidate all lists, cache new detail
- Update: Update detail, invalidate lists
- Delete: Remove detail, invalidate lists

### Backend Optimizations

- **Eager Loading**: `.Include(t => t.TodoItemTags)` prevents N+1 queries
- **Async/Await**: All database operations are asynchronous
- **Filtered Queries**: User isolation at database level
- **Indexed Columns**: Unique index on `User.Email` for fast lookups
- **Cascade Deletes**: Database handles related record cleanup

### Frontend Optimizations

- **Optimistic Updates**: Instant UI feedback, rollback on error
- **Request Deduplication**: React Query prevents duplicate requests
- **useMemo**: Expensive filtering operations memoized
- **Vite**: Fast builds with Hot Module Replacement (HMR)
- **Code Splitting**: React Router lazy loading (if implemented)

## Development Best Practices

### TypeScript Usage
- Strict mode enabled with additional safety flags
- Centralized type definitions by domain
- Proper null handling with explicit `| null`
- Type-safe query keys with `as const`

### Error Handling
- Try-catch blocks in all async operations
- Structured error responses (400, 401, 404, 500)
- User-friendly messages with detailed logging
- Automatic retry with exponential backoff

### Code Organization
- Domain-driven file structure
- Separation of concerns (components, hooks, services, types)
- Path aliases (`@/*`) for clean imports
- Barrel exports for types

### Git Workflow
- Main branch: `main`
- Commit history shows incremental feature development
- Recent: Edit functionality, TanStack Query migration, TypeScript migration

## Known Limitations & Future Improvements

### Current Limitations
1. No pagination (loads all todos at once)
2. Client-side filtering (works well for small datasets)
3. No refresh token mechanism
4. No database migrations (uses `EnsureCreated()`)
5. No unit tests or integration tests
6. No email verification on signup
7. No password reset functionality
8. No user profile management
9. No todo sharing or collaboration features
10. No due date reminders or notifications

### Potential Improvements
1. **Pagination**: Add server-side pagination for large datasets
2. **Global Exception Handler**: Replace repetitive try-catch blocks
3. **FluentValidation**: Replace manual validation with library
4. **Entity Framework Migrations**: Better production deployment
5. **Repository Pattern**: Add abstraction if app grows
6. **Unit Testing**: Backend services and controllers
7. **E2E Testing**: Frontend user flows with Playwright/Cypress
8. **API Versioning**: Prepare for future changes
9. **Health Checks**: `/health` endpoint for monitoring
10. **Refresh Tokens**: Improve security with short-lived access tokens
11. **Rate Limiting**: Protect against abuse
12. **Docker**: Containerize for easier deployment
13. **CI/CD Pipeline**: Automated testing and deployment
14. **Logging Framework**: Structured logging with Serilog
15. **Monitoring**: Application Insights or similar

## File Reference Guide

### Backend Key Files
- `Program.cs` - Application entry point, middleware configuration
- `Controllers/AuthController.cs` - Login, signup endpoints
- `Controllers/TodosController.cs` - CRUD operations for todos
- `Services/AuthService.cs` - Password hashing, JWT generation
- `Data/AppDbContext.cs` - Entity Framework configuration
- `Models/` - Database entities
- `DTOs/` - API request/response objects

### Frontend Key Files
- `App.tsx` - Root component with routing and route guards
- `contexts/AuthContext.tsx` - Authentication state management
- `hooks/useTodos.ts` - Query hooks for fetching todos
- `hooks/useTodoMutations.ts` - Mutation hooks with optimistic updates
- `services/api.ts` - Axios configuration and API methods
- `types/` - TypeScript type definitions
- `pages/Home.tsx` - Main todo list page with filtering
- `components/TodoModal.tsx` - Create/edit modal form
- `components/TodoCard.tsx` - Individual todo display