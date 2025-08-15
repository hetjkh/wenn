import React, { useState } from 'react';
import { Modal, Input, Button, Typography, Space, Form } from 'antd';
import { AppstoreOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface WorkspaceCreatorProps {
  visible: boolean;
  onClose: () => void;
  onCreateWorkspace: (name: string) => void;
  isDarkMode: boolean;
}

const WorkspaceCreator: React.FC<WorkspaceCreatorProps> = ({
  visible,
  onClose,
  onCreateWorkspace,
  isDarkMode
}) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [form] = Form.useForm();

  const handleCreate = () => {
    if (workspaceName.trim()) {
      onCreateWorkspace(workspaceName.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setWorkspaceName('');
    form.resetFields();
    onClose();
  };

  const suggestedNames = [
    'Personal',
    'Work',
    'Family',
    'Business',
    'Team',
    'Projects'
  ];

  return (
    <Modal
      title={
        <Space>
          <AppstoreOutlined />
          Create New Workspace
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      className={isDarkMode ? 'dark-modal' : ''}
    >
      <div style={{ padding: '16px 0' }}>
        <Title level={4} style={{ color: isDarkMode ? '#fff' : undefined }}>
          Create a new workspace
        </Title>
        <Text type="secondary">
          Workspaces help you organize different messaging accounts separately. 
          Each workspace can contain multiple services.
        </Text>

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: '24px' }}
          onFinish={handleCreate}
        >
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Workspace Name</span>}
            name="workspaceName"
            rules={[
              { required: true, message: 'Please enter a workspace name' },
              { min: 1, max: 50, message: 'Name must be between 1-50 characters' }
            ]}
          >
            <Input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Enter workspace name (e.g., Personal, Work, Family)"
              size="large"
              prefix={<AppstoreOutlined />}
              style={{
                background: isDarkMode ? '#1f1f1f' : '#fff',
                borderColor: isDarkMode ? '#434343' : '#d9d9d9',
                color: isDarkMode ? '#fff' : undefined
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
          </Form.Item>

          {/* Suggested Names */}
          <div style={{ marginBottom: '24px' }}>
            <Text 
              type="secondary" 
              style={{ 
                fontSize: '12px',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              Quick suggestions:
            </Text>
            <Space wrap>
              {suggestedNames.map(name => (
                <Button
                  key={name}
                  size="small"
                  type="text"
                  onClick={() => setWorkspaceName(name)}
                  style={{
                    border: `1px solid ${isDarkMode ? '#434343' : '#d9d9d9'}`,
                    borderRadius: '16px',
                    fontSize: '12px',
                    height: '28px',
                    color: isDarkMode ? '#fff' : '#595959'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1890ff';
                    e.currentTarget.style.color = '#1890ff';
                    e.currentTarget.style.background = isDarkMode ? '#1890ff10' : '#e6f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDarkMode ? '#434343' : '#d9d9d9';
                    e.currentTarget.style.color = isDarkMode ? '#fff' : '#595959';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {name}
                </Button>
              ))}
            </Space>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            marginTop: '24px'
          }}>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
              disabled={!workspaceName.trim()}
              style={{
                background: 'linear-gradient(135deg, #1890ff, #722ed1)',
                border: 'none'
              }}
            >
              Create Workspace
            </Button>
          </div>
        </Form>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: isDarkMode ? '#1f1f1f' : '#f0f2f5', 
          borderRadius: '8px',
          border: isDarkMode ? '1px solid #434343' : 'none'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>💡 Examples:</strong>
            <br />
            • <strong>Personal</strong> - Your personal WhatsApp accounts
            <br />
            • <strong>Work</strong> - Business and professional accounts
            <br />
            • <strong>Family</strong> - Family group chats and relatives
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default WorkspaceCreator;