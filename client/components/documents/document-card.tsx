"use client";
import { Card, Tag, Typography, Space } from 'antd';
import {
  FilePdfOutlined,
  VideoCameraOutlined,
  FileWordOutlined,
  FireOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;


export const FormatTag = ({ format }: { format: string }) => {
  const f = format?.toLowerCase(); // normalize format for display

  if (f === 'pdf')
    return (
      <Tag color="red" icon={<FilePdfOutlined />} className="border-none">
        PDF
      </Tag>
    );

  if (f === 'video')
    return (
      <Tag color="blue" icon={<VideoCameraOutlined />} className="border-none">
        Video
      </Tag>
    );

  if (f === 'word' || f === 'doc')
    return (
      <Tag color="cyan" icon={<FileWordOutlined />} className="border-none">
        Word
      </Tag>
    );

  return <Tag>TL</Tag>;
};


export const getDocId = (doc: any) => {
  const f = doc.format?.toLowerCase();
  let prefix = 'TL';

  if (f === 'pdf') prefix = 'PDF';
  else if (f === 'video') prefix = 'VID';
  else if (f === 'word' || f === 'doc') prefix = 'DOC';

  return `${prefix}-${doc.id}`;
};


const getLevelTag = (level: string) => {
  switch (level) {
    case 'Cơ bản':
      return { color: 'green' };
    case 'Trung bình':
      return { color: 'blue' };
    case 'Nâng cao':
      return { color: 'volcano' };
    default:
      return { color: 'default' };
  }
};

const isNewDocument = (uploadDate: string) => {
  const [day, month, year] = uploadDate.split('/').map(Number);
  const upload = new Date(year, month - 1, day);
  const now = new Date();

  const diffInDays =
    (now.getTime() - upload.getTime()) / (1000 * 60 * 60 * 24);

  return diffInDays >= 0 && diffInDays <= 7;
};

export default function DocumentCard({
  doc,
  onOpen,
}: {
  doc: any;
  onOpen: (doc: any) => void;
}) {
  const isHot = doc.viewCount >= 300;
  const levelStyle = getLevelTag(doc.level);

  return (
    <Card
      hoverable
      onClick={() => onOpen(doc)}
      className="rounded-xl overflow-hidden border-gray-200
                 transition-all hover:shadow-lg hover:-translate-y-1"
      cover={
        <div className="relative h-40 w-full overflow-hidden border-b border-gray-100">
          <img
            alt={doc.title}
            src={doc.image}
            className="h-full w-full object-cover
                       transition-transform duration-500 hover:scale-110"
          />
        </div>
      }
    >
      {/* HEADER */}
      <div className="mb-3 flex items-start justify-between">
        <Space size={6}>
          <Text className="font-mono text-[10px] px-2 py-0.5 bg-gray-100 rounded">
            {getDocId(doc)}
          </Text>

          {isNewDocument(doc.uploadDate) && (
            <Tag
              color="green"
              className="border-none text-[10px] font-bold"
            >
              NEW
            </Tag>
          )}
        </Space>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full
            text-[11px] font-bold ${
              isHot
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-100 text-gray-500'
            }`}
        >
          {isHot && (
            <FireOutlined className="text-orange-500 animate-pulse" />
          )}
          <span>{doc.viewCount}</span>
        </div>
      </div>

      {/* TITLE */}
      <h4 className="mb-2 min-h-11 font-semibold text-gray-800 line-clamp-2">
        {doc.title}
      </h4>

      {/* TAGS */}
      <Space wrap size={6} className="mb-3">
        <FormatTag format={doc.format} />
        <Tag
          color={levelStyle.color}
          className="border-none font-medium px-2 rounded-sm"
        >
          {doc.level}
        </Tag>
      </Space>

      {/* DESCRIPTION */}
      <Paragraph className="mb-4 text-[11px] italic text-gray-500 line-clamp-2">
        "{doc.description}"
      </Paragraph>

      {/* FOOTER */}
      <div
        className="flex items-center justify-between pt-3
                   border-t border-gray-100 text-[10px]
                   text-gray-400 uppercase tracking-wider"
      >
        <div className="flex items-center gap-1">
          <span>Topic:</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold">
            {doc.topic}
          </span>
        </div>
        <span>{doc.uploadDate}</span>
      </div>
    </Card>
  );
}
