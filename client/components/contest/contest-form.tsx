"use client";

import React, { useState } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Card, 
  Tag, 
  Typography, 
  Pagination, 
  Dropdown, 
  Tooltip,
  Badge,
  Empty 
} from 'antd';
import { 
  SearchOutlined,
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined,
  EyeOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Contest {
  id: string;
  title: string;
  contentPreview: string;
  type: 'Trắc nghiệm' | 'Tự luận' | 'Đúng/Sai';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  status: 'Đã làm' | 'Chưa làm';
  createdAt: string;
  author: string;
}

const mockContests: Contest[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `Q-${1000 + i}`,
  title: `Câu hỏi về React Hooks cơ bản số ${i + 1}`,
  contentPreview: 'Hãy giải thích sự khác biệt chính giữa useEffect và useLayoutEffect trong React và khi nào nên sử dụng chúng?',
  type: 'Trắc nghiệm',
  difficulty: i % 4 === 0 ? 'Khó' : i % 2 === 0 ? 'Trung bình' : 'Dễ',
  status: i % 5 === 0 ? 'Chưa làm' : 'Đã làm',
  createdAt: '15/01/2026',
  author: 'Admin User'
}));

// --- 2. Helper Components ---
const DifficultyBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    'Dễ': 'bg-green-100 text-green-700',
    'Trung bình': 'bg-orange-100 text-orange-700',
    'Khó': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
};

const TypeTag = ({ type }: { type: string }) => {
  const map: Record<string, { color: string; label: string }> = {
    'Trắc nghiệm': { color: 'blue', label: 'Trắc nghiệm' },
  };
  return <Tag color={map[type].color}>{map[type].label}</Tag>;
};

// --- 3. Main Component ---
export default function ContestForm() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="mb-6 text-gray-800">Thư viện cuộc thi</Title>
        {/* TOOLBAR: Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-1 gap-3 min-w-75">
            <Input 
              prefix={<SearchOutlined className="text-gray-400" />} 
              placeholder="Tìm kiếm theo nội dung hoặc mã câu hỏi..." 
              size="large"
              className="max-w-md"
            />
          </div>

          <div className="flex items-center gap-3">
             <Select 
                defaultValue="all" 
                size="large" 
                style={{ width: 120 }}
                options={[
                    { value: 'all', label: 'Tất cả trạng thái'},
                    { value: 'done', label: 'Đã làm' },
                    { value: 'undone', label: 'Chưa làm' },
                ]}
             />
            <Select 
                defaultValue="all" 
                size="large" 
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'Tất cả độ khó' },
                  { value: 'easy', label: 'Dễ' },
                  { value: 'medium', label: 'Trung bình' },
                  { value: 'hard', label: 'Khó' },
                ]}
             />
          </div>
        </div>

        {/* CONTENT GRID */}
        {mockContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockContests.map((item) => (
              <Card 
                key={item.id}
                hoverable
                className="rounded-xl overflow-hidden border-gray-200 transition-all hover:shadow-lg hover:-translate-y-1"
                styles={{ body: { padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' } }}
                actions={[
                  <Tooltip title="Xem chi tiết" key="view"><EyeOutlined /></Tooltip>,
                  <Tooltip title="Chỉnh sửa" key="edit"><EditOutlined /></Tooltip>,
                  <Tooltip title="Nhân bản" key="copy"><CopyOutlined /></Tooltip>,
                  <Dropdown key="more" menu={{ items: [{ label: 'Xóa câu hỏi', key: 'del', danger: true, icon: <DeleteOutlined /> }] }}>
                    <MoreOutlined />
                  </Dropdown>
                ]}
              >
                {/* Header Card: ID & Status */}
                <div className="flex justify-between items-start mb-3">
                  <Text className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.id}
                  </Text>
                  {item.status === 'Chưa làm' ? (
                     <Badge status="default" text={<span className="text-xs text-gray-500">Chưa làm</span>} />
                  ) : (
                     <Badge status="success" text={<span className="text-xs text-green-600">Đã làm</span>} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                  <h4 className="font-semibold text-gray-800 line-clamp-2 mb-2 min-h-12">
                    {item.contentPreview}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <TypeTag type={item.type} />
                    <DifficultyBadge level={item.difficulty} />
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                  <span>Ngày tạo: {item.createdAt}</span>
                  <span>bởi <b>{item.author}</b></span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="Không tìm thấy câu hỏi nào" className="py-20 bg-white rounded-xl" />
        )}

        {/* PAGINATION */}
        <div className="flex justify-center mt-8">
          <Pagination defaultCurrent={1} total={50} showSizeChanger />
        </div>
      </div>
    </div>
  );
}