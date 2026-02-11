"use client";

import React, { useState } from "react";
import {
  Typography,
  Empty,
  Modal,
  Button,
  Pagination,
  Space,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import DocumentFilter from "./document-filter";
import DocumentList from "./document-list";
import { getDocId, FormatTag } from "./document-card";

const { Title, Text, Paragraph } = Typography;

/**
 * Document data structure
 * Used across list, filter and modal
 */
interface Document {
  id: string;
  title: string;
  description: string;
  topic: string;
  level: string;
  format: string;
  author: string;
  uploadDate: string;
  viewCount: number;
  image: string;
}

/**
 * Mock data
 * Assume current date: 07/02/2026
 */
const mockDocuments: Document[] = [
  {
    id: "2001",
    title: "Tổng quan Luật Dân sự Việt Nam 2024",
    description: "Tài liệu hệ thống hóa các nguyên tắc cơ bản của pháp luật dân sự hiện hành.",
    topic: "Dân sự",
    level: "Cơ bản",
    format: "PDF",
    author: "Admin Juris",
    uploadDate: "05/02/2026", 
    viewCount: 120,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&q=80"
  },
  {
    id: "2010",
    title: "Video: Phân tích cấu thành tội phạm Hình sự",
    description: "Bài giảng chuyên sâu về 4 yếu tố cấu thành tội phạm trong luật hình sự.",
    topic: "Hình sự",
    level: "Nâng cao",
    format: "Video",
    author: "Giảng viên Nguyễn Văn A",
    uploadDate: "04/02/2026", 
    viewCount: 450, 
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=500&q=80"
  },
  {
    id: "2020",
    title: "Mẫu đơn khởi kiện tranh chấp đất đai",
    description: "Tổng hợp các mẫu đơn và hướng dẫn viết đơn khởi kiện chuẩn pháp lý.",
    topic: "Đất đai",
    level: "Trung bình",
    format: "Word",
    author: "Luật sư Trần Thanh B",
    uploadDate: "20/01/2026", 
    viewCount: 85,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=500&q=80"
  },
  {
    id: "2030",
    title: "Kỹ năng tư vấn hợp đồng dân sự",
    description: "Video hướng dẫn kỹ năng rà soát và soạn thảo hợp đồng thương mại.",
    topic: "Dân sự",
    level: "Trung bình",
    format: "video",
    author: "Luật sư Lê Thị C",
    uploadDate: "02/02/2026", 
    viewCount: 920, 
    image: "https://images.unsplash.com/photo-1423592707957-3b212afa6733?w=500&q=80"
  },
  {
    id: "2040",
    title: "Tài liệu: Quy trình tố tụng Hình sự",
    description: "Sơ đồ tư duy về các giai đoạn khởi tố, điều tra, truy tố và xét xử.",
    topic: "Hình sự",
    level: "Cơ bản",
    format: "PDF",
    author: "Admin Juris",
    uploadDate: "01/02/2026",
    viewCount: 210,
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&q=80"
  },
  {
    id: "2050",
    title: "Luật Đất đai 2024 và những điểm mới",
    description: "So sánh các điểm thay đổi quan trọng giữa Luật Đất đai cũ và mới.",
    topic: "Đất đai",
    level: "Nâng cao",
    format: "PDF",
    author: "Chuyên gia Đỗ Đức D",
    uploadDate: "06/02/2026", 
    viewCount: 350, 
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500&q=80"
  },
  {
    id: "2060",
    title: "Mẫu di chúc và thủ tục thừa kế",
    description: "Tài liệu hướng dẫn lập di chúc hợp pháp và quy trình khai nhận di sản.",
    topic: "Dân sự",
    level: "Cơ bản",
    format: "Word",
    author: "Luật sư Bùi Văn E",
    uploadDate: "15/01/2026",
    viewCount: 60,
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500&q=80"
  },
  {
    id: "2070",
    title: "Video: Thực hành phiên tòa giả định",
    description: "Video ghi lại diễn biến một phiên tòa giả định về tội trộm cắp tài sản.",
    topic: "Hình sự",
    level: "Trung bình",
    format: "Video",
    author: "CLB Pháp luật",
    uploadDate: "03/02/2026",
    viewCount: 150,
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500&q=80"
  }
];


//  Main page component
export default function DocumentManagement() {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

//  Filter state
  const [filters, setFilters] = useState({
    search: "",
    topic: "",
    type: "",
    level: "",
  });


// Filter logic

  const filteredDocuments = mockDocuments.filter((doc) => {
    const s = filters.search.trim().toLowerCase();
    const t = filters.topic;
    const type = filters.type.toLowerCase();
    const l = filters.level;

    const matchSearch =
      !s ||
      doc.title.toLowerCase().includes(s) ||
      doc.id.toLowerCase().includes(s);

    const matchTopic = !t || t === "ALL" ? true : doc.topic === t;

    const matchType =
      !type || type === "all"
        ? true
        : doc.format.toLowerCase() === type;

    const matchLevel = !l || l === "ALL" ? true : doc.level === l;

    return matchSearch && matchTopic && matchType && matchLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* PAGE TITLE */}
        <Title level={2} className="mb-6 text-gray-800">
          Thư viện tài liệu
        </Title>

        {/* FILTER BAR */}
        <DocumentFilter
          onSearch={(val: string) =>
            setFilters((prev) => ({ ...prev, search: val }))
          }
          onTopicChange={(val: string | null) =>
            setFilters((prev) => ({ ...prev, topic: val || "" }))
          }
          onTypeChange={(val: string | null) =>
            setFilters((prev) => ({ ...prev, type: val || "" }))
          }
          onLevelChange={(val: string | null) =>
            setFilters((prev) => ({ ...prev, level: val || "" }))
          }
        />

        {/* DOCUMENT LIST CONTAINER */}
        <div className="bg-white rounded-xl p-6">
          {filteredDocuments.length > 0 ? (
            <DocumentList
              docs={filteredDocuments}
              onOpenDoc={setSelectedDoc}
            />
          ) : (
            <Empty description="Không tìm thấy tài liệu nào" />
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-8">
          <Pagination
            defaultCurrent={1}
            total={filteredDocuments.length}
            pageSize={8}
          />
        </div>

        {/* DOCUMENT DETAIL MODAL */}
        <Modal
          title={
            <Text type="secondary" className="font-mono text-sm">
              Chi tiết tài liệu:{" "}
              {selectedDoc ? getDocId(selectedDoc) : ""}
            </Text>
          }
          open={!!selectedDoc}
          onCancel={() => setSelectedDoc(null)}
          width={600}
          footer={[
            <Button key="close" onClick={() => setSelectedDoc(null)}>
              Đóng
            </Button>,
            <Button key="download" icon={<DownloadOutlined />}>
              Tải về
            </Button>,
            <Button key="view" type="primary" icon={<EyeOutlined />}>
              Xem online
            </Button>,
          ]}
        >
          {selectedDoc && (
            <div className="py-2">
              {/* DOCUMENT TITLE */}
              <Title level={3} className="mb-2">
                {selectedDoc.title}
              </Title>

              {/* FORMAT & LEVEL TAGS */}
              <Space className="mb-4">
                <FormatTag format={selectedDoc.format} />
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedDoc.level === "Cơ bản"
                      ? "bg-green-100 text-green-700"
                      : selectedDoc.level === "Trung bình"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedDoc.level}
                </span>
              </Space>

              {/* DESCRIPTION */}
              <div className="bg-blue-50 p-5 rounded-xl mb-6 border border-blue-100">
                <Paragraph className="italic text-gray-700 text-base mb-0 leading-relaxed">
                  "{selectedDoc.description}"
                </Paragraph>
              </div>

              {/* META INFORMATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-blue-500 text-lg" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">
                      Tác giả
                    </div>
                    <Text strong>{selectedDoc.author}</Text>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-red-500 text-lg" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">
                      Ngày cập nhật
                    </div>
                    <Text strong>{selectedDoc.uploadDate}</Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
