"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 🟢 Dynamically import the editor with SSR disabled
const Editor = dynamic(() => import('@/components/quill/text-config'), { 
  ssr: false, 
  loading: () => (
    <div className="h-64 w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
      Loading Editor...
    </div>
  )
});

export default function Page() {
  const [content, setContent] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Tạo câu hỏi mới</h1>
          <button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors"
          >
            Đăng tải
          </button>
        </div>

        {/* Editor Container */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung câu hỏi
          </label>
          <Editor 
            value={content} 
            onChange={setContent} 
          />
        </div>
      </div>
    </div>
  );
}