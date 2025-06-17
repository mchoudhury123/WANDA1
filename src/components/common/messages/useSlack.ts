import { useState, useCallback, useEffect } from 'react';

interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  profile?: {
    display_name?: string;
    image_48?: string;
    title?: string;
  };
}

interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  topic?: string;
  members: number;
  unread: number;
  lastActivity: string;
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

interface UseSlackReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  channels: Channel[];
  messages: Message[];
  user: SlackUser | null;
  authenticate: () => Promise<void>;
  sendMessage: (channelId: string, text: string) => Promise<void>;
  fetchChannels: () => Promise<void>;
  fetchMessages: (channelId: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

const useSlack = (): UseSlackReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<SlackUser | null>(null);

  // Get environment variables (Note: In a real app, these would be properly configured)
  const getSlackConfig = () => ({
    clientId: process.env.VITE_SLACK_CLIENT_ID || '',
    clientSecret: process.env.VITE_SLACK_CLIENT_SECRET || '',
    redirectUri: process.env.VITE_SLACK_REDIRECT_URI || `${window.location.origin}/slack-auth-callback`,
    botToken: process.env.VITE_SLACK_BOT_TOKEN || ''
  });

  // Check for existing authentication
  useEffect(() => {
    const token = localStorage.getItem('slack_access_token');
    if (token) {
      setIsAuthenticated(true);
      // In a real implementation, we would validate the token
      fetchUser();
    }
  }, []);

  const authenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const config = getSlackConfig();
      
      if (!config.clientId) {
        throw new Error('Slack Client ID is not configured. Please check your environment variables.');
      }

      // In a real implementation, this would use Slack OAuth
      // For demo purposes, we'll simulate authentication
      
      // Redirect to Slack OAuth
      const scopes = [
        'chat:write',
        'channels:history',
        'channels:read',
        'users:read',
        'im:read',
        'im:write'
      ].join(',');
      
      const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${config.clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
      
      // For demo purposes, simulate successful authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful authentication
      const mockToken = 'xoxp-mock-token-' + Date.now();
      localStorage.setItem('slack_access_token', mockToken);
      
      const mockUser: SlackUser = {
        id: 'U123456789',
        name: 'user',
        real_name: 'Current User',
        profile: {
          display_name: 'Current User',
          image_48: '',
          title: 'Team Member'
        }
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      // In a real app, you would redirect to Slack:
      // window.location.href = authUrl;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchChannels = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call the Slack API
      // For demo purposes, we'll return empty array to use mock data
      setChannels([]);
    } catch (err) {
      setError('Failed to fetch channels');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchMessages = useCallback(async (channelId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call the Slack API
      // For demo purposes, we'll return empty array to use mock data
      setMessages([]);
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      // Mock user data if not already set
      if (!user) {
        const mockUser: SlackUser = {
          id: 'U123456789',
          name: 'user',
          real_name: 'Current User',
          profile: {
            display_name: 'Current User',
            image_48: '',
            title: 'Team Member'
          }
        };
        setUser(mockUser);
      }
    } catch (err) {
      setError('Failed to fetch user info');
    }
  }, [isAuthenticated, user]);

  const sendMessage = useCallback(async (channelId: string, text: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Not authenticated');
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, this would call the Slack API
      // For demo purposes, we'll simulate sending a message
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the message to local state for demo
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text,
        user: user,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
    } catch (err) {
      throw new Error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return {
    isAuthenticated,
    isLoading,
    error,
    channels,
    messages,
    user,
    authenticate,
    sendMessage,
    fetchChannels,
    fetchMessages,
    fetchUser
  };
};

export default useSlack; 