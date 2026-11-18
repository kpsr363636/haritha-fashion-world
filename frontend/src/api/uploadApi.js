import api from './axiosInstance'

export const uploadApi = {
  /** Upload an image through the backend. Resolves to { url, key, bucket }. */
  uploadImage: (file, onProgress) => upload('/upload/image', file, onProgress),

  /** Upload a video through the backend (seller/admin only). Resolves to { url, key, bucket }. */
  uploadVideo: (file, onProgress) => upload('/upload/video', file, onProgress),

  /** Delete a stored file by its key */
  deleteObject: (key) => api.delete('/upload', { data: { key } }),

  /**
   * Upload a file (image or video) and return its public URL.
   * Name kept for existing callers; storage may be local disk or S3/R2.
   */
  uploadToS3: async (file, onProgress) => {
    const isVideo = file.type.startsWith('video/')
    const res = isVideo
      ? await uploadApi.uploadVideo(file, onProgress)
      : await uploadApi.uploadImage(file, onProgress)
    return res.data.url
  }
}

function upload(path, file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  return api.post(path, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined
  })
}
