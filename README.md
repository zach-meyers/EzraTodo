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
- **Global Error Handling**: Centralized error handling with consistent error responses across the stack
- **Database Migrations**: EF Core migrations for version-controlled schema management

## Technology Stack

### Backend

- **.NET 9.0** - .NET runtime with minimal hosting model
- **ASP.NET Core Web API** - RESTful API with modern C# features (records, nullable reference types)
- **Entity Framework Core 9.0** - ORM with SQLite provider and code-first migrations
- **SQLite Database** - File-based database (`todos.db`) with migration history tracking
- **JWT Authentication** - Bearer token authentication with 24-hour expiration
- **BCrypt.Net-Next 4.0.3** - Adaptive password hashing with automatic salting
- **FluentValidation.AspNetCore** - Declarative validation rules with automatic model validation
- **Microsoft.AspNetCore.OpenApi** - Automatic API documentation

**Architecture Patterns:**

- Layered architecture (Controllers → Services → Data)
- Global exception handling middleware
- Custom exception hierarchy for domain errors
- Dependency injection throughout
- DTO pattern for API contracts
- Options pattern for configuration
- Validation filter for automatic input validation
- Repository pattern (directly on DbContext for simplicity)

### Frontend

- **React 19.2.0** - Modern React with hooks
- **TypeScript 5.9.3** - Strict type checking enabled
- **Vite 7.2.4** - Fast build tool and dev server
- **TanStack Query 5.90.11** (React Query) - Server state management with caching
- **React Router 7.9.6** - Client-side routing with route guards
- **Axios 1.13.2** - HTTP client with request/response interceptors
- **React Icons 5.5.0** - Icon library (Font Awesome)
- **react-hot-toast** - Toast notifications for user feedback
- **jwt-decode 4.0.0** - JWT token parsing

**Architecture Patterns:**

- Hooks-only components (no classes)
- Custom hooks for logic reuse
- Context API for authentication
- Optimistic updates with React Query
- Error boundaries for component error catching
- Centralized error parsing utilities
- Axios interceptors for cross-cutting concerns
- Centralized type definitions
- Path aliases for clean imports

## Project Structure

```
src/
├── backend/
│   └── TodoApi/
│       ├── Controllers/      # API controllers
│       ├── Models/           # Database models
│       ├── Data/             # DbContext and database seeder
│       ├── DTOs/             # Data transfer objects
│       ├── Services/         # Business logic services
│       ├── Exceptions/       # Custom exception types
│       ├── Middleware/       # Global exception handler
│       ├── Validators/       # FluentValidation validators
│       ├── Filters/          # Validation action filter
│       ├── Migrations/       # EF Core migration files
│       └── Program.cs        # Application entry point
└── frontend/
    └── todo-app/
        └── src/
            ├── components/   # Reusable React components
            ├── pages/        # Page components
            ├── contexts/     # React contexts (Auth)
            ├── services/     # API service layer
            ├── hooks/        # Custom React hooks
            ├── utils/        # Utility functions (error parsing)
            ├── config/       # Configuration (query client)
            └── types/        # TypeScript type definitions
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

The application uses SQLite for data storage with Entity Framework Core migrations for schema management. The database file (`todos.db`) is automatically created and migrated when you first run the application in development mode.

### Database Migrations

The project uses EF Core migrations for version-controlled schema management:

**Development:**

- Migrations apply automatically on application startup
- Includes development seed data (test user with sample todos)

**Production:**

- Apply migrations manually before deployment:
  ```bash
  cd src/backend/TodoApi
  dotnet ef database update
  ```

**Creating New Migrations:**

```bash
cd src/backend/TodoApi
dotnet ef migrations add MigrationName
```

**Development Seed Data:**

- **Test User**: `test@example.com` / `Test123!`
- **Sample Todos**: 2 pre-populated todos with tags
- Seed data only loads in Development environment

### Database Schema

**Users Table**

- Id (Primary Key, auto-increment)
- Email (Unique index)
- PasswordHash
- CreatedAt

**TodoItems Table**

- Id (Primary Key, auto-increment)
- UserId (Foreign Key → Users, CASCADE delete)
- Name (required)
- DueDate (required)
- Notes (optional)
- Location (optional)
- CreatedDate

**TodoItemTags Table**

- Id (Primary Key, auto-increment)
- TodoItemId (Foreign Key → TodoItems, CASCADE delete)
- Tag (required)

**\_\_EFMigrationsHistory Table**

- MigrationId (Primary Key)
- ProductVersion
- Tracks applied migrations for version control

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
- **Input Validation**: FluentValidation with automatic validation filter
- **Error Information Disclosure**: Structured error responses with trace IDs, generic 500 errors in production
- **Global Exception Handler**: Centralized error handling prevents information leakage

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

**Request Pipeline:**

```
HTTP Request
    ↓
