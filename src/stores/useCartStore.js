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
      addItem: (product, selectedSize = null) => {
        const { items } = get()
        const cartItemId = product.id + (selectedSize ? `-${selectedSize}` : '')
        const existing = items.find((item) => (item.cartItemId || item.id) === cartItemId)

        if (existing) {
          if (existing.quantity >= (product.stock || 99)) {
            toast.error('Maximum stock limit reached for this item.')
            return
          }
          set({
            items: items.map((item) =>
              (item.cartItemId || item.id) === cartItemId
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
                cartItemId,
                id: product.id,
                name: product.name,
                price: product.price,
                original_price: product.original_price,
                image_url: product.image_url,
                category: product.category,
                quantity: 1,
                stock: product.stock || 99,
                selectedSize: selectedSize || null,
                dealerPhone: product.profiles?.phone || product.dealerPhone || null,
              },
            ],
          })
          toast.success(`${product.name} ${selectedSize ? `(Size: ${selectedSize}) ` : ''}added to cart!`)
        }
      },

      /**
       * Removes a product from the cart entirely.
       */
      removeItem: (cartItemId) => {
        const { items } = get()
        const item = items.find((i) => (i.cartItemId || i.id) === cartItemId)
        set({ items: items.filter((i) => (i.cartItemId || i.id) !== cartItemId) })
        if (item) {
          toast.success(`${item.name} removed from cart.`)
        }
      },

      /**
       * Sets the quantity of a specific cart item.
       * Clamps between 1 and the item's stock limit.
       */
      updateQuantity: (cartItemId, quantity) => {
        const { items } = get()
        const item = items.find((i) => (i.cartItemId || i.id) === cartItemId)

        if (!item) return

        const clampedQty = Math.max(1, Math.min(quantity, item.stock || 99))

        if (quantity > (item.stock || 99)) {
          toast.error('Cannot exceed available stock.')
        }

        set({
          items: items.map((i) =>
            (i.cartItemId || i.id) === cartItemId ? { ...i, quantity: clampedQty } : i
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
