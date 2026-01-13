"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Card, 
  Typography, 
  Badge,
  Tooltip,
  Dropdown
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  FilterOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// --- Interfaces ---
interface Question {
  id: string;
  key: string;
  content: string;
  type: 'Trắc nghiệm' | 'Tự luận';
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  category: string;
  status: 'Đã đăng tải' | 'Bản nháp' | 'Lưu trữ';
  updatedAt: string;
}

// --- Mock Data ---
const mockData: Question[] = [
  {
    id: 'Q-001',
    key: '1',
    content: 'Mock question content for testing purposes 1',
    type: 'Trắc nghiệm',
    difficulty: 'Trung bình',
    category: 'Luật pháp',
    status: 'Đã đăng tải',
    updatedAt: '2024-03-20',
  },
    {
    id: 'Q-002',
    key: '2',
    content: 'Mock question content for testing purposes 2',
    type: 'Trắc nghiệm',
    difficulty: 'Khó',
    category: 'Luật pháp',
    status: 'Bản nháp',
    updatedAt: '2024-03-20',
  },
];

const QuestionManagement = () => {
    const [searchText, setSearchText] = useState('');
    const router = useRouter();
  // --- Table Columns Definition ---
    const columns: ColumnsType<Question> = [
        {
        title: 'ID Câu hỏi',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        render: (id) => <Text className="font-mono font-medium text-blue-600">{id}</Text>,
        },
        {
        title: 'Nội dung câu hỏi',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
        render: (text) => <Text strong className="text-gray-800">{text}</Text>,
        },
        {
        title: 'Chủ đề',
        dataIndex: 'category',
        key: 'category',
        render: (cat) => <Tag color="geekblue">{cat}</Tag>,
        },
        {
        title: 'Độ khó',
        dataIndex: 'difficulty',
        key: 'difficulty',
        render: (level: 'Dễ' | 'Trung bình' | 'Khó') => {
            const colors = { 'Dễ': 'green', 'Trung bình': 'orange', 'Khó': 'red' };
            return <Badge color={colors[level]} text={level} />;
        },
        },
        {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            let icon = <CheckCircleOutlined />;
            let color = 'success';
            if (status === 'Bản nháp') { icon = <ClockCircleOutlined />; color = 'default'; }
            if (status === 'Lưu trữ') { icon = <QuestionCircleOutlined />; color = 'error'; }
            return <Tag icon={icon} color={color}>{status}</Tag>;
        },
        },
        {
        title: 'Cập nhật lần cuối',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        className: 'text-gray-500',
        },
        {
        title: 'Hành động',
        key: 'actions',
        fixed: 'right',
        width: 150,
        render: (_, record) => (
            <Space size="middle">
            <Tooltip title="Chỉnh sửa">
                <Button type="text" icon={<EditOutlined className="text-blue-500" />} />
            </Tooltip>
            <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
            <Dropdown menu={{ items: [{ key: '1', label: 'Sao chép' }, { key: '2', label: 'Di chuyển' }] }}>
                <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
            </Space>
        ),
        },
    ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Title level={2} className="mb-1!">Ngân hàng câu hỏi</Title>
          <Text type="secondary">Quản lý và tổ chức các câu hỏi thi của bạn</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => {router.push("/admin/question-management/create-question")}} className="shadow-md h-11 px-6 rounded-lg">
          Tạo câu hỏi mới
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng số câu hỏi', value: '1,240', color: 'bg-blue-50' },
          { label: 'Đã đăng tải', value: '850', color: 'bg-green-50' },
          { label: 'Bản nháp', value: '320', color: 'bg-orange-50' },
          { label: 'Câu hỏi khó', value: '70', color: 'bg-red-50' },
        ].map((stat, i) => (
          <Card key={i} className={`${stat.color} border-none shadow-sm`}>
            <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">{stat.label}</Text>
            <div className="text-2xl font-bold mt-1 text-gray-800">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Filter & Table Section */}
      <Card className="shadow-sm rounded-xl border-none">
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <Input
            placeholder="Tìm kiếm theo ID hoặc nội dung câu hỏi..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md rounded-lg h-10 shadow-sm"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Space>
            <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
            <Button>Xuất CSV</Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={mockData}
          pagination={{ pageSize: 5 }}
          className="overflow-x-auto"
          rowSelection={{ type: 'checkbox' }}
        />
      </Card>
    </div>
  );
};

export default QuestionManagement;