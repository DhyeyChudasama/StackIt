import React from 'react';
import { 
  MessageSquare, 
  Users, 
  Award, 
  TrendingUp, 
  Bot, 
  Heart, 
  CheckCircle, 
  ArrowRight,
  Star,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedElement from '../components/AnimatedElement';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Assistant",
      description: "Get intelligent suggestions to improve your questions and increase your chances of getting helpful answers."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
      title: "Rich Text Editor",
      description: "Format your questions and answers with our advanced editor supporting code blocks, images, and more."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Community Driven",
      description: "Connect with developers worldwide and build your reputation by helping others solve problems."
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-600" />,
      title: "Reputation System",
      description: "Earn points for quality contributions and unlock new privileges as you help the community grow."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Like & Vote System",
      description: "Show appreciation for great questions and answers with our comprehensive voting system."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Quality Control",
      description: "Our community moderation ensures high-quality content and a respectful environment."
    }
  ];

  const stats = [
    { number: "10K+", label: "Questions Asked", icon: <MessageSquare className="w-6 h-6" /> },
    { number: "25K+", label: "Answers Provided", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "5K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { number: "95%", label: "Problems Solved", icon: <TrendingUp className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <AnimatedElement animation="fadeIn" duration={0.8}>
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Bot className="w-20 h-20 text-indigo-600" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </AnimatedElement>
            <AnimatedElement animation="slideUp" duration={0.7} delay={0.1}>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  StackIt
                </span>
              </h1>
            </AnimatedElement>
            <AnimatedElement animation="fadeIn" duration={0.7} delay={0.2}>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                The next-generation Q&A platform powered by AI. Ask better questions, get better answers, 
                and build your programming knowledge with our intelligent community.
              </p>
            </AnimatedElement>
            <AnimatedElement animation="slideUp" duration={0.7} delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!user ? (
                  <>
                    <button
                      onClick={() => onNavigate('register')}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 inline ml-2" />
                    </button>
                    <button
                      onClick={() => onNavigate('questions')}
                      className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200"
                    >
                      Explore Questions
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('ask')}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Ask a Question
                      <ArrowRight className="w-5 h-5 inline ml-2" />
                    </button>
                    <button
                      onClick={() => onNavigate('ai-chat')}
                      className="px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200"
                    >
                      Try AI Assistant
                    </button>
                  </>
                )}
              </div>
            </AnimatedElement>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedElement key={index} animation="fadeIn" duration={0.7} delay={index * 0.1}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-indigo-600">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <AnimatedElement animation="slideUp" duration={0.7}>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Better Learning
              </h2>
            </AnimatedElement>
            <AnimatedElement animation="fadeIn" duration={0.7} delay={0.1}>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to ask great questions, provide helpful answers, and grow your programming skills.
              </p>
            </AnimatedElement>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedElement key={index} animation="slideUp" duration={0.7} delay={index * 0.1}>
                <div 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How StackIt Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get the help you need</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ask Your Question</h3>
              <p className="text-gray-600">Use our AI assistant to craft the perfect question with proper formatting and tags.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Expert Answers</h3>
              <p className="text-gray-600">Our community of developers provides detailed, helpful answers to solve your problems.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Learn & Grow</h3>
              <p className="text-gray-600">Vote on answers, accept solutions, and build your reputation in the community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Community?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start asking better questions and getting better answers today.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('ask')}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
            >
              Ask Your First Question
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="w-8 h-8 text-indigo-400" />
                <span className="text-2xl font-bold">StackIt</span>
              </div>
              <p className="text-gray-400 mb-4">
                The AI-powered Q&A platform for developers. Ask better questions, get better answers.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Connecting developers worldwide</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => onNavigate('questions')} className="hover:text-white transition-colors">Questions</button></li>
                <li><button onClick={() => onNavigate('tags')} className="hover:text-white transition-colors">Tags</button></li>
                <li><button onClick={() => onNavigate('ai-chat')} className="hover:text-white transition-colors">AI Assistant</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StackIt. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;