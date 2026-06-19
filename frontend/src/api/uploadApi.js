import api from './axiosInstance'

const MAX_IMAGE_MB = 10

export const uploadApi = {
  presignImage: (fileName, contentType) =>
    api.post('/upload/presigned-url', { fileName, contentType }),

  /** Upload image — uses direct multipart in local dev, S3 presigned in production. */
  uploadImage: async (file, onProgress) => {
    if (!file?.type?.startsWith('image/')) {
      throw new Error('Only image files are allowed')
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`Image must be under ${MAX_IMAGE_MB} MB`)
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (e) => { if (e.total) onProgress(Math.round((e.loaded / e.total) * 100)) }
          : undefined
      })
      const url = res.data?.url
      if (!url) throw new Error('Upload succeeded but no URL returned')
      return url
    } catch (localErr) {
      const msg = localErr?.message
      if (msg && !msg.includes('unexpected') && msg !== 'Upload succeeded but no URL returned') {
        throw localErr
      }
    }

    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const res = await uploadApi.presignImage(filename, file.type || 'image/jpeg')
    const presign = res.data
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', presign.uploadUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('S3 upload failed')))
      xhr.onerror = () => reject(new Error('S3 upload failed'))
      xhr.send(file)
    })
    return presign.publicUrl
  },

  uploadToS3: (file, onProgress) => uploadApi.uploadImage(file, onProgress)
}
