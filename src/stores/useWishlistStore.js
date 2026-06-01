import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

/**
 * Wishlist store — manages saved/favorite products with localStorage persistence.
 * Each item: { id, name, price, image_url, category }
 */
const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Adds a product to the wishlist if it doesn't already exist.
       */
      addItem: (product) => {
        const { items } = get()
        const exists = items.some((item) => item.id === product.id)

        if (exists) {
          toast('Already in your wishlist.', { icon: '💜' })
          return
        }

        set({
          items: [
            ...items,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              category: product.category,
            },
          ],
        })
        toast.success(`${product.name} added to wishlist!`)
      },

      /**
       * Removes a product from the wishlist.
       */
      removeItem: (productId) => {
        const { items } = get()
        const item = items.find((i) => i.id === productId)
        set({ items: items.filter((i) => i.id !== productId) })
        if (item) {
          toast.success(`${item.name} removed from wishlist.`)
        }
      },

      /**
       * Toggles a product in the wishlist — adds it if absent, removes it if present.
       */
      toggleItem: (product) => {
        const { items } = get()
        const exists = items.some((item) => item.id === product.id)

        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) })
          toast.success(`${product.name} removed from wishlist.`)
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                category: product.category,
              },
            ],
          })
          toast.success(`${product.name} added to wishlist!`)
        }
      },

      /**
       * Checks whether a product is currently in the wishlist.
       * @param {string} productId
       * @returns {boolean}
       */
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },
    }),
    {
      name: 'shopverse-wishlist',
    }
  )
)

export default useWishlistStore
