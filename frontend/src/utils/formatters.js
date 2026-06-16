export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const calcDiscount = (mrp, price) => {
  if (!mrp || !price || mrp <= price) return 0
  return Math.round(((mrp - price) / mrp) * 100)
}
