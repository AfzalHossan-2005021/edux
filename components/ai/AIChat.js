import { useState, useRef, useEffect } from 'react';

export default function AIChat({ courseId = null, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI study assistant. I can help you with:\n\n• Explaining concepts\n• Answering questions about your courses\n• Providing study tips\n• Creating study plans\n\nHow can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'chat',
          message: userMessage,
          courseId,
          conversationHistory: messages.slice(-10),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.message, aiGenerated: data.aiGenerated },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "I'm sorry, I couldn't process that. Please try again." },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please check your internet and try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: '📚 Study Tips', action: 'tips', topic: 'effective learning' },
    { label: '📋 Study Plan', action: 'plan' },
    { label: '❓ Ask Question', action: 'question' },
  ];

  const handleQuickAction = async (actionType) => {
    if (actionType === 'question') {
      setInput('Can you help me understand ');
      return;
    }

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `Generate ${actionType === 'tips' ? 'study tips' : 'a study plan'} for me` }]);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: actionType === 'tips' ? 'tips' : 'plan',
          topic: 'effective learning',
          courseId,
        }),
      });

      const data = await response.json();
      let content = '';

      if (actionType === 'tips' && data.tips) {
        content = `Here are some study tips:\n\n${data.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\n${data.motivation || ''}`;
      } else if (actionType === 'plan' && data.plan) {
        content = `Here's your personalized study plan:\n\n${data.plan.daily_routine || ''}\n\n${data.plan.tips?.join('\n• ') || ''}`;
      } else {
        content = "Here's what I recommend: Focus on consistent daily practice and review material regularly.";
      }

      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">AI Study Assistant</h3>
            <span className="text-xs text-indigo-200">Powered by AI</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              {message.aiGenerated === false && message.role === 'assistant' && (
                <span className="text-xs text-gray-500 mt-1 block">Default response</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.action)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
