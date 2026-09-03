import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Send, Paperclip, Lightbulb, Trash2, Brain, FileText, HelpCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { ChatMessage } from '@/types';

const suggestions = ['Recommend courses', 'Assess my skills', 'Generate quiz', 'Explain concept'];

const botResponses: Record<string, string> = {
  'recommend courses':
    'Based on your competency analysis, I recommend: "Introduction to Machine Learning for Statisticians" and "Advanced Python for Data Analysis". Would you like to enroll?',
  'assess my skills':
    "I've analyzed your profile. Your strengths are Statistical Analysis (85%) and Survey Methodology (80%). Areas for improvement include Machine Learning (35%) and Python Programming (55%).",
  'generate quiz':
    "Please upload your study material (PDF or document), and I'll generate relevant MCQs for you. You can use the attachment button below.",
  'explain concept':
    'What statistical concept would you like me to explain? I can help with topics like hypothesis testing, regression analysis, sampling methods, and more!',
};

const features = [
  { icon: Brain, title: 'Competency Analysis', desc: 'Identify skill gaps and get personalized recommendations' },
  { icon: FileText, title: 'Document Upload', desc: 'Upload study materials to generate quizzes and MCQs' },
  { icon: HelpCircle, title: 'Quiz Generation', desc: 'Auto-generate questions from your learning content' },
  { icon: MessageSquare, title: '24/7 Support', desc: 'Get instant answers to your learning queries' },
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            role: 'bot',
            content:
              "Hello! I'm your AI Learning Assistant. I can help you with finding relevant courses, generating quizzes from study materials, answering questions about statistical concepts, and tracking your learning progress. How can I assist you today?",
          },
        ]);
      }
    })();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: text });

    setTimeout(async () => {
      const lower = text.toLowerCase();
      let response = botResponses['default'] ?? "I'm here to help! You can ask me to recommend courses, assess your skills, generate quizzes, or explain statistical concepts.";
      for (const key in botResponses) {
        if (lower.includes(key)) {
          response = botResponses[key];
          break;
        }
      }
      const botMsg: ChatMessage = { role: 'bot', content: response };
      setMessages((prev) => [...prev, botMsg]);
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'bot', content: response });
      setLoading(false);
    }, 1000);
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    setMessages([
      {
        role: 'bot',
        content: "Hello! I'm your AI Learning Assistant. How can I assist you today?",
      },
    ]);
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Chat Container */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-white">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-cyan-300" />
              <div>
                <h2 className="text-lg font-bold">AI Learning Assistant</h2>
                <div className="flex items-center gap-1.5 text-sm text-blue-100">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Online
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="rounded-lg p-2 transition hover:bg-white/10"
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="border-b border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-600">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border-2 border-gray-200 px-4 py-1.5 text-sm transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] space-y-4 overflow-y-auto p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'bot' ? 'bg-blue-600' : 'bg-blue-400'
                  } text-white`}
                >
                  {msg.role === 'bot' ? <Bot className="h-5 w-5" /> : <span className="text-sm font-bold">You</span>}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl p-3 ${
                    msg.role === 'bot'
                      ? 'rounded-tl-none bg-gray-100 text-gray-800'
                      : 'rounded-tr-none bg-blue-600 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 transition hover:text-blue-600" title="Attach file">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your message or upload study material..."
                className="flex-1 rounded-full border-2 border-gray-200 py-2.5 px-4 outline-none transition focus:border-blue-600"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Tip: Upload your PDF/document to generate MCQs automatically
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold text-gray-900">AI Capabilities</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 rounded-xl bg-gray-50 p-4">
                <f.icon className="h-8 w-8 flex-shrink-0 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{f.title}</h4>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
