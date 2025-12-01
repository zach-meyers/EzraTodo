# EzraTodo

A full-stack todo application built with React, Vite, .NET Core, and SQLite.

## Features

- **Authentication**: Secure login and signup with JWT tokens and bcrypt password hashing
- **Todo Management**: Create, read, and delete todos
- **Rich Todo Details**:
  - Name (required)
  - Due date (required)
  - Notes (optional)
  - Tags (optional, multiple tags supported)
  - Location (optional)
  - Auto-tracked creation date
- **Advanced Filtering**: Filter todos by:
  - Search term (searches name, notes, and location)
  - Due date range
  - Created date range
  - Tags
- **Responsive Design**: Works great on desktop and mobile devices
- **Overdue Indicators**: Visual indicators for overdue todos

## Technology Stack

### Backend
- .NET 9.0
- ASP.NET Core Web API
- Entity Framework Core
- SQLite Database
- JWT Authentication
- BCrypt for password hashing

### Frontend
- React 18
- Vite
- React Router
- Axios for API calls
- React Icons
- JWT Decode

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

- Passwords are hashed using BCrypt before storage
- JWT tokens are used for authentication
- API endpoints are protected with authorization middleware
- CORS is configured to only allow requests from the frontend
- User data is isolated (users can only see their own todos)

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