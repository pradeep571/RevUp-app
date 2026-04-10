import { supabase } from '../services/supabase'

// Allowed image MIME types for image-only uploads
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Upload a file (image or video) to a Supabase storage bucket.
 * @param {File}   file    - The file to upload
 * @param {string} folder  - Sub-folder inside the bucket (e.g. 'cars', 'banners', 'shorts')
 * @param {string} userId  - ID of the authenticated user (used to namespace the path)
 * @param {string} [bucket='post'] - Storage bucket name. Pass 'shorts' for video uploads.
 */
export async function uploadImage(file, folder, userId, bucket = 'post') {
  const isVideo = file.type.startsWith('video/')
  const isImage = ALLOWED_IMAGES.includes(file.type)

  if (!isVideo && !isImage) {
    throw new Error('Only JPG, PNG, WEBP, GIF images or video files are allowed.')
  }

  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(isVideo ? 'Video must be under 50 MB.' : 'Image must be under 10 MB.')
  }

  const ext      = file.name.split('.').pop()
  const filename = `${folder}/${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}