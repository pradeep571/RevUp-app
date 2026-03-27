import { supabase } from '../supabase'

const BUCKET = 'post'

export async function uploadImage(file, folder, userId) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    throw new Error('Only JPG, PNG, WEBP and GIF images are allowed.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be under 10 MB.')
  }

  const ext      = file.name.split('.').pop()
  const filename = `${folder}/${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { upsert: true, contentType: file.type })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
  return data.publicUrl
}