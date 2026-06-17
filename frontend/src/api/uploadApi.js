import api from './axiosInstance'

export const uploadApi = {
  /** Get a presigned S3 URL for uploading an image */
  presignImage: (filename, contentType) =>
    api.get('/upload/presign', { params: { filename, contentType } }),

  /** Get a presigned S3 URL for uploading a video */
  presignVideo: (filename, contentType) =>
    api.get('/upload/presign-video', { params: { filename, contentType } }),

  /** Delete an object from S3 by its key */
  deleteObject: (key) => api.delete('/upload', { params: { key } }),

  /**
   * Upload a file directly to S3 using a presigned URL.
   * Returns the public CloudFront/S3 URL.
   */
  uploadToS3: async (file, onProgress) => {
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const isVideo = file.type.startsWith('video/')

    const { data: presign } = isVideo
      ? await uploadApi.presignVideo(filename, file.type)
      : await uploadApi.presignImage(filename, file.type)

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', presign.uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload failed')))
      xhr.onerror = () => reject(new Error('Upload failed'))
      xhr.send(file)
    })

    return presign.publicUrl
  }
}
