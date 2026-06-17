import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { productApi, categoryApi } from '../api/productApi'
import ProductCard from '../components/common/ProductCard'
import EmptyState from '../components/common/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { setSEO } from '../utils/seo'

const SORT_OPTIONS = [
  { value: 'RELEVANCE', label: 'Relevance' },
  { value: 'NEWEST', label: 'Newest First' },
  { value: 'PRICE_LOW', label: 'Price: Low to High' },
  { value: 'PRICE_HIGH', label: 'Price: High to Low' },
  { value: 'RATING', label: 'Top Rated' },
  { value: 'POPULAR', label: 'Most Popular' }
]

const OCCASIONS = ['Casual', 'Festive', 'Party', 'Wedding', 'Office', 'Bridal', 'Daily Wear']
const FABRICS = ['Cotton', 'Silk', 'Georgette', 'Chiffon', 'Polyester', 'Linen', 'Rayon', 'Crepe']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const COLORS = [
  { name: 'Red', hex: '#ef4444' }, { name: 'Pink', hex: '#ec4899' },
  { name: 'Blue', hex: '#3b82f6' }, { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' }, { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' }, { name: 'Black', hex: '#171717' },
  { name: 'White', hex: '#f5f5f5' }, { name: 'Gold', hex: '#b59a27' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 mb-3"
        onClick={() => setOpen(o => !o)}>
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && children}
    </div>
  )
}

