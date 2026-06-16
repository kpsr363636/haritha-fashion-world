import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { wishlistApi } from '../api/orderApi'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [items, setItems] = useState([])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('wishlist')
      setItems(saved ? JSON.parse(saved) : [])
      return
    }
    try {
      const res = await wishlistApi.get()
      setItems(res.data || [])
    } catch {
      setItems([])
    }
  }, [isAuthenticated])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggle = async (product) => {
    const exists = items.find((i) => i.id === product.id)
    if (isAuthenticated) {
      try {
        if (exists) {
          await wishlistApi.remove(product.id)
          setItems((prev) => prev.filter((i) => i.id !== product.id))
        } else {
          await wishlistApi.add(product.id)
          setItems((prev) => [...prev, product])
        }
      } catch {
        /* keep local state unchanged on error */
      }
    } else {
      setItems((prev) => {
        const next = exists ? prev.filter((i) => i.id !== product.id) : [...prev, product]
        localStorage.setItem('wishlist', JSON.stringify(next))
        return next
      })
    }
  }

  const isWishlisted = (id) => items.some((i) => i.id === id)

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
