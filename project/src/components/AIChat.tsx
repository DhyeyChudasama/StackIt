import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Lightbulb } from 'lucide-react';

// Define AIMessage interface locally since it was removed from types
interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  onSuggestion?: (suggestion: string) => void;
  context?: string;
}

const AIChat: React.FC<AIChatProps> = ({ onSuggestion, context }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI programming assistant. I can help you with coding questions, debug issues, explain concepts, suggest best practices, and help you write better questions. What programming challenge can I help you with today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // For demo purposes, we'll use a simple pattern-based response system
      // In production, you would use the actual Google Generative AI API
      
      const lowerMessage = userMessage.toLowerCase();
      
      // Programming language specific responses
      if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        return "JavaScript is a versatile language! Here are some tips:\n\n• Use `const` and `let` instead of `var`\n• Learn async/await for handling promises\n• Understand closures and scope\n• Use modern ES6+ features\n• Consider using TypeScript for larger projects\n\nWhat specific JavaScript concept would you like help with?";
      }
      
      if (lowerMessage.includes('react')) {
        return "React is a powerful library! Here are key concepts:\n\n• Components and JSX\n• State management with useState\n• Side effects with useEffect\n• Props for component communication\n• Virtual DOM for performance\n\nAre you working on a specific React component or feature?";
      }
      
      if (lowerMessage.includes('python')) {
        return "Python is great for beginners and experts! Key tips:\n\n• Follow PEP 8 style guidelines\n• Use list comprehensions for cleaner code\n• Leverage built-in functions like map, filter, reduce\n• Use virtual environments for projects\n• Learn about decorators and context managers\n\nWhat Python topic interests you?";
      }
      
      if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
        return "Debugging tips for better problem solving:\n\n• Read the error message carefully\n• Check the line number mentioned\n• Use console.log or print statements\n• Break down the problem into smaller parts\n• Search for the exact error message\n• Use browser dev tools or debugger\n\nCan you share the specific error you're encountering?";
      }
      
      if (lowerMessage.includes('database') || lowerMessage.includes('sql')) {
        return "Database best practices:\n\n• Normalize your data structure\n• Use indexes for better performance\n• Write efficient queries\n• Handle transactions properly\n• Backup your data regularly\n• Use prepared statements to prevent SQL injection\n\nWhat database technology are you working with?";
      }
      
      if (lowerMessage.includes('api') || lowerMessage.includes('rest')) {
        return "API development guidelines:\n\n• Use proper HTTP methods (GET, POST, PUT, DELETE)\n• Implement proper status codes\n• Add authentication and authorization\n• Document your API endpoints\n• Handle errors gracefully\n• Use versioning for API changes\n\nAre you building or consuming an API?";
      }
      
      // Question improvement suggestions
      if (lowerMessage.includes('question') || lowerMessage.includes('ask')) {
        return "Here's how to write better questions:\n\n• Be specific in your title\n• Include relevant code snippets\n• Explain what you expected vs what happened\n• Mention your environment (OS, versions)\n• Show what you've already tried\n• Use proper formatting and tags\n\nWould you like me to help improve a specific question?";
      }
      
      // General programming advice
      const generalResponses = [
        "Great question! Here are some programming best practices:\n\n• Write clean, readable code\n• Use meaningful variable names\n• Comment your complex logic\n• Test your code thoroughly\n• Keep functions small and focused\n• Follow the DRY principle (Don't Repeat Yourself)\n\nWhat specific area would you like to improve?",
        "Programming tips for better development:\n\n• Break problems into smaller parts\n• Use version control (Git)\n• Learn debugging techniques\n• Stay updated with best practices\n• Practice regularly with coding challenges\n• Read other people's code\n\nWhat programming challenge are you facing?",
        "Here's how to approach coding problems:\n\n• Understand the requirements clearly\n• Plan your solution before coding\n• Start with a simple implementation\n• Refactor and optimize later\n• Test edge cases\n• Document your solution\n\nWhat type of problem are you trying to solve?"
      ];
      
      return generalResponses[Math.floor(Math.random() * generalResponses.length)];
      
    } catch (error) {
      return "I'm having trouble processing your request right now. Here are some general programming tips:\n\n• Break down complex problems\n• Use proper error handling\n• Write clean, readable code\n• Test your solutions\n• Don't hesitate to ask for help\n\nPlease try asking your question again!";
    }
  };


  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(input);
      
      setTimeout(() => {
        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickSuggestions = [
    "Help me debug a JavaScript error",
    "React component best practices",
    "How to optimize database queries?",
    "API design guidelines",
    "Python coding tips",
    "How to write better questions?"
  ];

  return (
    <div className="flex flex-col h-96 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-sm text-purple-100">Here to help improve your questions</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.isUser
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {!message.isUser && (
                  <Bot className="w-4 h-4 mt-1 text-purple-600 flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 flex items-center">
            <Lightbulb className="w-3 h-3 mr-1" />
            Quick suggestions:
          </p>
          <div className="flex flex-wrap gap-1">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about writing better questions..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;