import React from 'react';
import { Bot, Sparkles, Lightbulb, MessageSquare } from 'lucide-react';
import AIChat from '../components/AIChat';

interface AIChatPageProps {
  onNavigate: (page: string) => void;
}

const AIChatPage: React.FC<AIChatPageProps> = ({ onNavigate }) => {
  const tips = [
    {
      icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
      title: "Ask Specific Questions",
      description: "Be clear about what you're trying to achieve and what's not working."
    },
    {
      icon: <Lightbulb className="w-6 h-6 text-yellow-600" />,
      title: "Include Context",
      description: "Mention your programming language, framework, and environment details."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: "Show Your Work",
      description: "Include what you've already tried and any error messages you're seeing."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Bot className="w-16 h-16 text-indigo-600" />
            <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Question Assistant</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get intelligent help to improve your questions and increase your chances of receiving helpful answers from the community.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* AI Chat */}
        <div className="lg:col-span-2">
          <AIChat />
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              Tips for Better Questions
            </h3>
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-shrink-0">{tip.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{tip.title}</h4>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('ask')}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Ask a Question
              </button>
              <button
                onClick={() => onNavigate('questions')}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Browse Questions
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-600">
              Use the AI assistant to refine your question before posting. Well-crafted questions get better and faster responses!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatPage;