import React, { useState } from 'react';
import { Modal, Card, Space, Typography, Avatar, Input, Button, Form, Tabs, Badge } from 'antd';
import { 
  WhatsAppOutlined, 
  EditOutlined, 
  SearchOutlined,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GoogleOutlined,
  FacebookOutlined,
  InstagramOutlined,
  SkypeOutlined,
  MessageOutlined,
  MailOutlined,
  CalendarOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  SlackOutlined,
  WechatOutlined,
  DingdingOutlined,
  YuqueOutlined,
  BehanceOutlined,
  DribbbleOutlined,
  MediumOutlined,
  RedditOutlined,
  TikTokOutlined,
  YoutubeOutlined,
  SpotifyOutlined,
  SoundOutlined,
  CloudOutlined,
  FileOutlined,
  ShoppingOutlined,
  BankOutlined,
  CreditCardOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface ServiceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectService: (type: string, customName?: string) => void;
  isDarkMode: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ 
  visible, 
  onClose, 
  onSelectService,
  isDarkMode 
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  const allServices = [
    // Most Popular
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Messaging app',
      icon: <WhatsAppOutlined />,
      color: '#25D366',
      category: 'popular',
      url: 'https://web.whatsapp.com'
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Email service',
      icon: <MailOutlined />,
      color: '#EA4335',
      category: 'popular',
      url: 'https://mail.google.com'
    },
    {
      id: 'messenger',
      name: 'Messenger',
      description: 'Facebook Messenger',
      icon: <MessageOutlined />,
      color: '#0084FF',
      category: 'popular',
      url: 'https://www.messenger.com'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication',
      icon: <SlackOutlined />,
      color: '#4A154B',
      category: 'popular',
      url: 'https://slack.com'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Secure messaging',
      icon: <MessageOutlined />,
      color: '#0088CC',
      category: 'popular',
      url: 'https://web.telegram.org'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Voice & text chat',
      icon: <MessageOutlined />,
      color: '#5865F2',
      category: 'popular',
      url: 'https://discord.com/app'
    },
    {
      id: 'skype',
      name: 'Skype',
      description: 'Video calling',
      icon: <SkypeOutlined />,
      color: '#00AFF0',
      category: 'popular',
      url: 'https://web.skype.com'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Team collaboration',
      icon: <TeamOutlined />,
      color: '#6264A7',
      category: 'popular',
      url: 'https://teams.microsoft.com'
    },

    // Social Media
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Social network',
      icon: <FacebookOutlined />,
      color: '#1877F2',
      category: 'social',
      url: 'https://www.facebook.com'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Photo sharing',
      icon: <InstagramOutlined />,
      color: '#E4405F',
      category: 'social',
      url: 'https://www.instagram.com'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      description: 'Social media',
      icon: <TwitterOutlined />,
      color: '#1DA1F2',
      category: 'social',
      url: 'https://twitter.com'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Professional network',
      icon: <LinkedinOutlined />,
      color: '#0A66C2',
      category: 'social',
      url: 'https://www.linkedin.com'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Short videos',
      icon: <TikTokOutlined />,
      color: '#000000',
      category: 'social',
      url: 'https://www.tiktok.com'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Video platform',
      icon: <YoutubeOutlined />,
      color: '#FF0000',
      category: 'social',
      url: 'https://www.youtube.com'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: 'Discussion platform',
      icon: <RedditOutlined />,
      color: '#FF4500',
      category: 'social',
      url: 'https://www.reddit.com'
    },

    // Productivity
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repository',
      icon: <GithubOutlined />,
      color: '#181717',
      category: 'productivity',
      url: 'https://github.com'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Calendar app',
      icon: <CalendarOutlined />,
      color: '#4285F4',
      category: 'productivity',
      url: 'https://calendar.google.com'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud storage',
      icon: <CloudOutlined />,
      color: '#4285F4',
      category: 'productivity',
      url: 'https://drive.google.com'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'All-in-one workspace',
      icon: <FileOutlined />,
      color: '#000000',
      category: 'productivity',
      url: 'https://www.notion.so'
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Project management',
      icon: <FileOutlined />,
      color: '#0079BF',
      category: 'productivity',
      url: 'https://trello.com'
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Task management',
      icon: <FileOutlined />,
      color: '#F06A6A',
      category: 'productivity',
      url: 'https://app.asana.com'
    },

    // Entertainment
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Music streaming',
      icon: <SpotifyOutlined />,
      color: '#1DB954',
      category: 'entertainment',
      url: 'https://open.spotify.com'
    },
    {
      id: 'netflix',
      name: 'Netflix',
      description: 'Video streaming',
      icon: <VideoCameraOutlined />,
      color: '#E50914',
      category: 'entertainment',
      url: 'https://www.netflix.com'
    },
    {
      id: 'twitch',
      name: 'Twitch',
      description: 'Live streaming',
      icon: <VideoCameraOutlined />,
      color: '#9146FF',
      category: 'entertainment',
      url: 'https://www.twitch.tv'
    },

    // Business
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Video conferencing',
      icon: <VideoCameraOutlined />,
      color: '#2D8CFF',
      category: 'business',
      url: 'https://zoom.us'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM platform',
      icon: <BankOutlined />,
      color: '#00A1E0',
      category: 'business',
      url: 'https://login.salesforce.com'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Marketing platform',
      icon: <BankOutlined />,
      color: '#FF7A59',
      category: 'business',
      url: 'https://app.hubspot.com'
    }
  ];

  const categories = [
    { key: 'popular', label: 'Most popular', count: allServices.filter(s => s.category === 'popular').length },
    { key: 'all', label: 'All services', count: allServices.length },
    { key: 'social', label: 'Social Media', count: allServices.filter(s => s.category === 'social').length },
    { key: 'productivity', label: 'Productivity', count: allServices.filter(s => s.category === 'productivity').length },
    { key: 'entertainment', label: 'Entertainment', count: allServices.filter(s => s.category === 'entertainment').length },
    { key: 'business', label: 'Business', count: allServices.filter(s => s.category === 'business').length }
  ];

  const getFilteredServices = (category: string) => {
    let filtered = category === 'all' ? allServices : allServices.filter(s => s.category === category);
    
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service.id);
    setCustomName(`${service.name} Account`);
  };

  const handleConfirm = () => {
    if (selectedService && customName.trim()) {
      onSelectService(selectedService, customName.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedService(null);
    setCustomName('');
    setSearchTerm('');
    form.resetFields();
    onClose();
  };

  const selectedServiceData = allServices.find(s => s.id === selectedService);

  return (
    <Modal
      title={
        <div style={{ 
          background: 'linear-gradient(135deg, #1890ff, #722ed1)',
          color: 'white',
          padding: '16px 24px',
          margin: '-16px -24px 16px -24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Space>
            <EditOutlined />
            Available services
          </Space>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      className={isDarkMode ? 'dark-modal' : ''}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0 }}
    >
      {!selectedService ? (
        <div style={{ height: '600px', display: 'flex' }}>
          {/* Left Sidebar */}
          <div style={{
            width: '200px',
            background: isDarkMode ? '#141414' : '#f8f9fa',
            borderRight: `1px solid ${isDarkMode ? '#434343' : '#e8e8e8'}`,
            padding: '16px 0'
          }}>
            <div style={{ padding: '0 16px', marginBottom: '16px' }}>
              <Text strong style={{ color: isDarkMode ? '#fff' : '#262626', fontSize: '14px' }}>
                Categories
              </Text>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categories.map(category => (
                <div
                  key={category.key}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: isDarkMode ? '#fff' : '#262626',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#1f1f1f' : '#e6f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{category.label}</span>
                  <Badge 
                    count={category.count} 
                    style={{ 
                      backgroundColor: isDarkMode ? '#434343' : '#d9d9d9',
                      color: isDarkMode ? '#fff' : '#595959',
                      fontSize: '11px'
                    }} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Search Bar */}
            <div style={{ 
              padding: '16px 24px',
              borderBottom: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`
            }}>
              <Input
                placeholder="Search service"
                prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: isDarkMode ? '#1f1f1f' : '#fff',
                  borderColor: isDarkMode ? '#434343' : '#d9d9d9',
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </div>

            {/* Tabs */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Tabs 
                defaultActiveKey="popular" 
                style={{ height: '100%' }}
                tabBarStyle={{ 
                  padding: '0 24px',
                  margin: 0,
                  background: isDarkMode ? '#000' : '#fff'
                }}
              >
                {categories.map(category => (
                  <TabPane 
                    tab={
                      <span style={{ color: isDarkMode ? '#fff' : undefined }}>
                        {category.label}
                      </span>
                    } 
                    key={category.key}
                  >
                    <div style={{ 
                      padding: '24px',
                      height: '400px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '16px'
                      }}>
                        {getFilteredServices(category.key).map(service => (
                          <Card
                            key={service.id}
                            hoverable
                            onClick={() => handleServiceSelect(service)}
                            style={{ 
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
                              background: isDarkMode ? '#141414' : '#fff',
                              borderRadius: '8px',
                              height: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                            bodyStyle={{ 
                              padding: '16px 8px',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = service.color;
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = `0 8px 24px ${service.color}20`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#f0f0f0';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = isDarkMode ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          >
                            <div style={{
                              fontSize: '32px',
                              color: service.color,
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {service.icon}
                            </div>
                            <div>
                              <Text strong style={{ 
                                color: isDarkMode ? '#fff' : '#262626',
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '2px'
                              }}>
                                {service.name}
                              </Text>
                              <Text type="secondary" style={{ 
                                fontSize: '10px',
                                lineHeight: '1.2'
                              }}>
                                {service.description}
                              </Text>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {getFilteredServices(category.key).length === 0 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '40px',
                          color: isDarkMode ? '#8c8c8c' : '#8c8c8c'
                        }}>
                          <Text type="secondary">No services found</Text>
                        </div>
                      )}
                    </div>
                  </TabPane>
                ))}
              </Tabs>
            </div>

            {/* Missing Service Link */}
            <div style={{ 
              padding: '16px 24px',
              borderTop: `1px solid ${isDarkMode ? '#434343' : '#f0f0f0'}`,
              textAlign: 'right'
            }}>
              <Button type="link" style={{ color: '#1890ff', fontSize: '12px' }}>
                Missing a service? →
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px' }}>
          <Title level={4} style={{ color: isDarkMode ? '#fff' : undefined }}>
            Customize your {selectedServiceData?.name} service
          </Title>
          <Text type="secondary">
            Give your service a custom name to easily identify it
          </Text>

          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: '24px' }}
            onFinish={handleConfirm}
          >
            <Form.Item
              label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Service Name</span>}
              name="serviceName"
              rules={[
                { required: true, message: 'Please enter a service name' },
                { min: 1, max: 50, message: 'Name must be between 1-50 characters' }
              ]}
              initialValue={customName}
            >
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a custom name for this service"
                size="large"
                prefix={
                  <div style={{ color: selectedServiceData?.color, fontSize: '16px' }}>
                    {selectedServiceData?.icon}
                  </div>
                }
                style={{
                  background: isDarkMode ? '#1f1f1f' : '#fff',
                  borderColor: isDarkMode ? '#434343' : '#d9d9d9',
                  color: isDarkMode ? '#fff' : undefined
                }}
              />
            </Form.Item>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <Button onClick={() => setSelectedService(null)}>
                Back
              </Button>
              <Button 
                type="primary" 
                icon={selectedServiceData?.icon}
                onClick={handleConfirm}
                disabled={!customName.trim()}
                style={{
                  background: selectedServiceData?.color,
                  borderColor: selectedServiceData?.color
                }}
              >
                Add Service
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default ServiceSelector;