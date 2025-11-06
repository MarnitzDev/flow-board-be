# 📚 Flow Board API Reference

## 🔐 Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

**Login:**
```
POST /api/auth/login
{
  email: string;
  password: string;
}
```

## 👥 Users
```
GET /api/auth/me          # Get current user profile
PUT /api/auth/profile     # Update user profile
```

## 📂 Projects
```
GET /api/projects         # Get user's projects
POST /api/projects        # Create new project
GET /api/projects/:id     # Get specific project
PUT /api/projects/:id     # Update project
DELETE /api/projects/:id  # Delete project
```

## 📋 Boards
```
GET /api/boards?projectId=:id     # Get boards for project
POST /api/boards                  # Create new board
GET /api/boards/:id               # Get specific board
PUT /api/boards/:id               # Update board
DELETE /api/boards/:id            # Delete board
PUT /api/boards/:id/columns       # Update board columns
```

## 🗂️ Collections/Epics (NEW)
```
GET /api/collections/project/:projectId    # Get project collections
POST /api/collections                      # Create collection
GET /api/collections/:id                   # Get specific collection
PUT /api/collections/:id                   # Update collection
DELETE /api/collections/:id                # Delete collection
PUT /api/collections/reorder               # Reorder collections
```

## 📝 Tasks
```
GET /api/tasks                    # Get tasks (with filters)
POST /api/tasks                   # Create new task
GET /api/tasks/:id                # Get specific task
PUT /api/tasks/:id                # Update task
DELETE /api/tasks/:id             # Delete task
PUT /api/tasks/:id/move           # Move task between columns

# Subtasks (NEW)
POST /api/tasks/:id/subtasks      # Create subtask
GET /api/tasks/:id/subtasks       # Get task subtasks

# Board-specific
GET /api/tasks/board/:boardId     # Get all tasks for board
```

## 💬 Comments
```
GET /api/comments/task/:taskId    # Get task comments
POST /api/comments                # Create comment
PUT /api/comments/:id             # Update comment
DELETE /api/comments/:id          # Delete comment
```

## 🔍 Query Parameters

### Tasks Endpoint Filters:
```
GET /api/tasks?projectId=123&status=in-progress&priority=high&assignee=userId&collectionId=collectionId&dueDate[gte]=2025-11-01&dueDate[lte]=2025-12-01
```

**Available Filters:**
- `projectId` - Filter by project
- `boardId` - Filter by board  
- `collectionId` - Filter by collection
- `status` - Filter by status
- `priority` - Filter by priority (high, medium, low)
- `assignee` - Filter by assigned user
- `reporter` - Filter by reporter
- `parentTaskId` - Get subtasks for parent
- `isSubtask` - Filter subtasks (true/false)
- `dueDate[gte]` - Due date greater than or equal
- `dueDate[lte]` - Due date less than or equal
- `dueDate[lt]` - Due date less than (for overdue)

### Collections Filters:
```
GET /api/collections/project/:projectId?isArchived=false
```

## 🔄 Real-Time Socket.IO Events

### Task Events:
- `taskCreated` - New task created
- `taskUpdated` - Task modified  
- `taskDeleted` - Task removed
- `taskMoved` - Task moved between columns

### Collection Events:
- `collectionCreated` - New collection created
- `collectionUpdated` - Collection modified
- `collectionDeleted` - Collection removed
- `collectionReordered` - Collections reordered

### Subtask Events:
- `subtaskCreated` - New subtask created

### User Events:
- `user:joined` - User joined board
- `user:left` - User left board
- `user:typing` - User typing in task
- `user:stop_typing` - User stopped typing

### Board Events:
- `board:columns_updated` - Board columns modified

## 📊 Response Formats

### Standard Success Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Task Response:
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "high|medium|low",
  "assignee": "userId",
  "reporter": "userId", 
  "projectId": "string",
  "boardId": "string",
  "columnId": "string",
  "collectionId": "string",    // NEW - optional
  "parentTaskId": "string",    // NEW - for subtasks
  "isSubtask": boolean,        // NEW
  "order": number,             // NEW
  "labels": [
    {
      "name": "string",
      "color": "string"
    }
  ],
  "dueDate": "Date",
  "timeTracked": number,
  "createdBy": "userId",       // NEW
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection Response:
```json
{
  "_id": "string",
  "name": "string", 
  "description": "string",
  "color": "string",
  "projectId": "string",
  "createdBy": "userId",
  "order": number,
  "isArchived": boolean,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment Response:
```json
{
  "_id": "string",
  "content": "string",
  "createdBy": "userId",       // CHANGED from 'author'
  "taskId": "string", 
  "mentions": ["userId"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## 🌐 WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a board room for real-time updates
socket.emit('join:board', 'boardId');

// Leave board room
socket.emit('leave:board', 'boardId');
```

## 🔐 Test Credentials

```
Admin: admin@flowboard.com / admin123
User:  john@flowboard.com / password123
User:  jane@flowboard.com / password123  
User:  mike@flowboard.com / password123
User:  sarah@flowboard.com / password123
```

## 🚀 Getting Started

1. **Start the server:** `npm run dev`
2. **Seed test data:** `npm run db:seed`
3. **Connect to:** `http://localhost:5000`
4. **Login with test credentials**
5. **Join Socket.IO for real-time updates**

## 📱 Mobile/React Native Notes

The API is fully REST-compliant and works with any HTTP client. For real-time features, use a Socket.IO client compatible with your platform.

## 🔧 Environment Variables

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flowboard
JWT_SECRET=your-secret-key
NODE_ENV=development
```