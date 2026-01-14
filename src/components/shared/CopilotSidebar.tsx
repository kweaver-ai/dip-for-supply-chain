import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, X, Send, Zap, Loader2, Square } from 'lucide-react';
import type { CopilotRichContent, StreamMessage } from '../../types/ontology';
import { Streamdown } from 'streamdown';

export interface CopilotMessage {
  type: 'user' | 'bot';
  text: string;
  richContent?: CopilotRichContent;
  isStreaming?: boolean; // Whether the message is still being streamed
  conversationId?: string;
  messageId?: string;
}

export interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialMessages: CopilotMessage[];
  suggestions: string[];
  onQuery?: (query: string, currentConversationId?: string, onStream?: (message: StreamMessage) => void) => Promise<{ text: string; richContent?: CopilotRichContent } | string>;
  topOffset?: number;
  conversationId?: string;
  onCancel?: () => void;
}

export const CopilotSidebar = ({
  isOpen,
  onClose,
  title,
  initialMessages,
  suggestions,
  onQuery,
  topOffset = 0,
  conversationId: initialConversationId,
  onCancel
}: CopilotSidebarProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset messages when initialMessages prop changes (page switch)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const newMsgs: CopilotMessage[] = [...messages, { type: 'user', text: userQuery }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    // Add streaming bot message placeholder
    const streamingMsg: CopilotMessage = {
      type: 'bot',
      text: '',
      isStreaming: true
    };
    setMessages([...newMsgs, streamingMsg]);

    // Process query
    if (onQuery) {
      try {
        let accumulatedText = '';
        let richContent: CopilotRichContent | undefined;

        // 传入当前的 conversationId (首次为 undefined,后续会有值)
        const response = await onQuery(userQuery, conversationId, (streamMessage: StreamMessage) => {
          if (streamMessage.type === 'message' && streamMessage.data) {
            const data = streamMessage.data;

            // copilotConfig.ts now converts API response to legacy format: {message: {content: {text}}}
            const messageData = data.message;
            if (messageData && messageData.content) {
              const newText = messageData.content.text || '';

              if (newText) {
                accumulatedText = newText;

                // Update the streaming message
                setMessages(currentMsgs => {
                  const updatedMsgs = [...currentMsgs];
                  const lastMsg = updatedMsgs[updatedMsgs.length - 1];
                  if (lastMsg && lastMsg.isStreaming) {
                    lastMsg.text = accumulatedText;
                    lastMsg.conversationId = data.conversation_id;
                    lastMsg.messageId = data.assistant_message_id;
                  }
                  return updatedMsgs;
                });
              }
            }

            // Save conversation_id from server (for subsequent messages)
            if (data.conversation_id && !conversationId) {
              setConversationId(data.conversation_id);
              console.log('✓ Conversation ID saved:', data.conversation_id);
            }
          } else if (streamMessage.type === 'end') {
            // Mark streaming as complete
            setMessages(currentMsgs => {
              const updatedMsgs = [...currentMsgs];
              const lastMsg = updatedMsgs[updatedMsgs.length - 1];
              if (lastMsg && lastMsg.isStreaming) {
                lastMsg.isStreaming = false;
              }
              return updatedMsgs;
            });
          } else if (streamMessage.type === 'error') {
            // Handle streaming error
            setMessages(currentMsgs => {
              const updatedMsgs = [...currentMsgs];
              const lastMsg = updatedMsgs[updatedMsgs.length - 1];
              if (lastMsg && lastMsg.isStreaming) {
                lastMsg.text = `抱歉，处理查询时出现错误：${streamMessage.error || '未知错误'}`;
                lastMsg.isStreaming = false;
              }
              return updatedMsgs;
            });
          }
        });

        // Fallback for non-streaming responses
        if (typeof response === 'string') {
          setMessages(currentMsgs => {
            const updatedMsgs = [...currentMsgs];
            const lastMsg = updatedMsgs[updatedMsgs.length - 1];
            if (lastMsg && lastMsg.isStreaming) {
              lastMsg.text = response;
              lastMsg.isStreaming = false;
            }
            return updatedMsgs;
          });
        } else if (response) {
          setMessages(currentMsgs => {
            const updatedMsgs = [...currentMsgs];
            const lastMsg = updatedMsgs[updatedMsgs.length - 1];
            if (lastMsg && lastMsg.isStreaming) {
              lastMsg.text = response.text;
              lastMsg.richContent = response.richContent;
              lastMsg.isStreaming = false;
            }
            return updatedMsgs;
          });
        }
      } catch (error) {
        console.error('Query processing error:', error);
        setMessages(currentMsgs => {
          const updatedMsgs = [...currentMsgs];
          const lastMsg = updatedMsgs[updatedMsgs.length - 1];
          if (lastMsg && lastMsg.isStreaming) {
            lastMsg.text = '抱歉，处理查询时出现错误。请稍后重试。';
            lastMsg.isStreaming = false;
          }
          return updatedMsgs;
        });
      }
    } else {
      // Default behavior
      setTimeout(() => {
        setMessages(currentMsgs => {
          const updatedMsgs = [...currentMsgs];
          const lastMsg = updatedMsgs[updatedMsgs.length - 1];
          if (lastMsg && lastMsg.isStreaming) {
            lastMsg.text = '正在分析数据... 建议已生成，请查看详情。';
            lastMsg.isStreaming = false;
          }
          return updatedMsgs;
        });
      }, 800);
    }

    setIsLoading(false);
  };

  return (
    <div
      className={`fixed right-0 w-96 bg-white border-l border-slate-200 shadow-lg rounded-l-lg transform transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ top: topOffset, height: `calc(100vh - ${topOffset}px)` }}
    >
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          {title}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-slate-200 text-slate-600'}`}>
              {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3 rounded-xl text-sm max-w-[90%] ${msg.type === 'user' ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
              {msg.type === 'bot' ? (
                <div className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <Streamdown>{msg.text}</Streamdown>
                </div>
              ) : (
                msg.text
              )}
              {msg.isStreaming && (
                <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse"></span>
              )}
              {/* Rich Content: BOM Recommendation */}
              {msg.richContent && msg.richContent.type === 'bom_recommendation' && (
                <div className="mt-3 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 bg-indigo-50 border-b border-indigo-100 text-xs font-bold text-indigo-700 flex justify-between">
                    <span>推荐 BOM 配置</span>
                    <span>{msg.richContent.totalCost}</span>
                  </div>
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 border-b border-slate-100">
                      <tr><th className="p-2">组件</th><th className="p-2">选型</th><th className="p-2">状态</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {msg.richContent.data?.map((item, i) => (
                        <tr key={i}>
                          <td className="p-2 text-slate-600">{item.component}</td>
                          <td className="p-2 font-medium text-slate-800">{item.part}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Procure' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-2 text-[10px] text-emerald-600 bg-emerald-50/50 border-t border-emerald-100 flex gap-1">
                    <Zap size={12} /> {msg.richContent.optimization}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder={isLoading ? "正在处理中..." : "输入问题..."}
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={isLoading ? () => { onCancel?.(); setIsLoading(false); } : handleSend}
            disabled={(!isLoading && !input.trim())}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
              ${isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'} 
              text-white rounded-lg hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
            title={isLoading ? "取消生成" : "发送消息"}
          >
            {isLoading ? <Square size={14} fill="currentColor" /> : <Send size={14} />}
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => !isLoading && setInput(s)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1 bg-white text-slate-600 text-xs rounded-full hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
