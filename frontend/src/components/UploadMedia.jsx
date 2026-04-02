"use client";
import { useState } from 'react';
import { storage, ID } from '@/lib/appwrite';

export default function UploadMedia() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const response = await storage.createFile(
        'YOUR_BUCKET_ID', // Replace with your actual Bucket ID
        ID.unique(),
        file
      );
      console.log("Upload Success:", response);
      alert("File Uploaded! File ID: " + response.$id);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        className="block mb-4"
      />
      <button 
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload to Appwrite"}
      </button>
    </div>
  );
}
