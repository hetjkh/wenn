import React from 'react';
import { Button, Tooltip } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  collapsed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle, collapsed = false }) => {
  return (
    <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} placement="right">
      <Button
        type="text"
        icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={onToggle}
        style={{
          width: '100%',
          height: collapsed ? '40px' : '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: isDarkMode ? '#fff' : '#595959',
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDarkMode ? '#434343' : '#f0f0f0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {!collapsed && (
          <span style={{ marginLeft: '8px' }}>
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        )}
      </Button>
    </Tooltip>
  );
};

export default ThemeToggle;