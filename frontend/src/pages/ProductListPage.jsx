import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { productApi, categoryApi } from '../api/productApi'
import ProductCard from '../components/common/ProductCard'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { setSEO } from '../utils/seo'

const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevance' },
  { value: 'NEWEST', label: 'Newest' },
  { value: 'PRICE_LOW', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH', label: 'Price: High to Low' },
  { value: 'RATING', label: 'Top Rated' },
  { value: 'POPULAR', label: 'Most Popular' }
]

export default function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const page = Number(params.get('page') || 0)
  const sort = params.get('sort') || 'RELEVANCE'
  const category = params.get('category') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const query = params.get('q') || ''

  useEffect(() => {
    categoryApi.getTree().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setSEO('Products', 'Browse women\'s fashion at Haritha Fashion World')
    setLoading(true)
    productApi.search({
      q: query || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort,
      page,
      size: 20
    }).then((r) => {
      setProducts(r.data?.content || [])
      setTotal(r.data?.totalElements || 0)
    }).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [params, page, sort, category, minPrice, maxPrice, query])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.set('page', '0')
    setParams(next)
  }

  const flatCategories = (nodes, depth = 0) =>
    nodes.flatMap((n) => [{ ...n, depth }, ...(n.children ? flatCategories(n.children, depth + 1) : [])])

  const categoryName = flatCategories(categories).find((c) => c.slug === category)?.name

  return (
    <div className="page-shell">
      <div className="surface-card p-6 md:p-10 mb-8 bg-gradient-to-br from-white via-brand-50/30 to-gold-light/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <PageHeader
          eyebrow="Collection"
          title={query ? `Results for "${query}"` : categoryName || 'All Products'}
          subtitle={`${total} curated piece${total !== 1 ? 's' : ''} for you`}
          className="mb-0 relative z-10"
        />
      </div>

      <div className="filter-bar mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mr-2">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Filters</span>
        </div>
        <select className="input-field w-auto min-w-[140px]" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="input-field w-auto min-w-[160px]" value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All categories</option>
          {flatCategories(categories).map((c) => (
            <option key={c.id} value={c.slug}>{'—'.repeat(c.depth)}{c.name}</option>
          ))}
        </select>
        <input className="input-field w-28" type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} />
        <input className="input-field w-28" type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="surface-card overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-gradient-to-br from-cream-100 to-brand-50" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState icon="✨" title="No products found" message="Try adjusting filters or browse our full collection." actionLabel="Browse all" actionTo="/products" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {total > 20 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button type="button" disabled={page === 0} onClick={() => updateParam('page', String(page - 1))} className="btn-outline disabled:opacity-40 disabled:hover:translate-y-0">Previous</button>
              <span className="text-sm text-gray-600 px-5 py-2.5 surface-card font-medium">Page {page + 1} of {Math.ceil(total / 20)}</span>
              <button type="button" disabled={(page + 1) * 20 >= total} onClick={() => updateParam('page', String(page + 1))} className="btn-primary">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
