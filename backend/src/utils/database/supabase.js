
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY)')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Uploads a file to Supabase Storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The file path in the bucket
 * @param {Buffer|Blob|string} fileBody - The file content
 * @param {string} contentType - The MIME type
 */
export async function uploadFile(bucket, path, fileBody, contentType) {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, fileBody, {
            contentType,
            upsert: true
        })

    if (error) {
        throw error
    }

    return data
}

/**
 * Get public URL for a file
 * @param {string} bucket 
 * @param {string} path 
 */
export async function getPublicUrl(bucket, path) {
    const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path)

    return data.publicUrl
}

/**
 * Verify a user token and return user data
 * @param {string} token 
 */
export async function getUser(token) {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
}
