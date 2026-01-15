"use client";

import React, { useState, useMemo } from "react";
import {
  Form,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Typography,
  message,
  Modal,
  DatePicker,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  SearchOutlined,
  CopyOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

const { Text } = Typography;
const { RangePicker } = DatePicker;

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

interface CreateContestFormValues {
  name: string;
  code: string;
  description?: string;
  duration: [Dayjs, Dayjs];
}

interface CreateContestFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateContestFormValues) => void;
}

const CreateContestModal: React.FC<CreateContestFormProps> = ({
  visible,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const onOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        onSubmit(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Tạo cuộc thi mới"
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="Tạo"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" initialValues={{ maxParticipants: 100 }}>
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
            {
              pattern: /^[A-Z0-9_]+$/,
              message: "Mã chỉ gồm chữ in hoa, số và dấu gạch dưới",
            },
          ]}
        >
          <Input placeholder="Vd: CONTEST_01" style={{ textTransform: "uppercase" }} />
        </Form.Item>

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

        <Form.Item label="Mô tả cuộc thi" name="description">
          <Input.TextArea rows={4} placeholder="Nhập nội dung cuộc thi..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default function ContestManagement() {
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [searchText, setSearchText] = useState("");

  const startTime = new Date();
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getDate() + 1);

  const [data, setData] = useState<Contest[]>([
    {
      key: "1",
      code: "CONTEST_001",
      name: "Thi cuối kỳ 1 - Giải thuật",
      category: "Programming",
      startDate: startTime.toLocaleDateString("vi-VN"),
      endDate: endTime.toLocaleDateString("vi-VN"),
      status: "Ongoing",
    },
    {
      key: "2",
      code: "WEB_DESIGN_24",
      name: "Thiết kế Web Mùa Thu",
      category: "Design",
      startDate: "01/10/2024",
      endDate: "05/10/2024",
      status: "Ended",
    },
  ]);

  const handleCreateContest = (values: CreateContestFormValues) => {
    const newContest: Contest = {
      key: Date.now().toString(),
      code: values.code,
      name: values.name,
      category: "Programming",
      startDate: values.duration[0].format("DD/MM/YYYY"),
      endDate: values.duration[1].format("DD/MM/YYYY"),
      status: "Upcoming",
    };
    setData([...data, newContest]);
    setShowCreateContest(false);
    message.success("Tạo cuộc thi thành công");
  };

  const removeContest = (contestCode: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có muốn xóa cuộc thi ${contestCode} không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        const newData = data.filter((item) => item.code !== contestCode);
        setData(newData);
        message.success("Đã xóa cuộc thi");
      },
    });
  };

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    const lowerSearch = searchText.toLowerCase();
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.code.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchText]);

  const columns: ColumnsType<Contest> = [
    {
      title: "Mã cuộc thi",
      dataIndex: "code",
      key: "code",
      render: (text) => (
        <Text
          copyable={{ icon: <CopyOutlined className="text-gray-400" /> }}
          className="font-mono font-bold text-blue-600"
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Tên cuộc thi",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-semibold text-gray-700">{text}</span>,
    },
    {
      title: "Thể loại",
      dataIndex: "category",
      key: "category",
      render: (category) => {
        let color = "geekblue";
        if (category === "Design") color = "magenta";
        else if (category === "General") color = "orange";
        return <Tag color={color}>{category}</Tag>;
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: ContestStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, contest) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small">
            Sửa
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => removeContest(contest.code)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background p-6">
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
        )}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý cuộc thi</h1>
            <p className="text-gray-500 mt-1">
              Danh sách và thông tin chi tiết các cuộc thi hiện có
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateContest(true)}
          >
            Tạo cuộc thi mới
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Tìm theo tên hoặc mã..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full sm:w-80 bg-white/80 backdrop-blur-sm"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            rowKey="key"
          />
        </div>

        {/* Create Modal */}
        <CreateContestModal
          visible={showCreateContest}
          onCancel={() => setShowCreateContest(false)}
          onSubmit={handleCreateContest}
        />
      </div>
    </div>
  );
}

