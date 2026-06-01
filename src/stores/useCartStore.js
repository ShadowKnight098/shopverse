import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

/**
 * Cart store — manages shopping cart state with localStorage persistence.
 * Each item: { id, name, price, image_url, quantity, stock }
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      cartOpen: false,

      /** Opens or closes the cart sidebar drawer */
      setCartOpen: (open) => set({ cartOpen: open }),

      /**
       * Adds a product to the cart or increments its quantity if already present.
       * Enforces stock limits before adding.
       */
      addItem: (product) => {
        const { items } = get()
        const existing = items.find((item) => item.id === product.id)

        if (existing) {
          if (existing.quantity >= (product.stock || 99)) {
            toast.error('Maximum stock limit reached for this item.')
            return
          }
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
          toast.success(`${product.name} quantity updated in cart.`)
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                original_price: product.original_price,
                image_url: product.image_url,
                quantity: 1,
                stock: product.stock || 99,
              },
            ],
          })
          toast.success(`${product.name} added to cart!`)
        }
      },

      /**
       * Removes a product from the cart entirely.
       */
      removeItem: (productId) => {
        const { items } = get()
        const item = items.find((i) => i.id === productId)
        set({ items: items.filter((i) => i.id !== productId) })
        if (item) {
          toast.success(`${item.name} removed from cart.`)
        }
      },

      /**
       * Sets the quantity of a specific cart item.
       * Clamps between 1 and the item's stock limit.
       */
      updateQuantity: (productId, quantity) => {
        const { items } = get()
        const item = items.find((i) => i.id === productId)

        if (!item) return

        const clampedQty = Math.max(1, Math.min(quantity, item.stock || 99))

        if (quantity > (item.stock || 99)) {
          toast.error('Cannot exceed available stock.')
        }

        set({
          items: items.map((i) =>
            i.id === productId ? { ...i, quantity: clampedQty } : i
          ),
        })
      },

      /**
       * Empties the entire cart.
       */
      clearCart: () => {
        set({ items: [] })
        toast.success('Cart cleared.')
      },

      /** Returns the total number of items (sum of all quantities). */
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      /** Returns the total price of all items in the cart. */
      get totalPrice() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'shopverse-cart',
    }
  )
)

export default useCartStore