Middleware Pipeline
    ├── HTTPS Redirection
    ├── Global Exception Handler ← Catches all unhandled exceptions
    ├── CORS
    ├── Authentication
    └── Authorization
    ↓
Validation Filter ← Validates request models, throws ValidationException
    ↓
Controllers (AuthController, TodosController)
    ├── Throw domain exceptions (NotFoundException, ConflictException, etc.)
    └── No try-catch blocks (exceptions bubble to middleware)
    ↓
Services (IAuthService, AuthService)
    ↓
Data Access (AppDbContext, Entity Framework)
    ↓
Database (SQLite - todos.db)
```

**Key Components:**

- **Controllers**: Handle HTTP requests, throw domain exceptions (no try-catch)
- **Services**: Business logic (password hashing, JWT generation)
- **Middleware**: Global exception handler catches and transforms errors
- **Filters**: Validation filter intercepts invalid models
- **Validators**: FluentValidation rules for automatic validation
- **Exceptions**: Custom exception hierarchy (AppException, NotFoundException, etc.)
- **DTOs**: Data transfer objects separate API contracts from database models
- **Models**: Entity Framework entities (User, TodoItem, TodoItemTag)
- **DbContext**: Database configuration with Fluent API and migrations

**Design Patterns:**

- Dependency Injection (built-in ASP.NET Core container)
- Options Pattern (type-safe configuration binding)
- DTO Pattern (prevents over-posting, maintains API contracts)
- Record Types (immutable DTOs with value-based equality)
- Exception Middleware Pattern (centralized error handling)
- Custom Exception Hierarchy (domain-specific errors)

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

## Error Handling Architecture

### Backend Error Handling

**Custom Exception Hierarchy:**

```
AppException (abstract base)
    ├── NotFoundException (404)
    ├── ValidationException (400 with field errors)
    ├── ConflictException (409)
    └── UnauthorizedException (401)
```

**Global Exception Handler Middleware:**

- Catches all unhandled exceptions in the pipeline
- Maps exceptions to appropriate HTTP status codes
- Returns consistent `ErrorResponse` structure
- Logs errors with context (trace ID, user ID, request path)
- Includes stack traces in development, generic messages in production

**ErrorResponse Structure:**

```json
{
  "traceId": "0HMVFE5H3O8GD:00000001",
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": "Stack trace (dev only)",
  "validationErrors": {
    "Name": ["Name is required"],
    "Email": ["Invalid email format"]
  },
  "timestamp": "2025-12-03T14:45:13.123Z"
}
```

**FluentValidation Integration:**

- Declarative validation rules in validator classes
- Automatic validation via `ValidationFilter` action filter
- Throws `ValidationException` when model state is invalid
- No manual validation in controllers (40% code reduction)

**Exception Mapping:**

- `AppException` → Uses StatusCode and ErrorCode from exception
- `ValidationException` → 400 with field-level errors
- `DbUpdateException` → 409 or 500 depending on inner exception
- `UnauthorizedAccessException` → 401
- `ArgumentException`, `FormatException` → 400
- All others → 500 INTERNAL_SERVER_ERROR

**Logging Strategy:**

- 4xx errors → `LogWarning` (client errors)
- 5xx errors → `LogError` with full exception details
- Includes trace ID for correlation with frontend logs

### Frontend Error Handling

**Multi-Layer Error Catching:**

```
Component Errors → Error Boundary → Fallback UI
API Errors → Axios Interceptor → Error Parser → Toast/State
Mutation Errors → React Query onError → Toast Notification
```

**Error Boundaries:**

- `ErrorBoundary` - App-level boundary prevents crashes
- `RouteErrorBoundary` - Route-specific boundaries with "Try Again" functionality
- Displays error details in development, user-friendly messages in production

**Axios Response Interceptor:**

- Catches 401 errors → Clears auth token → Redirects to login
- Logs errors to console in development
- Prepares for production error logging service integration

**Error Parsing Utilities:**

```typescript
parseError(error: unknown): ParsedError {
  type: 'network' | 'auth' | 'validation' | 'notFound' | 'server' | 'unknown'
  message: string
  statusCode?: number
  errorCode?: string
  traceId?: string
  validationErrors?: Record<string, string[]>
}
```

**React Query Global Error Handlers:**

- Mutation errors → Automatic toast notification for network errors
- Query errors → Logged to console for debugging
- Component-specific handlers can override global behavior

**Toast Notifications:**

- `react-hot-toast` for user-friendly error messages
- Network errors → "Network error. Please check your connection."
- Validation errors → Field-specific messages displayed inline
- Generic errors → Extracted message from ErrorResponse

**Error Flow Example:**

1. User submits invalid todo → FluentValidation fails
2. ValidationFilter throws `ValidationException`
3. GlobalExceptionHandler catches, creates ErrorResponse with trace ID
4. Frontend receives 400 with validation errors
5. parseError() extracts field-level errors
6. Toast shows "Failed to create todo: Validation failed"
7. Validation errors displayed inline next to form fields
8. User corrects errors and resubmits

### Benefits of Global Error Handling

**Code Reduction:**

- Eliminated 7 try-catch blocks from controllers (~40% code reduction)
- Removed console.error calls from React components
- Centralized error logic reduces duplication

**Consistency:**

- All errors follow the same ErrorResponse structure
- Trace IDs connect frontend and backend logs
- Predictable error messages across the application

**Developer Experience:**

- Trace IDs make debugging easier
- Structured logging with context
- Error boundaries prevent app crashes
- Development-mode error details

**User Experience:**

- Toast notifications for transient errors
- Field-level validation errors
- Automatic retry with exponential backoff
- No exposed stack traces or technical details

## Performance Optimizations

### Caching Strategy (React Query)

**Configuration:**

- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (cache retention)
- **Retry**: 3 attempts with exponential backoff
- **Background Refetch**: On window focus and reconnect

**Query Keys:**

```typescript
["todos"][("todos", "list")][("todos", "list", { filters })][ // All todos queries // All list queries // Specific filtered list
  ("todos", "detail", id)
]; // Individual todo
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

