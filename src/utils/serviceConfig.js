import React from 'react';
import {
  WhatsAppOutlined,
  MailOutlined,
  MessageOutlined,
  SlackOutlined,
  SkypeOutlined,
  TeamOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
  CalendarOutlined,
  CloudOutlined,
  FileOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
  RedditOutlined,
  TikTokOutlined,
  YoutubeOutlined,
  SpotifyOutlined
} from '@ant-design/icons';

// Service configuration object for O(1) lookup
export const SERVICE_CONFIG = {
  whatsapp: {
    icon: React.createElement(WhatsAppOutlined, { style: { fontSize: '20px' } }),
    color: '#25D366',
    url: 'https://web.whatsapp.com'
  },
  gmail: {
    icon: React.createElement(MailOutlined, { style: { color: '#EA4335', fontSize: '20px' } }),
    color: '#EA4335',
    url: 'https://mail.google.com'
  },
  messenger: {
    icon: React.createElement(MessageOutlined, { style: { color: '#0084FF', fontSize: '20px' } }),
    color: '#0084FF',
    url: 'https://www.messenger.com'
  },
  slack: {
    icon: React.createElement(SlackOutlined, { style: { color: '#4A154B', fontSize: '20px' } }),
    color: '#4A154B',
    url: 'https://slack.com'
  },
  telegram: {
    icon: React.createElement(MessageOutlined, { style: { color: '#0088CC', fontSize: '20px' } }),
    color: '#0088CC',
    url: 'https://web.telegram.org'
  },
  discord: {
    icon: React.createElement(MessageOutlined, { style: { color: '#5865F2', fontSize: '20px' } }),
    color: '#5865F2',
    url: 'https://discord.com/app'
  },
  skype: {
    icon: React.createElement(SkypeOutlined, { style: { color: '#00AFF0', fontSize: '20px' } }),
    color: '#00AFF0',
    url: 'https://web.skype.com'
  },
  teams: {
    icon: React.createElement(TeamOutlined, { style: { color: '#6264A7', fontSize: '20px' } }),
    color: '#6264A7',
    url: 'https://teams.microsoft.com'
  },
  facebook: {
    icon: React.createElement(FacebookOutlined, { style: { color: '#1877F2', fontSize: '20px' } }),
    color: '#1877F2',
    url: 'https://www.facebook.com'
  },
  instagram: {
    icon: React.createElement(InstagramOutlined, { style: { color: '#E4405F', fontSize: '20px' } }),
    color: '#E4405F',
    url: 'https://www.instagram.com'
  },
  twitter: {
    icon: React.createElement(TwitterOutlined, { style: { color: '#1DA1F2', fontSize: '20px' } }),
    color: '#1DA1F2',
    url: 'https://twitter.com'
  },
  linkedin: {
    icon: React.createElement(LinkedinOutlined, { style: { color: '#0A66C2', fontSize: '20px' } }),
    color: '#0A66C2',
    url: 'https://www.linkedin.com'
  },
  github: {
    icon: React.createElement(GithubOutlined, { style: { color: '#181717', fontSize: '20px' } }),
    color: '#181717',
    url: 'https://github.com'
  },
  'google-calendar': {
    icon: React.createElement(CalendarOutlined, { style: { color: '#4285F4', fontSize: '20px' } }),
    color: '#4285F4',
    url: 'https://calendar.google.com'
  },
  'google-drive': {
    icon: React.createElement(CloudOutlined, { style: { color: '#4285F4', fontSize: '20px' } }),
    color: '#4285F4',
    url: 'https://drive.google.com'
  },
  notion: {
    icon: React.createElement(FileOutlined, { style: { color: '#000000', fontSize: '20px' } }),
    color: '#000000',
    url: 'https://www.notion.so'
  },
  trello: {
    icon: React.createElement(FileOutlined, { style: { color: '#0079BF', fontSize: '20px' } }),
    color: '#0079BF',
    url: 'https://trello.com'
  },
  spotify: {
    icon: React.createElement(SoundOutlined, { style: { color: '#1DB954', fontSize: '20px' } }),
    color: '#1DB954',
    url: 'https://open.spotify.com'
  },
  zoom: {
    icon: React.createElement(VideoCameraOutlined, { style: { color: '#2D8CFF', fontSize: '20px' } }),
    color: '#2D8CFF',
    url: 'https://zoom.us'
  },
  youtube: {
    icon: React.createElement(YoutubeOutlined, { style: { color: '#FF0000', fontSize: '20px' } }),
    color: '#FF0000',
    url: 'https://www.youtube.com'
  },
  tiktok: {
    icon: React.createElement(TikTokOutlined, { style: { color: '#000000', fontSize: '20px' } }),
    color: '#000000',
    url: 'https://www.tiktok.com'
  },
  reddit: {
    icon: React.createElement(RedditOutlined, { style: { color: '#FF4500', fontSize: '20px' } }),
    color: '#FF4500',
    url: 'https://www.reddit.com'
  },
  salesforce: {
    icon: React.createElement(GlobalOutlined, { style: { color: '#00A1E0', fontSize: '20px' } }),
    color: '#00A1E0',
    url: 'https://login.salesforce.com'
  },
  hubspot: {
    icon: React.createElement(GlobalOutlined, { style: { color: '#FF7A59', fontSize: '20px' } }),
    color: '#FF7A59',
    url: 'https://app.hubspot.com'
  }
};

// Default fallback
export const DEFAULT_SERVICE = {
  icon: React.createElement(MessageOutlined, { style: { fontSize: '20px' } }),
  color: '#1890ff',
  url: 'https://www.google.com'
};

// Fast lookup function
export const getServiceConfig = (iconType) => {
  return SERVICE_CONFIG[iconType] || DEFAULT_SERVICE;
};