export default function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const page = Number(params.get('page') || 0)
  const sort = params.get('sort') || 'RELEVANCE'
  const category = params.get('category') || ''
  const minPrice = params.get('minPrice') || ''
  const maxPrice = params.get('maxPrice') || ''
  const query = params.get('q') || ''
  const occasion = params.get('occasion') || ''
  const fabric = params.get('fabric') || ''
  const size = params.get('size') || ''
  const color = params.get('color') || ''
  const minRating = params.get('minRating') || ''
  const inStock = params.get('inStock') === 'true'

  useEffect(() => {
    categoryApi.getTree().then((r) => setCategories(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setSEO('Products', "Browse women's fashion at Haritha Fashion World")
    setLoading(true)
    productApi.search({
      q: query || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      occasion: occasion || undefined,
      fabric: fabric || undefined,
      size: size || undefined,
      color: color || undefined,
      minRating: minRating || undefined,
      inStock: inStock || undefined,
      sort,
      page,
      size: 20
    }).then((r) => {
      setProducts(r.data?.content || [])
      setTotal(r.data?.totalElements || 0)
    }).catch(() => setProducts([])).finally(() => setLoading(false))
  }, [params])

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.set('page', '0')
    setParams(next)
  }

  const toggle = (key, value) => {
    set(key, params.get(key) === value ? '' : value)
  }

  const flatCategories = (nodes, depth = 0) =>
    nodes.flatMap((n) => [{ ...n, depth }, ...(n.children ? flatCategories(n.children, depth + 1) : [])])

  // Build active filter chips
  const activeFilters = []
  if (query) activeFilters.push({ label: `"${query}"`, key: 'q' })
  if (category) activeFilters.push({ label: flatCategories(categories).find(c => c.slug === category)?.name || category, key: 'category' })
  if (occasion) activeFilters.push({ label: occasion, key: 'occasion' })
  if (fabric) activeFilters.push({ label: fabric, key: 'fabric' })
  if (size) activeFilters.push({ label: `Size: ${size}`, key: 'size' })
  if (color) activeFilters.push({ label: color, key: 'color' })
  if (minRating) activeFilters.push({ label: `${minRating}★+`, key: 'minRating' })
  if (minPrice) activeFilters.push({ label: `Min ₹${minPrice}`, key: 'minPrice' })
  if (maxPrice) activeFilters.push({ label: `Max ₹${maxPrice}`, key: 'maxPrice' })
  if (inStock) activeFilters.push({ label: 'In Stock', key: 'inStock' })

  const categoryName = flatCategories(categories).find((c) => c.slug === category)?.name

  const Sidebar = () => (
    <div className="w-64 shrink-0 space-y-0">
      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <button onClick={() => set('category', '')}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${!category ? 'bg-brand text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
            All Categories
          </button>
          {flatCategories(categories).map((c) => (
            <button key={c.id} onClick={() => set('category', c.slug)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded-lg ${category === c.slug ? 'bg-brand text-white' : 'hover:bg-gray-50 text-gray-600'}`}
              style={{ paddingLeft: `${8 + c.depth * 12}px` }}>
              {c.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex gap-2">
          <input className="input-field text-sm py-1.5 px-2" type="number" placeholder="Min ₹"
            value={minPrice} onChange={(e) => set('minPrice', e.target.value)} />
          <input className="input-field text-sm py-1.5 px-2" type="number" placeholder="Max ₹"
            value={maxPrice} onChange={(e) => set('maxPrice', e.target.value)} />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[['Under 500', '', '499'], ['500-2000', '500', '2000'], ['2000-5000', '2000', '5000'], ['5000+', '5000', '']].map(([label, min, max]) => (
            <button key={label} onClick={() => { set('minPrice', min); set('maxPrice', max) }}
              className="text-xs px-2 py-1 rounded-full border border-gray-200 hover:border-brand hover:text-brand transition-colors">
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colour */}
      <FilterSection title="Colour">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c.name} title={c.name} onClick={() => toggle('color', c.name)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.name ? 'border-brand scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`}
              style={{ backgroundColor: c.hex }} />
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => (
            <button key={s} onClick={() => toggle('size', s)}
              className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${size === s ? 'bg-brand text-white border-brand' : 'border-gray-200 hover:border-brand hover:text-brand'}`}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Occasion */}
      <FilterSection title="Occasion" defaultOpen={false}>
        <div className="space-y-1">
          {OCCASIONS.map((o) => (
            <label key={o} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
              <input type="checkbox" checked={occasion === o} onChange={() => toggle('occasion', o)}
                className="accent-brand" />
              <span className="text-sm text-gray-600">{o}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fabric */}
      <FilterSection title="Fabric" defaultOpen={false}>
        <div className="space-y-1">
          {FABRICS.map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
              <input type="checkbox" checked={fabric === f} onChange={() => toggle('fabric', f)}
                className="accent-brand" />
              <span className="text-sm text-gray-600">{f}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating" defaultOpen={false}>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button key={r} onClick={() => toggle('minRating', String(r))}
              className={`flex items-center gap-1 w-full px-2 py-1 rounded-lg text-sm transition-colors ${minRating === String(r) ? 'bg-brand/10 text-brand' : 'hover:bg-gray-50 text-gray-600'}`}>
              {r}+ <Star size={13} className="fill-current text-yellow-400" /> & above
            </button>
          ))}
        </div>
      </FilterSection>

      {/* In Stock */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={() => set('inStock', inStock ? '' : 'true')}
            className="accent-brand" />
          <span className="text-sm text-gray-600">In Stock only</span>
        </label>
      </FilterSection>
    </div>
  )

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="surface-card p-6 md:p-10 mb-6 bg-gradient-to-br from-white via-brand-50/30 to-gold-light/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-100/40 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <PageHeader
          eyebrow="Collection"
          title={query ? `Results for "${query}"` : categoryName || 'All Products'}
          subtitle={`${total.toLocaleString()} product${total !== 1 ? 's' : ''} found`}
          className="mb-0 relative z-10"
        />
      </div>

      {/* Sort bar + mobile filter toggle */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => setSidebarOpen(o => !o)}
          className="md:hidden flex items-center gap-2 btn-outline text-sm py-2 px-3">
          <SlidersHorizontal size={15} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
        <select className="input-field w-auto min-w-[180px] text-sm py-2" value={sort}
          onChange={(e) => set('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{total.toLocaleString()} results</span>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((f) => (
            <span key={f.key}
              className="flex items-center gap-1 bg-brand/10 text-brand text-xs px-3 py-1 rounded-full font-medium">
              {f.label}
              <button onClick={() => set(f.key, '')} className="hover:text-brand-dark">
                <X size={12} />
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button onClick={() => setParams({})} className="text-xs text-gray-500 hover:text-red-500 underline">
              Clear all
            </button>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-72 h-full overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">Filters</h3>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
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
            <EmptyState icon="✨" title="No products found"
              message="Try adjusting filters or browse our full collection."
              actionLabel="Clear filters" actionTo="/products" />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {total > 20 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button disabled={page === 0} onClick={() => set('page', String(page - 1))}
                    className="btn-outline disabled:opacity-40">Previous</button>
                  <span className="text-sm text-gray-600 px-5 py-2.5 surface-card font-medium">
                    Page {page + 1} of {Math.ceil(total / 20)}
                  </span>
                  <button disabled={(page + 1) * 20 >= total} onClick={() => set('page', String(page + 1))}
                    className="btn-primary">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
