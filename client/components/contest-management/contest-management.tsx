"use client";

import React from "react";  
import { Form, Table, Tag, Button, Space, Input, Typography, message, Card, Modal, DatePicker } from "antd";

import type {Dayjs} from "dayjs"
import { PlusOutlined, SearchOutlined, CopyOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";

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

const CreateContest = () => {
  interface valueProps {
    name: string,
    code: string,
    description?: string
    duration: [Dayjs, Dayjs]
  }
  const [form] = Form.useForm()
  const { RangePicker } = DatePicker;
  const onFinish = (values: valueProps) => {
    const newContest: Contest = {
      key: "",
      code: values.code,
      name: values.name,
      category: "",
      startDate: values.duration[0].format("YYYY-MM-DD"),
      endDate: values.duration[1].format("YYYY-MM-DD"),
      status: "Ongoing",
    }
    console.log(newContest);
    message.success("Tạo cuộc thi thành công")
    form.resetFields();
  }
  return (
      <Card title="Tạo cuộc thi mới" style={{ maxWidth: 800, margin: "20px auto" }}>
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ maxParticipants: 100 }}
        >
          <Form.Item
              label="Tên cuộc thi"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên cuộc thi!" }]}
          >
            <Input placeholder="Ví dụ: Lập trình thuật toán 2024" />
          </Form.Item>
          <Form.Item
              label="Mã cuộc thi"
              name="code"
              rules={[
                { required: true, message: "Vui lòng nhập mã!" },
                { pattern: /^[A-Z0-9_]+$/, message: "Mã chỉ gồm chữ in hoa, số và dấu gạch dưới" }
              ]}
          >
            <Input placeholder="Vd: CONTEST_01" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Thời gian diễn ra */}
            <Form.Item
                label="Thời gian diễn ra"
                name="duration"
                rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
            >
              <RangePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          {/* Mô tả cuộc thi */}
          <Form.Item label="Mô tả cuộc thi" name="description">
            <Input.TextArea rows={4} placeholder="Nhập nội dung cuộc thi..." />
          </Form.Item>

          {/* Nút bấm */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Tạo cuộc thi
              </Button>
              <Button htmlType="button" onClick={() => form.resetFields()}>
                Làm mới
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
  )
}

export default function ContestManagement() {
  const [showCreateContest, setShowCreateContest] = useState(false);
  const startTime = new Date();
  const endTime = new Date(startTime)

  endTime.setHours(endTime.getDate() + 1);

  const [data, setData] = useState<Contest[]>([{
    key: "",
    code: "001",
    name: "Thi cuối kỳ 1",
    category: "Constest",
    startDate: startTime.toLocaleDateString(),
    endDate: endTime.toLocaleDateString(),
    status: "Ongoing",
  }]);

  const RemoveContest = (contestCode: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có muốn xóa cuộc thi ${contestCode} không?`,
      onOk: () => {
        const newData = data.filter((item) => item.code !== contestCode);
        setData(newData);
        message.success("Delete completed")
      }
    })
  }
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
      render: (_, contest) => (
        <Space>
          <Button type="link" size="small">
            Sửa
          </Button>
          <Button type="link" size="small" danger onClick={() => RemoveContest(contest.code)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
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
            onClick={() => setShowCreateContest(true)}
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
        {showCreateContest && (
            <div className="flex flex-col items-center justify-center w-full">
              <CreateContest></CreateContest>
              <Button variant="link" className="w-80" onClick={()  => setShowCreateContest(false)}>Đóng</Button>
            </div>
        )}
      </div>
    </div>
  );
}

