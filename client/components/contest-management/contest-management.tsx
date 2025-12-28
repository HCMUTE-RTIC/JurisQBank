"use client";

import React from "react";  
import { Table, Tag, Button, Space, Input, Typography } from "antd";
import { PlusOutlined, SearchOutlined, CopyOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

type ContestStatus = "Ongoing" | "Upcoming" | "Ended";

interface Contest {
  key: string;
  code: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
}

const getStatusLabel = (status?: ContestStatus) => {
  if (!status) return "—";

  if (status === "Ongoing") return "Đang diễn ra";
  if (status === "Upcoming") return "Sắp tới";

  return "Đã kết thúc";
};

const getStatusColor = (status?: ContestStatus) => {
  if (status === "Ongoing") return "green";
  if (status === "Upcoming") return "blue";

  return "default";
};

export default function ContestManagement() {
  const columns: ColumnsType<Contest> = [
    {
      title: "Mã cuộc thi",
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <Text
          copyable={{ icon: <CopyOutlined className="text-gray-400" /> }}
          className="font-mono font-bold text-blue-600"
        >
          {text || "—"}
        </Text>
      ),
    },
    {
      title: "Tên cuộc thi",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-semibold text-gray-700">
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category",
      render: (category: string) => {
        const color =
          category === "Programming"
            ? "geekblue"
            : category === "Design"
            ? "magenta"
            : "orange";

        return <Tag color={color}>{category || "—"}</Tag>;
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => (
        <span className="text-sm text-gray-600 italic">
          {date || "—"}
        </span>
      ),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => (
        <span className="text-sm text-gray-600 italic">
          {date || "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: ContestStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => (
        <Space>
          <Button type="link" size="small">
            Sửa
          </Button>
          <Button type="link" size="small" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const data: Contest[] = [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-blue-400 p-4 rounded-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Quản lý cuộc thi
            </h1>
            <p className="text-gray-100">
              Danh sách và thông tin chi tiết các cuộc thi hiện có
            </p>
          </div>
          <Button
            icon={<PlusOutlined />}
            size="large"
            className="bg-blue-950 font-bold text-blue-300 hover:bg-gray-950"
          >
            Tạo cuộc thi mới
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Tìm theo tên hoặc mã..."
            prefix={<SearchOutlined />}
            className="w-80"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    </div>
  );
}
