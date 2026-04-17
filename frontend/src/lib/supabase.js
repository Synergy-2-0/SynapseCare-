import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Media upload functionality may be restricted.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

/**
 * Storage Helpers for SynapCare Media Manifest
 */
export const supabaseStorage = {
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'clinical-media',
    
    /**
     * Upload clinical media to the registry
     * @param {File} file - Blob/File shard
     * @param {string} path - Clinical path (e.g., 'doctors/id/license.pdf')
     * @returns {Promise<{data: any, error: any}>}
     */
    async upload(file, path) {
        return await supabase.storage
            .from(this.bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });
    },

    /**
     * Resolve a public URL for a clinical shard
     * @param {string} path - Clinical path
     * @returns {string}
     */
    getPublicUrl(path) {
        const { data } = supabase.storage
            .from(this.bucket)
            .getPublicUrl(path);
        return data.publicUrl;
    },

    /**
     * Download a clinical shard from the registry
     * @param {string} path - Clinical path
     */
    async download(path) {
        return await supabase.storage
            .from(this.bucket)
            .download(path);
    },

    /**
     * Remove or purge a clinical shard from the registry
     * @param {string[]} paths - Array of clinical paths
     */
    async remove(paths) {
        return await supabase.storage
            .from(this.bucket)
            .remove(paths);
    }
};

export default supabase;
