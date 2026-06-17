import { useState, useRef } from 'react'
import { X, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { sellerApi } from '../../api/adminApi'
import api from '../../api/axiosInstance'

export default function BulkUploadModal({ onClose, onDone }) {
  const [mode, setMode] = useState('excel') // 'excel' | 'csv'
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef()

  const downloadTemplate = async () => {
    const res = await api.get('/seller/bulk-upload/template', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-upload-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const endpoint = mode === 'excel' ? '/seller/bulk-upload/excel' : '/seller/bulk-upload/csv'
      const { data } = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      if (data.created > 0) onDone?.()
    } catch (err) {
      setResult({ error: err.message || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold">Bulk Upload Products</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {['excel', 'csv'].map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${mode === m ? 'bg-white text-brand shadow-sm' : 'text-gray-500'}`}>
                {m === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
              </button>
            ))}
          </div>

          <button type="button" onClick={downloadTemplate}
            className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-brand/30 rounded-xl text-brand text-sm hover:bg-brand/5 transition-colors">
            <Download className="w-4 h-4" />
            Download template CSV
          </button>

          <form onSubmit={submit} className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand/50 transition-colors"
            >
              <FileSpreadsheet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              {file ? (
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Click to select file</p>
                  <p className="text-xs text-gray-400 mt-1">{mode === 'excel' ? '.xlsx, .xls' : '.csv'} files only</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={mode === 'excel' ? '.xlsx,.xls' : '.csv'}
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button type="submit" disabled={!file || uploading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload & Create Products'}
            </button>
          </form>

          {result && (
            <div className={`p-4 rounded-xl text-sm space-y-2 ${result.error ? 'bg-red-50 text-red-700' : 'bg-green-50'}`}>
              {result.error ? (
                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{result.error}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {result.created} products created
                    {result.errors > 0 && `, ${result.errors} errors`}
                  </div>
                  {result.errorDetails?.length > 0 && (
                    <ul className="text-red-600 text-xs space-y-1 mt-2 max-h-32 overflow-y-auto">
                      {result.errorDetails.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
