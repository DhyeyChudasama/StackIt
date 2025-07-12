const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('./models/User');
const Question = require('./models/Question');
const Answer = require('./models/Answer');
const Comment = require('./models/Comment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB for seeding');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await Answer.deleteMany({});
    await Comment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create demo user
    const demoUser = new User({
      username: 'demo',
      email: 'demo@stackit.com',
      password: 'demo123',
      role: 'user',
      reputation: 150,
      bio: 'I am a demo user for StackIt platform. I love helping others with programming questions!',
      avatar: ''
    });

    await demoUser.save();
    console.log('👤 Created demo user');

    // Create sample questions
    const questions = [
      {
        title: 'How to implement authentication in React with JWT?',
        content: `I'm building a React application and need to implement user authentication using JWT tokens. 

I've been looking at various tutorials but I'm confused about:
1. Where to store the JWT token (localStorage vs sessionStorage vs cookies)
2. How to handle token refresh
3. Best practices for protecting routes

Can someone provide a comprehensive example or point me to reliable resources?`,
        tags: ['react', 'javascript', 'authentication', 'jwt'],
        author: demoUser._id,
        views: 45
      },
      {
        title: 'What\'s the difference between useState and useReducer in React?',
        content: `I'm learning React hooks and I'm confused about when to use useState vs useReducer.

From what I understand:
- useState is simpler and good for basic state management
- useReducer is more complex but better for complex state logic

But I'm not sure about the specific use cases. Can someone explain with examples when you would choose one over the other?`,
        tags: ['react', 'javascript', 'hooks', 'state-management'],
        author: demoUser._id,
        views: 32
      },
      {
        title: 'Best practices for MongoDB schema design',
        content: `I'm designing a MongoDB schema for an e-commerce application and I'm wondering about best practices.

My main concerns are:
1. When to embed vs reference documents
2. How to handle relationships between collections
3. Indexing strategies for performance
4. Schema validation

Any experienced MongoDB developers who can share their insights?`,
        tags: ['mongodb', 'database', 'schema-design', 'nosql'],
        author: demoUser._id,
        views: 28
      }
    ];

    const savedQuestions = await Question.insertMany(questions);
    console.log('❓ Created sample questions');

    // Create sample answers
    const answers = [
      {
        content: `Great question! Here's a comprehensive approach to JWT authentication in React:

**1. Token Storage:**
I recommend using httpOnly cookies for security, but if you must use localStorage, ensure you implement proper security measures.

**2. Token Refresh:**
Create an interceptor that automatically refreshes tokens when they expire:

\`\`\`javascript
// api.js
const api = axios.create({
  baseURL: '/api'
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Try to refresh token
      const newToken = await refreshToken();
      if (newToken) {
        // Retry original request
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
\`\`\`

**3. Protected Routes:**
Use a higher-order component or custom hook:

\`\`\`javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};
\`\`\`

This approach provides good security while maintaining a good user experience.`,
        author: demoUser._id,
        question: savedQuestions[0]._id
      },
      {
        content: `Excellent explanation of the differences! Let me add some practical examples:

**useState is perfect for:**
- Simple boolean flags
- Form inputs
- Toggle states
- Counter values

**useReducer shines when you have:**
- Complex state logic
- Multiple related state updates
- State that depends on previous state
- Actions that affect multiple state properties

Here's a practical example:

\`\`\`javascript
// useState - Simple counter
const [count, setCount] = useState(0);

// useReducer - Shopping cart
const [cart, dispatch] = useReducer(cartReducer, {
  items: [],
  total: 0,
  itemCount: 0
});

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price,
        itemCount: state.itemCount + 1
      };
    // ... other cases
  }
};
\`\`\`

The key is complexity - if your state logic is simple, use useState. If it's complex, useReducer will make your code more maintainable.`,
        author: demoUser._id,
        question: savedQuestions[1]._id
      }
    ];

    const savedAnswers = await Answer.insertMany(answers);
    console.log('💬 Created sample answers');

    // Update questions with answers
    await Question.findByIdAndUpdate(savedQuestions[0]._id, {
      $push: { answers: savedAnswers[0]._id }
    });
    await Question.findByIdAndUpdate(savedQuestions[1]._id, {
      $push: { answers: savedAnswers[1]._id }
    });

    // Create sample comments
    const comments = [
      {
        content: 'This is exactly what I was looking for! Thank you for the detailed explanation.',
        author: demoUser._id,
        question: savedQuestions[0]._id
      },
      {
        content: 'Great examples! The shopping cart analogy really helped me understand the difference.',
        author: demoUser._id,
        question: savedQuestions[1]._id
      }
    ];

    await Comment.insertMany(comments);
    console.log('💭 Created sample comments');

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log('- 1 demo user (demo@stackit.com / demo123)');
    console.log('- 3 sample questions');
    console.log('- 2 sample answers');
    console.log('- 2 sample comments');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding
seedData(); 