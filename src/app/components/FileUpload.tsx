// src/app/components/FileUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { uploadData } from '@aws-amplify/storage';
import { ArrowUpTrayIcon, DocumentArrowUpIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // Using Heroicons for better UI
import { customAlphabet } from 'nanoid/non-secure';
const nano = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

interface FileUploadProps {
    onUploadSuccess: (info: { slug: string; s3Path: string }) => void;
}
  
const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFile(null);
        setError('Invalid file type. Please select a PDF.');
        setMessage(null);
        return;
      }
      
      if (selectedFile.size > 20 * 1024 * 1024) { // 20MB in bytes
        setFile(null);
        setError('File is too large. Maximum size is 20MB.');
        setMessage(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setMessage(`${selectedFile.name} selected.`);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('No file selected. Please choose a PDF to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);
    setMessage('Preparing upload...');

    const base = file.name.replace(/\.[^.]+$/, '')          // drop extension
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');           // no spaces
    const slug = `${base}-${nano()}`;   // e.g. portfolio_showcase-cvb44g
    const uploadPath = `public/${slug}.pdf`; 

    try {
      const uploadTask = uploadData({
        path: uploadPath,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const percentage = Math.round((transferredBytes / totalBytes) * 100);
              setProgress(percentage);
              setMessage(`Uploading: ${percentage}%`);
            }
          },
        },
      });
      console.log('Upload task started:', uploadTask);
      const result = await uploadTask.result;
      
      setMessage(`Successfully uploaded: ${file.name}`);
      setProgress(100);
      onUploadSuccess({ slug, s3Path: result.path });
      setFile(null); // Reset file state
      if (fileInputRef.current) { // Reset the actual file input value
        fileInputRef.current.value = "";
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
      setMessage(null);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Function to trigger the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-lg text-center">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Upload Your PDF</h2>

      {/* Custom File Input Area */}
      <div 
        className={`border-2 border-dashed rounded-md p-8 mb-6 cursor-pointer hover:border-blue-500 transition-colors duration-150 ease-in-out ${error ? 'border-red-400' : 'border-gray-300'}`}
        onClick={triggerFileInput}
        onDragOver={(e) => e.preventDefault()} // Necessary for drop
        onDrop={(e) => { // Basic drag and drop
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile.type !== 'application/pdf') {
                    setFile(null);
                    setError('Invalid file type. Please drop a PDF.');
                    setMessage(null);
                    return;
                }
                
                if (droppedFile.size > 20 * 1024 * 1024) { // 20MB in bytes
                    setFile(null);
                    setError('File is too large. Maximum size is 20MB.');
                    setMessage(null);
                    return;
                }

                setFile(droppedFile);
                setError(null);
                setMessage(`${droppedFile.name} selected.`);
                setProgress(0);
            }
        }}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange} 
          className="hidden" // Hide the default input
          ref={fileInputRef}
          id="pdf-upload-input"
        />
        <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-500">
          {file ? `Selected: ${file.name}` : "Click to browse or drag & drop a PDF here"}
        </p>
        {file && <p className="text-sm text-gray-400 mt-1">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>}
      </div>
      
      {/* Upload Button */}
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading} 
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-opacity duration-150 ease-in-out"
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {message || `Uploading... ${progress}%`}
          </>
        ) : (
          <>
            <DocumentArrowUpIcon className="w-5 h-5 mr-2" />
            Upload & Create Flipbook
          </>
        )}
      </button>
      
      {/* Progress Bar and Messages */}
      {uploading && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-150 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {!uploading && message && !error && progress === 100 && ( // Success message
        <div className="mt-4 flex items-center text-green-600">
          <CheckCircleIcon className="w-5 h-5 mr-2" /> 
          <p>{message}</p>
        </div>
      )}
      {error && ( // Error message
        <div className="mt-4 flex items-center text-red-600">
          <XCircleIcon className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;