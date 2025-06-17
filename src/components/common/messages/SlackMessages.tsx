import React, { useState, useEffect } from 'react';
import useSlack from './useSlack';
import SlackSidebar from './SlackSidebar';
import SlackThread from './SlackThread';

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

interface SlackMessagesProps {
  userRole: 'admin' | 'director' | 'staff' | 'hr' | 'management';
}

// Simple SVG Icons
const MessageIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const HashIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const LockIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UsersIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const PaperclipIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const VolumeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6.343 6.343L5 7l5 5-5 5 1.343.657A8 8 0 0111 19.657V4.343a8 8 0 00-4.657 2z" />
  </svg>
);

const VolumeOffIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
  </svg>
);

const SettingsIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SlackMessages: React.FC<SlackMessagesProps> = ({ userRole }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<SlackUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [muted, setMuted] = useState(false);

  const {
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
  } = useSlack();

  // Mock channels based on user role
  const getMockChannels = (): Channel[] => {
    const baseChannels: Channel[] = [
      {
        id: 'general',
        name: 'general',
        isPrivate: false,
        topic: 'Company-wide announcements and general discussion',
        members: 25,
        unread: 0,
        lastActivity: '2 minutes ago'
      }
    ];

    const roleChannels: Record<string, Channel[]> = {
      admin: [
        ...baseChannels,
        {
          id: 'admin-only',
          name: 'admin-only',
          isPrivate: true,
          topic: 'Administrator discussions',
          members: 3,
          unread: 2,
          lastActivity: '15 minutes ago'
        },
        {
          id: 'staff-management',
          name: 'staff-management',
          isPrivate: true,
          topic: 'Staff scheduling and management',
          members: 8,
          unread: 0,
          lastActivity: '1 hour ago'
        }
      ],
      director: [
        ...baseChannels,
        {
          id: 'director-hub',
          name: 'director-hub',
          isPrivate: true,
          topic: 'Executive leadership discussions',
          members: 5,
          unread: 1,
          lastActivity: '30 minutes ago'
        },
        {
          id: 'business-strategy',
          name: 'business-strategy',
          isPrivate: true,
          topic: 'Strategic planning and business decisions',
          members: 4,
          unread: 0,
          lastActivity: '2 hours ago'
        }
      ],
      hr: [
        ...baseChannels,
        {
          id: 'hr-support',
          name: 'hr-support',
          isPrivate: true,
          topic: 'HR issues and employee support',
          members: 6,
          unread: 3,
          lastActivity: '5 minutes ago'
        },
        {
          id: 'hiring',
          name: 'hiring',
          isPrivate: true,
          topic: 'Recruitment and hiring discussions',
          members: 4,
          unread: 0,
          lastActivity: '1 day ago'
        }
      ],
      management: [
        ...baseChannels,
        {
          id: 'operations',
          name: 'operations',
          isPrivate: false,
          topic: 'Daily operations and coordination',
          members: 15,
          unread: 0,
          lastActivity: '10 minutes ago'
        },
        {
          id: 'scheduling',
          name: 'scheduling',
          isPrivate: false,
          topic: 'Staff scheduling coordination',
          members: 12,
          unread: 1,
          lastActivity: '45 minutes ago'
        }
      ],
      staff: [
        ...baseChannels,
        {
          id: 'staff-room',
          name: 'staff-room',
          isPrivate: false,
          topic: 'Staff lounge and casual conversation',
          members: 20,
          unread: 5,
          lastActivity: '1 minute ago'
        },
        {
          id: 'clinic-1-chat',
          name: 'clinic-1-chat',
          isPrivate: false,
          topic: 'Location-specific team coordination',
          members: 8,
          unread: 0,
          lastActivity: '20 minutes ago'
        }
      ]
    };

    return roleChannels[userRole] || baseChannels;
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        displayName: user.profile?.display_name || user.real_name || user.name,
        avatar: user.profile?.image_48 || '',
        isOnline: true,
        title: user.profile?.title
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChannels();
    }
  }, [isAuthenticated, fetchChannels]);

  const handleAuthenticate = async () => {
    setIsConnecting(true);
    try {
      await authenticate();
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    if (isAuthenticated) {
      fetchMessages(channel.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#4A154B] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to Slack</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Access your team's Slack workspace directly from the CRM for seamless communication
          </p>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <HashIcon className="w-4 h-4 text-green-500 mr-2" />
                Role-based channel access
              </li>
              <li className="flex items-center">
                <MessageIcon className="w-4 h-4 text-green-500 mr-2" />
                Real-time messaging
              </li>
              <li className="flex items-center">
                <UsersIcon className="w-4 h-4 text-green-500 mr-2" />
                Team collaboration
              </li>
              <li className="flex items-center">
                <PaperclipIcon className="w-4 h-4 text-green-500 mr-2" />
                File sharing and attachments
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Available Channels for {userRole}:</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              {getMockChannels().map(channel => (
                <li key={channel.id} className="flex items-center">
                  {channel.isPrivate ? <LockIcon className="w-3 h-3 mr-2" /> : <HashIcon className="w-3 h-3 mr-2" />}
                  #{channel.name}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleAuthenticate}
            disabled={isConnecting || isLoading}
            className="w-full bg-[#4A154B] text-white px-8 py-3 rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isConnecting || isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 0 2.5 2.5c1.61 0 2.527-1.88 2.527-2.5a2.528 2.528 0 0 0-2.527-2.5c-.61 0-2.5.89-2.5 2.5zM17.5 15.165a2.528 2.528 0 0 0 2.5 2.5c1.61 0 2.527-1.88 2.527-2.5a2.528 2.528 0 0 0-2.527-2.5c-.61 0-2.5.89-2.5 2.5z"/>
                <path d="M22.084 8.865C22.084 4.017 18.068.001 13.22.001c-4.849 0-8.864 4.016-8.864 8.864 0 1.33.299 2.603.832 3.779l.747 1.664-1.664.747c-1.176.533-2.449.832-3.779.832C4.017 15.887 8.033 19.903 12.881 19.903c4.849 0 8.864-4.016 8.864-8.864 0-1.33-.299-2.603-.832-3.779l-.747-1.664 1.664-.747c1.176-.533 2.449-.832 3.779-.832z"/>
              </svg>
            )}
            {isConnecting || isLoading ? 'Connecting...' : 'Connect to Slack'}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-[700px] flex">
      {/* Sidebar */}
      <SlackSidebar
        channels={channels.length > 0 ? channels : getMockChannels()}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedChannel.isPrivate ? (
                    <LockIcon className="h-5 w-5 text-gray-500 mr-2" />
                  ) : (
                    <HashIcon className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedChannel.name}
                    </h2>
                    {selectedChannel.topic && (
                      <p className="text-sm text-gray-500">{selectedChannel.topic}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    {selectedChannel.members}
                  </div>
                  <button
                    onClick={() => setMuted(!muted)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {muted ? <VolumeOffIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <SettingsIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <SlackThread
              channel={selectedChannel}
              messages={messages}
              currentUser={currentUser}
              onSendMessage={sendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Slack
              </h3>
              <p className="text-gray-600 max-w-md">
                Select a channel from the sidebar to start messaging with your team
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlackMessages; 