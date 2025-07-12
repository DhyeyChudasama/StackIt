#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting StackIt Backend...\n');

// Check if package.json exists
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  console.error('❌ package.json not found in backend directory');
  process.exit(1);
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Check if config.env exists
const configPath = path.join(__dirname, 'config.env');
if (!fs.existsSync(configPath)) {
  console.log('⚠️  config.env not found. Creating from example...');
  const examplePath = path.join(__dirname, 'config.env.example');
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, configPath);
    console.log('✅ config.env created from example');
    console.log('⚠️  Please update config.env with your actual values\n');
  } else {
    console.log('⚠️  config.env.example not found. Using default configuration\n');
  }
}

// Check MongoDB connection
console.log('🔍 Checking MongoDB connection...');
const mongoose = require('mongoose');
const config = require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connection successful');
  mongoose.disconnect();
  console.log('✅ All checks passed! Starting server...\n');
  
  // Start the server
  require('./server.js');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('\n💡 Make sure MongoDB is running:');
  console.log('   - Install MongoDB if not already installed');
  console.log('   - Start MongoDB service: mongod');
  console.log('   - Or use MongoDB Atlas (cloud)');
  process.exit(1);
}); 