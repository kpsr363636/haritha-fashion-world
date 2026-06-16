import { useEffect, useState } from 'react'
import { categoryApi } from '../api/productApi'
import { setSEO } from '../utils/seo'

function flatCategories(nodes, depth = 0) {
  return nodes.flatMap((n) => [{ ...n, depth }, ...(n.children ? flatCategories(n.children, depth + 1) : [])])
}

export default function SizeGuidePage() {
  const [categories, setCategories] = useState([])
  const [guides, setGuides] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSEO('Size Guide', 'Find your perfect fit at Haritha Fashion World')
    categoryApi.getTree().then(async (r) => {
      const tree = r.data || []
      setCategories(tree)
      const flat = flatCategories(tree)
      const results = {}
      await Promise.all(flat.map(async (cat) => {
        try {
          const res = await categoryApi.getSizeGuide(cat.id)
          if (res.data) results[cat.id] = res.data
        } catch { /* no guide for category */ }
      }))
      setGuides(results)
    }).finally(() => setLoading(false))
  }, [])

  const flat = flatCategories(categories)
  const withGuides = flat.filter((c) => guides[c.id])

  if (loading) return <p className="text-center py-20 text-gray-500">Loading size guides...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Size Guide</h1>
      {withGuides.length === 0 ? (
        <div className="space-y-8">
          {['Sarees', 'Kurtas', 'Dresses', 'Footwear'].map((name) => (
            <div key={name}>
              <h2 className="font-semibold mb-3">{name}</h2>
              <p className="text-sm text-gray-500">Detailed measurements coming soon. Contact support for sizing help.</p>
            </div>
          ))}
        </div>
      ) : (
        withGuides.map((cat) => {
          const guide = guides[cat.id]
          const content = guide.content || {}
          const sizes = content.sizes || content.measurements || Object.keys(content)
          return (
            <div key={cat.id} className="mb-8 border rounded-xl p-6">
              <h2 className="font-semibold mb-1">{guide.name || cat.name}</h2>
              <p className="text-xs text-gray-500 mb-4">{guide.guideType}</p>
              {Array.isArray(sizes) ? (
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => <span key={s} className="px-4 py-2 border rounded-lg text-sm">{s}</span>)}
                </div>
              ) : typeof content === 'object' ? (
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>
              ) : (
                <p className="text-sm text-gray-600">{String(content)}</p>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
