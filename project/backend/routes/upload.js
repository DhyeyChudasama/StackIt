const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if cloudinary is available
const getCloudinary = () => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const cloudinary = require('cloudinary').v2;
      return cloudinary;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Check if multer is available
const getMulter = () => {
  try {
    return require('multer');
  } catch (error) {
    return null;
  }
};

// Upload image to Cloudinary
router.post('/image', authenticateToken, async (req, res) => {
  try {
    const cloudinary = getCloudinary();
    const multer = getMulter();
    
    if (!cloudinary || !multer) {
      return res.status(503).json({ 
        error: 'Image upload not available',
        message: 'Please install cloudinary and multer packages and configure credentials'
      });
    }

    // Configure multer for memory storage
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    });

    // Use multer middleware
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'stackit',
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', authenticateToken, async (req, res) => {
  try {
    const cloudinary = getCloudinary();
    
    if (!cloudinary) {
      return res.status(503).json({ 
        error: 'Image deletion not available',
        message: 'Please install cloudinary package and configure credentials'
      });
    }

    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router; 