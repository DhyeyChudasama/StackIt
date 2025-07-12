# Backend Troubleshooting Guide

## Common Issues and Solutions

### 1. Server Crashes on Startup

**Problem**: `nodemon app crashed - waiting for file changes before starting...`

**Solutions**:

#### A. Missing Dependencies
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Or use the setup script
npm run setup
```

#### B. MongoDB Not Running
```bash
# Start MongoDB (Windows)
# Make sure MongoDB service is running
# Or start manually: mongod

# Start MongoDB (Mac/Linux)
sudo systemctl start mongod
# Or: brew services start mongodb-community
```

#### C. Port Already in Use
```bash
# Check what's using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or change port in config.env
PORT=5001
```

### 2. MongoDB Connection Issues

**Problem**: `MongoDB connection error`

**Solutions**:

#### A. Check MongoDB Installation
```bash
# Check if MongoDB is installed
mongod --version

# If not installed, install it:
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
```

#### B. Check MongoDB Service
```bash
# Windows
services.msc  # Look for MongoDB service

# Mac/Linux
sudo systemctl status mongod
```

#### C. Use MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update `config.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stackit
```

### 3. Missing Environment Variables

**Problem**: `Cannot read property of undefined`

**Solutions**:

#### A. Check config.env
Make sure `config.env` exists in backend directory:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/stackit

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Optional: Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### B. Copy from Example
```bash
cp config.env.example config.env
# Then edit config.env with your values
```

### 4. Image Upload Not Working

**Problem**: `Image upload not available`

**Solutions**:

#### A. Install Optional Dependencies
```bash
npm install multer cloudinary
```

#### B. Configure Cloudinary
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your credentials
3. Add to `config.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### C. Use Without Image Upload
The app will work without image upload. Just ignore the warnings.

### 5. Socket.IO Issues

**Problem**: WebSocket connection failed

**Solutions**:

#### A. Check CORS Settings
Make sure `FRONTEND_URL` is set correctly in `config.env`:
```env
FRONTEND_URL=http://localhost:5173
```

#### B. Check Port Configuration
Ensure frontend and backend ports don't conflict.

### 6. JWT Issues

**Problem**: `Invalid token` errors

**Solutions**:

#### A. Check JWT_SECRET
Make sure `JWT_SECRET` is set in `config.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-here
```

#### B. Generate New Secret
```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Quick Setup Commands

```bash
# 1. Navigate to backend
cd backend

# 2. Run setup (installs dependencies, checks config)
npm run setup

# 3. Start development server
npm run dev

# 4. Check if server is running
curl http://localhost:5000/api/health
```

## Health Check Endpoint

Test if your server is running:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "StackIt API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "features": {
    "cloudinary": false,
    "websocket": true,
    "mongodb": true
  }
}
```

## Logs to Check

Look for these success messages:
- ✅ Connected to MongoDB successfully
- ✅ Cloudinary configured successfully (optional)
- ✅ Upload routes enabled (optional)
- 🚀 Server running on port 5000
- 🔌 WebSocket server ready

## Still Having Issues?

1. Check the console output for specific error messages
2. Make sure all dependencies are installed
3. Verify MongoDB is running
4. Check your `config.env` file
5. Try running `npm run setup` first

## Support

If you're still experiencing issues, please:
1. Share the exact error message
2. Include your Node.js version: `node --version`
3. Include your MongoDB version: `mongod --version`
4. Share the relevant parts of your `config.env` (without sensitive data) 