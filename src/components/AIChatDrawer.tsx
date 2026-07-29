import React, { useState } from 'react';
import { Article, ChatMessage, Language } from '../types';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface AIChatDrawerProps {
  article: Article;
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  article,
  language,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: language === 'pt' 
        ? `Olá! Sou o AETHER AI. Tenho acesso completo ao artigo "${article.title}". Qual dúvida técnica você gostaria de discutir?`
        : `Hello! I am AETHER AI. I have full context on "${article.title}". What question would you like to explore?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: article.title,
          articleContent: article.content,
          userQuery: userMsg.text,
          language
        })
      });

      const data = await res.json();
      const replyText = data.success && data.reply ? data.reply : 'Não foi possível responder no momento.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Erro de conexão com o modelo de IA.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-neutral-950 border-l border-neutral-800 flex flex-col justify-between shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm text-neutral-100">Assistente Gemini AETHER</h3>
              <span className="font-mono text-[10px] text-neutral-400 block line-clamp-1">{article.title}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-mono ${
                msg.sender === 'user' ? 'bg-neutral-800 text-neutral-300' : 'bg-cyan-500 text-neutral-950 font-bold'
              }`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[80%] p-3 rounded-2xl space-y-1 ${
                msg.sender === 'user' 
                  ? 'bg-neutral-800 text-neutral-100 rounded-tr-none' 
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-none'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className="text-[9px] font-mono text-neutral-500 block text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Sintetizando resposta...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={language === 'pt' ? 'Pergunte qualquer coisa sobre o artigo...' : 'Ask anything about the article...'}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 text-xs focus:outline-none focus:border-cyan-500/50 font-sans"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
