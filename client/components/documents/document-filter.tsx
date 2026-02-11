"use client";
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function DocumentFilter({
  onSearch,
  onTopicChange,
  onTypeChange,
  onLevelChange,
}: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
      <Input
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Tìm kiếm tài liệu..."
        size="large"
        className="max-w-md"
        allowClear
        onChange={(e) => onSearch(e.target.value)}
      />

      <Space wrap>
        <Select
          defaultValue="ALL"
          size="large"
          style={{ width: 150 }}
          onChange={(val) => onTopicChange(val === 'ALL' ? '' : val)}
          options={[
            { value: 'ALL', label: 'Tất cả chủ đề' },
            { value: 'Dân sự', label: 'Dân sự' },
            { value: 'Hình sự', label: 'Hình sự' },
            { value: 'Đất đai', label: 'Đất đai' },
          ]}
        />

        <Select
          defaultValue="ALL"
          size="large"
          style={{ width: 140 }}
          onChange={(val) => onTypeChange(val === 'ALL' ? '' : val)}
          options={[
            { value: 'ALL', label: 'Tất cả loại' },
            { value: 'PDF', label: 'PDF' },
            { value: 'Video', label: 'Video' },
            { value: 'Word', label: 'Word' },
          ]}
        />

        <Select
          defaultValue="ALL"
          size="large"
          style={{ width: 160 }}
          onChange={(val) => onLevelChange(val === 'ALL' ? '' : val)}
          options={[
            { value: 'ALL', label: 'Tất cả mức độ' },
            { value: 'Cơ bản', label: 'Cơ bản' },
            { value: 'Trung bình', label: 'Trung bình' },
            { value: 'Nâng cao', label: 'Nâng cao' },
          ]}
        />
      </Space>
    </div>
  );
}
