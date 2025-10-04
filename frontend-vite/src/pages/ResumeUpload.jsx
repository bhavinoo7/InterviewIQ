import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUser } from '../context/UserContext';
import { resumeService } from '../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ResumeUpload = () => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const response = await resumeService.uploadResume(file, user.id);
      console.log(response)
      setUploadResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to upload your resume.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload your resume to generate personalized interview questions using AI.
          We support PDF, DOC, DOCX, and TXT files.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <Loader className="w-12 h-12 text-primary-600 mx-auto animate-spin" />
            <p className="text-lg font-medium text-gray-900">Processing your resume...</p>
            <p className="text-gray-600">This may take a few moments while we analyze your content.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
              </p>
              <p className="text-gray-600 mt-1">
                or click to browse files
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                PDF, DOC, DOCX, TXT
              </span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-900">Resume uploaded successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                {uploadResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="font-medium text-red-900">Upload failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3">What happens next?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            Our AI will analyze your resume content and extract key information
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            We'll generate 5-7 personalized interview questions based on your experience
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            You can then start practicing with these questions and receive AI feedback
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;
