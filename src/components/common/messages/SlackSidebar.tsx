import React, { useState } from 'react';

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

interface SlackSidebarProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: SlackUser | null;
}

// Simple SVG Icons
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

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SearchIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const UserIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SlackSidebar: React.FC<SlackSidebarProps> = ({
  channels,
  selectedChannel,
  onChannelSelect,
  collapsed,
  onToggleCollapse,
  currentUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showChannelTypes, setShowChannelTypes] = useState({
    channels: true,
    directMessages: false
  });

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publicChannels = filteredChannels.filter(c => !c.isPrivate);
  const privateChannels = filteredChannels.filter(c => c.isPrivate);

  const formatTime = (timeString: string) => {
    if (timeString.includes('minute')) return timeString.split(' ')[0] + 'm';
    if (timeString.includes('hour')) return timeString.split(' ')[0] + 'h';
    if (timeString.includes('day')) return timeString.split(' ')[0] + 'd';
    return timeString;
  };

  const ChannelItem: React.FC<{ channel: Channel }> = ({ channel }) => (
    <button
      onClick={() => onChannelSelect(channel)}
      className={`w-full flex items-center px-3 py-1.5 rounded-md text-left transition-colors ${
        selectedChannel?.id === channel.id
          ? 'bg-[#1164A3] text-white'
          : 'text-[#D1D2D3] hover:bg-[#350D36] hover:text-white'
      }`}
    >
      <div className="flex items-center min-w-0 flex-1">
        {channel.isPrivate ? (
          <LockIcon className="h-4 w-4 mr-2 flex-shrink-0" />
        ) : (
          <HashIcon className="h-4 w-4 mr-2 flex-shrink-0" />
        )}
        <span className={`text-sm ${collapsed ? 'hidden' : 'truncate'}`}>
          {channel.name}
        </span>
      </div>
      {!collapsed && channel.unread > 0 && (
        <span className="bg-[#E01E5A] text-white text-xs px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
          {channel.unread}
        </span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <div className="w-16 bg-[#4A154B] border-r border-[#350D36] flex flex-col">
        {/* Collapse Toggle */}
        <div className="p-3 border-b border-[#350D36]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#D1D2D3] hover:bg-[#350D36] rounded-md transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.slice(0, 8).map(channel => (
            <div key={channel.id} className="relative">
              <button
                onClick={() => onChannelSelect(channel)}
                className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                  selectedChannel?.id === channel.id
                    ? 'bg-[#1164A3] text-white'
                    : 'text-[#D1D2D3] hover:bg-[#350D36] hover:text-white'
                }`}
                title={`#${channel.name}`}
              >
                {channel.isPrivate ? (
                  <LockIcon className="h-4 w-4" />
                ) : (
                  <HashIcon className="h-4 w-4" />
                )}
              </button>
              {channel.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E01E5A] rounded-full"></div>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="p-3 border-t border-[#350D36]">
            <div className="relative">
              <div className="w-8 h-8 rounded-md overflow-hidden">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#611f69] flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              {currentUser.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2BAC76] border-2 border-[#4A154B] rounded-full"></div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#4A154B] border-r border-[#350D36] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#350D36]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-lg font-bold">Salon CRM</h1>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-[#D1D2D3] hover:bg-[#350D36] rounded transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#D1D2D3]" />
          <input
            type="text"
            placeholder="Search channels"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#350D36] text-white placeholder-[#D1D2D3] pl-10 pr-4 py-2 rounded-md text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#1164A3]"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto">
        {/* Public Channels */}
        <div className="p-3">
          <button
            onClick={() => setShowChannelTypes(prev => ({ ...prev, channels: !prev.channels }))}
            className="flex items-center w-full text-[#D1D2D3] hover:text-white text-sm font-medium mb-2 transition-colors"
          >
            {showChannelTypes.channels ? (
              <ChevronDownIcon className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRightIcon className="h-3 w-3 mr-1" />
            )}
            Channels
          </button>

          {showChannelTypes.channels && (
            <div className="space-y-0.5 ml-2">
              {publicChannels.map(channel => (
                <ChannelItem key={channel.id} channel={channel} />
              ))}
              <button className="w-full flex items-center px-3 py-1.5 text-[#D1D2D3] hover:text-white text-sm transition-colors">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add channels
              </button>
            </div>
          )}
        </div>

        {/* Private Channels */}
        {privateChannels.length > 0 && (
          <div className="p-3">
            <button
              onClick={() => setShowChannelTypes(prev => ({ ...prev, directMessages: !prev.directMessages }))}
              className="flex items-center w-full text-[#D1D2D3] hover:text-white text-sm font-medium mb-2 transition-colors"
            >
              {showChannelTypes.directMessages ? (
                <ChevronDownIcon className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRightIcon className="h-3 w-3 mr-1" />
              )}
              Private
            </button>

            {showChannelTypes.directMessages && (
              <div className="space-y-0.5 ml-2">
                {privateChannels.map(channel => (
                  <ChannelItem key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile */}
      {currentUser && (
        <div className="p-3 border-t border-[#350D36]">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="w-8 h-8 rounded-md overflow-hidden">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#611f69] flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              {currentUser.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#2BAC76] border-2 border-[#4A154B] rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">
                {currentUser.displayName}
              </div>
              {currentUser.title && (
                <div className="text-[#D1D2D3] text-xs truncate">
                  {currentUser.title}
                </div>
              )}
            </div>
            <button className="p-1 text-[#D1D2D3] hover:bg-[#350D36] rounded transition-colors">
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlackSidebar; 