- Global exception handler middleware (no try-catch in controllers)
- Custom exception hierarchy for domain errors
- Structured error responses with trace IDs (400, 401, 404, 409, 500)
- Error boundaries prevent React app crashes
- Toast notifications for user feedback
- Automatic retry with exponential backoff
- Field-level validation errors displayed inline

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
4. No unit tests or integration tests
5. No email verification on signup
6. No password reset functionality
7. No user profile management
8. No todo sharing or collaboration features
9. No due date reminders or notifications

### Potential Improvements

1. **Pagination**: Add server-side pagination for large datasets
2. **Repository Pattern**: Add abstraction if app grows
3. **Unit Testing**: Backend services and controllers
4. **E2E Testing**: Frontend user flows with Playwright/Cypress
5. **API Versioning**: Prepare for future changes
6. **Health Checks**: `/health` endpoint for monitoring
7. **Refresh Tokens**: Improve security with short-lived access tokens
8. **Rate Limiting**: Protect against abuse
9. **Docker**: Containerize for easier deployment
10. **CI/CD Pipeline**: Automated testing and deployment
11. **Logging Framework**: Structured logging with Serilog
12. **Monitoring**: Application Insights or similar
13. **Frontend Error Logging**: Log frontend errors to service for debugging
14. **Tag Status**: Add a tag status column and implement soft deletes

## File Reference Guide

### Backend Key Files

- `Program.cs` - Application entry point, middleware configuration, migration setup
- `Controllers/AuthController.cs` - Login, signup endpoints (no try-catch blocks)
- `Controllers/TodosController.cs` - CRUD operations for todos (no try-catch blocks)
- `Services/AuthService.cs` - Password hashing, JWT generation
- `Data/AppDbContext.cs` - Entity Framework configuration with Fluent API
- `Data/DbSeeder.cs` - Development seed data
- `Models/` - Database entities
- `DTOs/` - API request/response objects
- `Exceptions/AppException.cs` - Base exception class
- `Exceptions/NotFoundException.cs` - 404 errors
- `Exceptions/ValidationException.cs` - 400 validation errors with field details
- `Exceptions/ConflictException.cs` - 409 conflict errors
- `Exceptions/UnauthorizedException.cs` - 401 auth errors
- `Middleware/GlobalExceptionHandlerMiddleware.cs` - Centralized error handling
- `Filters/ValidationFilter.cs` - Automatic model validation
- `Validators/` - FluentValidation validator classes
- `Migrations/` - EF Core migration files

### Frontend Key Files

- `App.tsx` - Root component with routing, route guards, and error boundaries
- `main.tsx` - App entry point with top-level ErrorBoundary
- `contexts/AuthContext.tsx` - Authentication state management
- `hooks/useTodos.ts` - Query hooks for fetching todos
- `hooks/useTodoMutations.ts` - Mutation hooks with optimistic updates
- `services/api.ts` - Axios configuration with response interceptor
- `utils/errorUtils.ts` - Error parsing utilities
- `types/error.types.ts` - Error response type definitions
- `types/` - TypeScript type definitions
- `config/queryClient.ts` - React Query configuration with global error handlers
- `pages/Home.tsx` - Main todo list page with filtering
- `components/TodoModal.tsx` - Create/edit modal form with validation error display
- `components/TodoCard.tsx` - Individual todo display with toast notifications
- `components/ErrorBoundary.tsx` - App-level error boundary
- `components/RouteErrorBoundary.tsx` - Route-specific error boundary
