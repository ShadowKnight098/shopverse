import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme store — manages light/dark mode with localStorage persistence.
 * Applies the 'dark' class on <html> so Tailwind's dark: variants work.
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',

      /**
       * Toggles between light and dark themes and applies the class to <html>.
       */
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })

        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      /**
       * Initialises the theme on app mount.
       * Uses the persisted value if available, otherwise falls back to the
       * system preference via `prefers-color-scheme`.
       */
      initTheme: () => {
        const { theme } = get()

        /* If the store was never persisted, detect system preference */
        const stored = localStorage.getItem('shopverse-theme')
        let activeTheme = theme

        if (!stored) {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches
          activeTheme = prefersDark ? 'dark' : 'light'
          set({ theme: activeTheme })
        }

        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }),
    {
      name: 'shopverse-theme',
    }
  )
)

export default useThemeStore
