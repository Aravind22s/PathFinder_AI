import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'firebase/auth';
import { careerService } from '../services/careerService';
import { userService } from '../services/userService';
import { UserProfile, InterviewMessage } from '../types';
import { MessageSquare, Send, User as UserIcon, Bot, Target, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";

interface InterviewPrepProps {
  user: User;
  profile: UserProfile;
}

const InterviewPrep: React.FC<InterviewPrepProps> = ({ user, profile }) => {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startInterview = async () => {
    if (!role) return;
    setIsStarted(true);
    setLoading(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert technical interviewer for the role of ${role}. 
        Conduct a realistic mock interview. Ask one question at a time. 
        Start by introducing yourself and asking the first question.`
      }
    });

    try {
      const response = await chat.sendMessage({ message: "Start the interview." });
      setMessages([{ role: 'assistant', content: response.text || "Hello! Let's begin the interview." }]);
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input || loading) return;
    
    const userMessage: InterviewMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert technical interviewer for the role of ${role}. 
        Continue the mock interview. Ask one question at a time based on the user's previous answer.`
      }
    });

    try {
      // We send the whole history to maintain context in this simple implementation
      const history = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const response = await chat.sendMessage({ message: `${history}\nuser: ${input}` });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I see. Next question..." }]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async () => {
    setLoading(true);
    try {
      const feedbackResult = await careerService.getInterviewFeedback(messages, role);
      setFeedback(feedbackResult);
      await userService.saveInterview({
        userId: profile.uid,
        role,
        transcript: messages,
        feedback: feedbackResult,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error finishing interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setFeedback(null);
    setIsStarted(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      {!isStarted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-[#141414]/5 space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Mock Interview</h2>
              <p className="text-[#141414]/60 text-sm">Practice with our AI bot to sharpen your answers for your dream role.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#141414]/60 ml-1">Role to practice for</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#141414]/40" />
                  <input 
                    type="text" 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full pl-12 pr-4 py-4 bg-[#141414]/5 border-2 border-transparent focus:border-[#141414] rounded-2xl outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={startInterview}
                disabled={!role}
                className="w-full py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all active:scale-95 disabled:opacity-50"
              >
                Start Interview
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : feedback ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          <div className="bg-white rounded-[2.5rem] p-10 border border-[#141414]/5 shadow-xl space-y-8">
            <div className="flex items-center justify-between border-b border-[#141414]/5 pb-6">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-500" />
                Interview Feedback
              </h2>
              <button onClick={reset} className="text-sm font-bold text-[#141414]/40 hover:text-[#141414] flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Start New
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-[#141414]/80">
              <ReactMarkdown>{feedback}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-[#141414]/5 shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="px-8 py-6 border-b border-[#141414]/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#141414] rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">{role} Interviewer</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Live Session</p>
              </div>
            </div>
            <button 
              onClick={finishInterview}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-xs font-bold hover:bg-red-100 transition-colors"
            >
              End & Get Feedback
            </button>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F5F5F0]/30">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#141414] text-white' : 'bg-white border border-[#141414]/10'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#141414] text-white rounded-tr-none' : 'bg-white border border-[#141414]/5 shadow-sm rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-[#141414]/5 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-[#141414]/5">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your answer here..."
                className="w-full pl-6 pr-16 py-4 bg-[#141414]/5 border-2 border-transparent focus:border-[#141414] rounded-2xl outline-none transition-all text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#141414] text-white rounded-xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
