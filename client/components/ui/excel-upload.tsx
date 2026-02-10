"use client";

import React, { useState, useRef, DragEvent } from 'react';
import { Button, message, Typography, Tooltip, Progress } from 'antd';
import { 
  CloudUploadOutlined, 
  FileExcelOutlined, 
  DeleteOutlined, 
  PaperClipOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface ExcelUploaderProps {
  onUpload?: (files: File[]) => void;
  onComplete?: () => void;
}

const ExcelUploaderComponent = ({ onUpload, onComplete }: ExcelUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    // Check by type or extension
    const isValidType = validTypes.includes(file.type);
    const isValidExt = /\.(xlsx|xls|csv)$/i.test(file.name);

    if (!isValidType && !isValidExt) {
      message.error(`${file.name} không phải là tệp Excel hoặc CSV hợp lệ.`);
      return false;
    }

    // Check for duplicates
    const isDuplicate = fileList.some(f => f.name === file.name && f.size === file.size);
    if (isDuplicate) {
      message.warning(`${file.name} đã tồn tại.`);
      return false;
    }

    return true;
  };

  // --- Event Handlers ---
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setFileList((prev) => [...prev, ...validFiles]);
      message.success(`Đã thêm ${validFiles.length} file(s).`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(validateFile);

      if (validFiles.length > 0) {
        setFileList((prev) => [...prev, ...validFiles]);
        message.success(`Đã thêm ${validFiles.length} file.`);
      }
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove: number) => {
    setFileList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadClick = () => {
    if (fileList.length === 0) {
        message.warning("Vui lòng chọn tập tin trước!");
        return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    // TODO: Replace this with actual backend API call when it's ready
    // Simulate upload progress for 5 seconds
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Schedule state updates and callbacks after clearing interval
          setTimeout(() => {
            setIsUploading(false);
            setFileList([]);
            message.success('Đăng tải thành công!');
            if (onUpload) {
              onUpload(fileList);
            }
            if (onComplete) {
              onComplete();
            }
          }, 0);
          
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Text strong>Đang đăng tải...</Text>
          <Progress
            percent={Math.round(Math.min(uploadProgress, 100))}
            status="active"
            style={{ width: '100%' }}
          />
        </div>
      ) : (
        <>
      <div className="mb-4">
        <Title level={4} style={{ margin: 0 }}>Đăng tải file Excel</Title>
        <Text type="secondary">Kéo và thả file Excel ở đây.</Text>
      </div>

      {/* 1. DROP ZONE (Always Visible) */}
      <div
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-lg h-40
          flex flex-col items-center justify-center text-center
          transition-all duration-200 ease-in-out
          ${isDragging 
            ? 'border-green-500 bg-green-50' 
            : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple // Allow multiple files selection
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />

        <div className="pointer-events-none">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors
              ${isDragging ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400 group-hover:text-green-600 group-hover:bg-green-50'}
            `}>
              <CloudUploadOutlined style={{ fontSize: '24px' }} />
            </div>
            
            <p className="text-base font-medium text-gray-700">
              {isDragging ? 'Thả ở đây' : 'Kéo và thả file ở đây'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Hỗ trợ: .xlsx, .xls, .csv (Max 10MB mỗi file)
            </p>
        </div>
      </div>

      {/* 2. FILE LIST (Shows only if files exist) */}
      {fileList.length > 0 && (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-2 px-1">
                <Text strong className="text-gray-500 text-sm">
                    File đã chọn ({fileList.length})
                </Text>
                <Button 
                    size="small" 
                    type="text" 
                    danger 
                    onClick={() => setFileList([])}
                >
                    Xóa tất cả
                </Button>
            </div>

            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {/* Render each file in the list */}
                {fileList.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center shrink-0">
                                <FileExcelOutlined />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-gray-700 truncate block max-w-50 sm:max-w-md">
                                    {file.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatSize(file.size)}
                                </span> 
                            </div>
                        </div>
                        
                        <Tooltip title="Xóa file">
                            <Button 
                                type="text" 
                                size="small"
                                icon={<DeleteOutlined className="text-gray-400 hover:text-red-500" />} 
                                onClick={() => handleRemove(index)}
                            />
                        </Tooltip>
                    </div>
                ))}
            </div>

            {/* 3. UPLOAD ACTION */}
            <div className="mt-6 flex justify-end">
                <Button 
                    type="primary" 
                    size="large"
                    className="bg-green-600 hover:bg-green-500 w-full sm:w-auto"
                    icon={<UploadOutlined />}
                    onClick={handleUploadClick}
                >
                    Đăng tải {fileList.length} file
                </Button>
            </div>
        </div>
      )}

      {/* Empty State Helper (Optional) */}
      {fileList.length === 0 && (
         <div className="mt-4 text-center">
            <Text type="secondary" className="text-xs">
                <PaperClipOutlined className="mr-1" />
                Chưa có file nào ở đây.
            </Text>
         </div>
      )}
        </>
      )}
    </div>
  );
};

export default ExcelUploaderComponent;