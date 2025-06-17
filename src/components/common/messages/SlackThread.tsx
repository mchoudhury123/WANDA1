import React, { useState, useRef, useEffect } from 'react';

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  topic?: string;
  members: number;
  unread: number;
  lastActivity: string;
}

interface SlackUser {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  title?: string;
}

interface Message {
  id: string;
  text: string;
  user: SlackUser;
  timestamp: string;
  reactions?: Array<{
    name: string;
    count: number;
    users: string[];
  }>;
  thread_ts?: string;
  reply_count?: number;
}

interface SlackThreadProps {
  channel: Channel;
  messages: Message[];
  currentUser: SlackUser | null;
  onSendMessage: (channelId: string, text: string) => Promise<void>;
}

// Simple SVG Icons
const SendIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SmileIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PaperclipIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const UserIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SlackThread: React.FC<SlackThreadProps> = ({
  channel,
  messages,
  currentUser,
  onSendMessage
}) => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock messages if no real messages
  const mockMessages: Message[] = [
    {
      id: '1',
      text: `Welcome to #${channel.name}! 👋`,
      user: {
        id: 'bot',
        name: 'Slackbot',
        displayName: 'Slackbot',
        avatar: '',
        isOnline: true
      },
      timestamp: new Date(Date.now() - 60000 * 60).toISOString(),
    },
    {
      id: '2',
      text: 'Great to have everyone here for team collaboration!',
      user: {
        id: 'manager',
        name: 'manager',
        displayName: 'Team Manager',
        avatar: '',
        isOnline: true,
        title: 'Manager'
      },
      timestamp: new Date(Date.now() - 60000 * 30).toISOString(),
    },
    {
      id: '3',
      text: 'Looking forward to working together efficiently! 🚀',
      user: {
        id: 'staff1',
        name: 'staff1',
        displayName: 'Sarah Johnson',
        avatar: '',
        isOnline: true,
        title: 'Senior Stylist'
      },
      timestamp: new Date(Date.now() - 60000 * 15).toISOString(),
    }
  ];

  const displayMessages = messages.length > 0 ? messages : mockMessages;

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(channel.id, messageText.trim());
      setMessageText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const MessageItem: React.FC<{ message: Message }> = ({ message }) => (
    <div className="flex items-start space-x-3 px-4 py-2 hover:bg-gray-50 group">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-md overflow-hidden">
          {message.user.avatar ? (
            <img 
              src={message.user.avatar} 
              alt={message.user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline space-x-2">
          <span className="font-medium text-gray-900 text-sm">
            {message.user.displayName}
          </span>
          {message.user.title && (
            <span className="text-xs text-gray-500">
              {message.user.title}
            </span>
          )}
          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
          {message.text}
        </div>
        
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center space-x-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-xs transition-colors"
              >
                <span>{reaction.name}</span>
                <span className="text-blue-600">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-4">
          {displayMessages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${channel.name}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent resize-none max-h-[120px]"
              rows={1}
              disabled={isSending}
            />
            
            {/* Input Controls */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Add emoji"
              >
                <SmileIcon className="h-4 w-4" />
              </button>
              <button
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Attach file"
              >
                <PaperclipIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            className="p-2 bg-[#4A154B] text-white rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <SendIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlackThread; 