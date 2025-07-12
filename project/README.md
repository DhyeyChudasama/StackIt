# StackIt - Q&A Platform

A modern, real-time Q&A platform built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

### 🚀 Core Features
- **Real-time Updates**: Live notifications and updates using WebSocket
- **Rich Text Editor**: Advanced text editing with formatting options
- **Image Upload**: Support for multiple images in answers with Cloudinary
- **Code Blocks**: Syntax-highlighted code examples with language support
- **References**: Add external links and resources to answers
- **Voting System**: Upvote/downvote questions and answers
- **Like System**: Like questions and answers with notifications
- **Comment System**: Real-time comments on questions and answers
- **Tag System**: Categorize questions with tags
- **User Profiles**: User reputation and profile management

### 🔔 Real-time Notifications
- New answer notifications
- Like notifications
- Comment notifications
- Answer acceptance notifications
- Real-time badge updates

### 📱 Modern UI/UX
- Responsive design
- Dark/light theme support
- Smooth animations
- Intuitive navigation
- Mobile-friendly interface

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time features
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.IO** for WebSocket support
- **JWT** for authentication
- **Cloudinary** for image uploads
- **Multer** for file handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for image uploads)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd oddo/project
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../..
npm install
```

### 3. Environment Setup

#### Backend Configuration
Copy the example environment file and configure it:
```bash
cd backend
cp config.env.example config.env
```

Edit `config.env` with your configuration:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stackit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Cloudinary Setup
1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `config.env` file

### 4. Database Setup
Make sure MongoDB is running and create the database:
```bash
# Start MongoDB (if not already running)
mongod

# The database will be created automatically when you first run the application
```

### 5. Run the Application

#### Development Mode
```bash
# Terminal 1: Start the backend server
cd backend
npm run dev

# Terminal 2: Start the frontend development server
npm run dev
```

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend
cd backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/like` - Like/unlike question

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `PUT /api/answers/:id/accept` - Accept answer
- `POST /api/answers/:id/like` - Like/unlike answer

### Comments
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/unread-count` - Get unread count

### Upload
- `POST /api/upload/image` - Upload image
- `DELETE /api/upload/image/:publicId` - Delete image

## Real-time Events

### Client to Server
- `join-user` - Join user's notification room

### Server to Client
- `new-question` - New question created
- `new-answer` - New answer posted
- `new-comment` - New comment posted
- `notification` - New notification received

## Project Structure

```
project/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── config.env       # Environment variables
│   ├── package.json     # Backend dependencies
│   └── server.js        # Main server file
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── package.json        # Frontend dependencies
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 