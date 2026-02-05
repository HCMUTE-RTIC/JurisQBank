"use client";

import React from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Import standard Quill styles


interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: EditorProps) => {
  // Custom Toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'code-block'],
      ['clean'] // 'Remove formatting' button
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 
    'link', 'image', 'code-block', 'color', 'background'
  ];

  return (
    <div className="relative w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* ReactQuill Wrapper */}
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write something amazing...'}
        className="h-full"
      />
    </div>
  );
};

export default RichTextEditor;