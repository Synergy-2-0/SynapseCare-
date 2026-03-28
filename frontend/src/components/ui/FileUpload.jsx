import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';

const FileUpload = ({
    onUpload,
    accept = '.pdf,.jpg,.jpeg,.png',
    maxSize = 10, // MB
    multiple = false,
    label = 'Upload File',
    description = 'Drag and drop or click to upload',
    disabled = false,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return Image;
        if (type === 'application/pdf') return FileText;
        return File;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            return `File size exceeds ${maxSize}MB limit`;
        }

        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        const fileType = file.type;

        const isAccepted = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExt === type.toLowerCase();
            }
            return fileType.includes(type.replace('*', ''));
        });

        if (!isAccepted) {
            return `File type not accepted. Allowed: ${accept}`;
        }

        return null;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        setError(null);
        setSuccess(false);

        const filesToProcess = multiple ? newFiles : [newFiles[0]];
        const validFiles = [];

        for (const file of filesToProcess) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            validFiles.push(file);
        }

        setFiles(multiple ? [...files, ...validFiles] : validFiles);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
        setError(null);
        setSuccess(false);
    };

    const handleUpload = async () => {
        if (files.length === 0 || !onUpload) return;

        setUploading(true);
        setError(null);
        setSuccess(false);

        try {
            for (const file of files) {
                await onUpload(file);
            }
            setSuccess(true);
            setFiles([]);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={className}>
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    disabled={disabled}
                    className="hidden"
                />

                <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <p className="font-medium text-slate-700">{label}</p>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
                <p className="text-xs text-slate-400 mt-2">
                    Max size: {maxSize}MB • Accepted: {accept}
                </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => {
                        const FileIcon = getFileIcon(file.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <FileIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        );
                    })}

                    <Button
                        onClick={handleUpload}
                        loading={uploading}
                        disabled={uploading}
                        className="w-full mt-3"
                    >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
                    </Button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    File uploaded successfully!
                </div>
            )}
        </div>
    );
};

export default FileUpload;
