# ThreadSphere - (A Real-Time Comments System)

A full-stack real-time commenting system with nested replies, likes/dislikes, and instant updates using React, Redux, Socket.IO, Node.js, Express, and MongoDB.

## Features

- Real-time updates across all connected users
- Nested threaded comments
- Like and dislike functionality
- Edit and delete own comments
- Pagination
- JWT-based authentication
- Sort comments by newest, most liked, or most disliked
- Optimistic UI updates for instant feedback

## Tech Stack

**Frontend**
- React 18 with Vite
- Redux Toolkit
- Socket.IO Client
- Axios
- SCSS Modules

**Backend**
- Node.js with Express
- MongoDB with Mongoose – for schema-based modeling and easy database interactions
- Socket.IO
- JWT Authentication
- Express Validator

## Installation

### Prerequisites
- Node.js >= 20.0.0
- MongoDB >= 6.0
- npm or yarn

### Setup

1. Clone the repository \
* git clone https://github.com/msourov/realtime-comments-system.git \
* cd realtime-comments-system


2. Backend setup \
* cd backend
* npm install
* cp .env.example .env

Edit .env with your configuration

3. Frontend setup
* cd frontend
* npm install
* cp .env.example .env

### Environment Variables

**Backend (.env)**
PORT=8000
MONGODB_URI=mongodb://localhost:27017/comments-db
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
FRONTEND_URL=http://localhost:5173


**Frontend (.env)**
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000

## Running the Application

Start backend server:
cd backend
npm run dev


Start frontend development server:
cd frontend
npm run dev

Backend runs on `http://localhost:8000`  
Frontend runs on `http://localhost:5173`

## Project Structure
```
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── services/
│ │ ├── middleware/
│ │ ├── socket/
│ │ └── utils/
│ └── server.js
│
└── frontend/
├── src/
│ ├── features/
│ │ ├── auth/
│ │ └── comments/
│ ├── context/
│ ├── components/
│ └── App.jsx
└── package.json
```
## API Endpoints

### Authentication
* POST /api/auth/register
* POST /api/auth/login
* POST /api/auth/refresh
* POST /api/auth/logout

### Comments
* GET /api/comments
* POST /api/comments
* PUT /api/comments/:id
* DELETE /api/comments/:id
* POST /api/comments/:id/like
* POST /api/comments/:id/dislike

## Real-Time Events

### Client to Server
- `joinPage(pageId)` - Join a page room
- `leavePage(pageId)` - Leave a page room

### Server to Client
- `newComment` - New comment created
- `commentUpdated` - Comment edited
- `commentDeleted` - Comment removed
- `commentLiked` - Comment liked/unliked
- `commentDisliked` - Comment disliked/undisliked

## Key Features Explained

### Real-Time Updates
All comment operations (create, edit, delete, like, dislike) are broadcast instantly to all connected users via Socket.IO. The system uses room-based broadcasting per page for efficient message routing.

### Nested Comments
Comments support threaded replies up to 3 levels deep. The system uses recursive rendering to display comment trees with visual indentation.

### Pagination
Comments are paginated with configurable page size (default: 10 comments per page). Navigation includes previous/next buttons and page numbers with ellipsis for large page counts.

### Authentication
JWT-based authentication with access and refresh tokens. All API endpoints and Socket.IO connections are authenticated. Tokens are automatically refreshed when expired.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

GitHub: [@msourov](https://github.com/msourov)

## Support

For questions or issues, please open an issue on GitHub or contact mahmud.sv9@gmail.com