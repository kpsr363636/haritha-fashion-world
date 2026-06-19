import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, Grid3X3 } from 'lucide-react'
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
  const [filtersOpen, setFiltersOpen] = useState(false)
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

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (query) next.set('q', query)
    setParams(next)
  }

  const flatCategories = (nodes, depth = 0) =>
    nodes.flatMap((n) => [{ ...n, depth }, ...(n.children ? flatCategories(n.children, depth + 1) : [])])

  const categoryName = flatCategories(categories).find((c) => c.slug === category)?.name
  const activeFilters = [
    category && { key: 'category', label: categoryName || category },
    minPrice && { key: 'minPrice', label: `Min ₹${minPrice}` },
    maxPrice && { key: 'maxPrice', label: `Max ₹${maxPrice}` },
    sort !== 'RELEVANCE' && { key: 'sort', label: SORT_OPTIONS.find((o) => o.value === sort)?.label }
  ].filter(Boolean)

  const FilterPanel = ({ className = '' }) => (
    <div className={`space-y-5 ${className}`}>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sort by</label>
        <select className="input-field" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Category</label>
        <select className="input-field" value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All categories</option>
          {flatCategories(categories).map((c) => (
            <option key={c.id} value={c.slug}>{'—'.repeat(c.depth)}{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Price range</label>
        <div className="flex gap-2">
          <input className="input-field flex-1" type="number" placeholder="Min ₹" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} />
          <input className="input-field flex-1" type="number" placeholder="Max ₹" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} />
        </div>
      </div>
      {activeFilters.length > 0 && (
        <button type="button" onClick={clearFilters} className="text-sm text-brand font-medium hover:underline w-full text-left">
          Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <div className="page-shell">
      <div className="section-band-light p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-brand-100/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <PageHeader
          eyebrow="Collection"
          title={query ? `Results for "${query}"` : categoryName || 'All Products'}
          subtitle={`${total.toLocaleString()} curated piece${total !== 1 ? 's' : ''} · Premium quality, trusted sellers`}
          className="mb-0 relative z-10"
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Active:</span>
          {activeFilters.map((f) => (
            <span key={f.key} className="filter-chip">
              {f.label}
              <button type="button" className="filter-chip-remove" onClick={() => updateParam(f.key, '')} aria-label="Remove filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button type="button" onClick={clearFilters} className="text-xs text-gray-500 hover:text-brand ml-1">Clear all</button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="surface-card p-6 sticky top-28">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
            </div>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Grid3X3 className="w-4 h-4" />
              <span>{loading ? 'Loading…' : `${products.length} of ${total} shown`}</span>
            </div>
            <button type="button" onClick={() => setFiltersOpen(true)} className="lg:hidden btn-outline text-sm py-2 px-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select className="input-field w-auto lg:hidden text-sm" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-[3/4] skeleton-shimmer" />
                  <div className="p-4 space-y-3 bg-white">
                    <div className="h-3 skeleton-shimmer rounded w-1/3" />
                    <div className="h-4 skeleton-shimmer rounded w-full" />
                    <div className="h-4 skeleton-shimmer rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon="✨" title="No products found" message="Try adjusting filters or browse our full collection." actionLabel="Browse all" actionTo="/products" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p, i) => (
                  <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
              {total > 20 && (
                <div className="flex justify-center items-center gap-3 mt-14">
                  <button type="button" disabled={page === 0} onClick={() => updateParam('page', String(page - 1))} className="btn-outline disabled:opacity-40 disabled:hover:translate-y-0 px-6">Previous</button>
                  <span className="text-sm text-gray-600 px-5 py-2.5 surface-card font-medium min-w-[120px] text-center">Page {page + 1} / {Math.ceil(total / 20)}</span>
                  <button type="button" disabled={(page + 1) * 20 >= total} onClick={() => updateParam('page', String(page + 1))} className="btn-primary px-6">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-6 py-3">Show {total} results</button>
          </div>
        </div>
      )}
    </div>
  )
}
