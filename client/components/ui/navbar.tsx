"use client";

import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Space, Typography } from 'antd';
import { 
  BellOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  MenuOutlined,
  TrophyOutlined,
  CopyOutlined,
  HomeOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRouter, usePathname } from 'next/navigation';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuProps['items'] = [
    {
      label: 'Trang chủ',
      key: '/home',
      icon: <HomeOutlined />
    },
    {
      label: 'Cuộc thi',
      key: '/contests',
      icon: <TrophyOutlined />,
    },
    {
      label: 'Tài liệu',
      key: '/documents',
      icon: <CopyOutlined />
    },
  ];

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <HomeOutlined />,
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => console.log('Logout clicked'),
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key);
  };

  return (
    <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm h-16">
      
      {/* 1. LEFT: Logo & Brand */}
      <div className="flex items-center gap-4">
        <div className="flex items-center p-2 gap-2 cursor-pointer" onClick={() => router.push('/home')}>
          <span className="text-xl font-bold text-gray-800 tracking-tight hidden md:block">
                JurisQBank
          </span>
        </div>
      </div>

      {/* 2. CENTER: Navigation Menu (Ẩn trên mobile) */}
      <div className="flex-1 justify-center hidden md:flex">
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]} // Highlight menu item dựa trên URL hiện tại
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none bg-transparent w-full max-w-md justify-center [&_.ant-menu-item]:px-6 [&_.ant-menu-item]:font-medium"
        />
      </div>

      {/* 3. RIGHT: Actions & Profile */}
      <Space size="large">
        {/* Nút thông báo */}
        <Badge count={5} size="small" offset={[-2, 2]}>
          <Button type="text" shape="circle" icon={<BellOutlined className="text-lg text-gray-600" />} />
        </Badge>

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <Avatar 
              style={{ backgroundColor: '#f56a00', verticalAlign: 'middle' }} 
              size="large"
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            >
              U
            </Avatar>
            <div className="hidden md:flex flex-col text-left  leading-tight">
              <Text strong className="text-sm">Username</Text>
              <Text type="secondary" className="text-xs">Người dùng</Text>
            </div>
          </div>
        </Dropdown>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button type="text" icon={<MenuOutlined />} />
        </div>
      </Space>
    </Header>
  );
};

export default Navbar;