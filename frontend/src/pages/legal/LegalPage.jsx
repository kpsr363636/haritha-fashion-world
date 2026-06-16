import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axiosInstance'

export default function LegalPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    api.get(`/legal/${slug}`).then((r) => setPage(r.data)).catch(() => { setPage(null); setError(true) }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>
  if (error || !page) return <div className="text-center py-20 text-gray-500">Page not found</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">{page.title || slug}</h1>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  )
}
