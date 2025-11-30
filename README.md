# Flowboard Backend

A modern TypeScript-based backend API for task management with real-time synchronization using Socket.IO.

## Project Structure

```
flow-board-be/
├── src/
│   ├── controllers/    # Business logic
│   │   ├── authController.ts
│   │   └── taskController.ts
│   ├── models/         # Mongoose schemas
│   │   ├── Task.ts
│   │   └── User.ts
│   ├── routes/         # API routes
│   │   ├── auth.ts
│   │   └── tasks.ts
│   └── sockets/        # Socket.IO logic
│       └── taskSockets.ts
├── dist/               # Compiled JavaScript (generated)
├── server.ts           # Main Express server
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
├── tsconfig.json      # TypeScript configuration
├── package.json       # Project dependencies
└── README.md          # This file
```

## Features

- **TypeScript**: Full TypeScript support for type safety
- **Express.js**: Web framework for Node.js
- **MongoDB/Mongoose**: Database and ODM
- **Socket.IO**: Real-time communication
- **JWT Authentication**: Secure user authentication
- **CORS**: Cross-origin resource sharing support
- **bcryptjs**: Password hashing

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/flowboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript code to JavaScript
- `npm run start` - Start production server (requires build first)
- `npm run build:watch` - Build and watch for changes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Socket.IO Events

#### Task Management
- `joinTaskRoom` - Join a room for task updates
- `leaveTaskRoom` - Leave a task room
- `taskUpdated` - Broadcast task updates
- `taskCreated` - Broadcast new task creation
- `taskDeleted` - Broadcast task deletion

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and update the values

3. **Start MongoDB:**
   Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Database Models

### User Model
- `username`: Unique username
- `email`: User email address
- `password`: Hashed password
- `role`: User role (admin/user)
- `isActive`: Account status

### Task Model
- `title`: Task title
- `description`: Task description
- `status`: todo, in-progress, completed
- `priority`: low, medium, high
- `assignedTo`: User ID (optional)
- `createdBy`: User ID (required)
- `dueDate`: Due date (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
