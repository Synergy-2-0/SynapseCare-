import { useState } from 'react';
import { supabaseStorage } from '../lib/supabase';
import { Upload, CheckCircle, AlertCircle } from '@phosphor-icons/react';

export default function UploadMedia({ onUploadComplete, folder = 'general' }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);

        try {
            const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_').toLowerCase()}`;
            
            const { error } = await supabaseStorage.upload(file, fileName);
            
            if (error) {
                throw new Error(error.message || 'S3 Registry failure');
            }
            
            const publicUrl = supabaseStorage.getPublicUrl(fileName);
            setStatus({ type: 'success', message: 'Clinical Artifact Sync Complete', url: publicUrl });
            
            if (onUploadComplete) {
                onUploadComplete(publicUrl, fileName);
            }
        } catch (error) {
            console.error("Clinical Media Error:", error);
            setStatus({ type: 'error', message: error.message || 'Failed to sync with clinical-media registry' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:border-teal-400 transition-all group font-sans">
            <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    {uploading ? (
                        <div className="w-8 h-8 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
                    ) : (
                        <Upload size={32} weight="light" className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                    )}
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Clinical Media Ingress</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">S3-Compatible Storage Registry</p>

                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])} 
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer mb-6"
                />

                <button 
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="w-full h-12 bg-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-100 disabled:opacity-30 disabled:shadow-none hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {uploading ? "Synchronizing..." : "Initiate Secure Upload"}
                </button>

                {status && (
                    <div className={`mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {status.type === 'success' ? <CheckCircle size={14} weight="fill" /> : <AlertCircle size={14} weight="fill" />}
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
