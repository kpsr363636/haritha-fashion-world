import api from './axiosInstance'

const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100

/**
 * File uploads go through the backend (multipart). The backend stores them on local
 * disk (dev) or S3-compatible storage (production: Supabase Storage) and returns a public URL.
 */
export const uploadApi = {
  /** Upload an image. Resolves to its public URL. */
  uploadImage: async (file, onProgress) => {
    if (!file?.type?.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`Image must be under ${MAX_IMAGE_MB} MB`)
    }
    return upload('/upload/image', file, onProgress)
  },

  /** Upload a video (seller/admin only). Resolves to its public URL. */
  uploadVideo: async (file, onProgress) => {
    if (!file?.type?.startsWith('video/')) {
      throw new Error('Only video files are allowed')
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      throw new Error(`Video must be under ${MAX_VIDEO_MB} MB`)
    }
    return upload('/upload/video', file, onProgress)
  },

  /** Delete a stored file by its key */
  deleteObject: (key) => api.delete('/upload', { data: { key } }),

  /** Upload an image or video and return its public URL (name kept for existing callers). */
  uploadToS3: (file, onProgress) =>
    file?.type?.startsWith('video/')
      ? uploadApi.uploadVideo(file, onProgress)
      : uploadApi.uploadImage(file, onProgress)
}

async function upload(path, file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post(path, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)) }
      : undefined
  })
  const url = res.data?.url
  if (!url) throw new Error('Upload succeeded but no URL returned')
  return url
}
