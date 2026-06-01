import { create } from 'zustand'
import { supabase } from '../lib/supabase.js'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isDealer: false,       // ← NEW
  isDealerApproved: false, // ← NEW

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      set({ user: currentUser })
      if (currentUser) get().fetchProfile(currentUser.id)
      else set({ isLoading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      set({ user: currentUser })
      if (currentUser) get().fetchProfile(currentUser.id)
      else set({ profile: null, isAdmin: false, isDealer: false, isDealerApproved: false, isLoading: false })
    })

    return () => subscription.unsubscribe()
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error }
    return { data }
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    })
    if (error) return { error }
    return { data }
  },

  signup: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { error }
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        role: 'customer',
      })
    }
    return { data }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, isAdmin: false, isDealer: false, isDealerApproved: false })
  },

  updateProfile: async (updates) => {
    const { user } = get()
    if (!user) return { error: { message: 'Not authenticated.' } }
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) return { error }
    set({
      profile: data,
      isAdmin: data.role === 'admin',
      isDealer: data.role === 'dealer',
      isDealerApproved: data.role === 'dealer' && data.is_approved === true,
    })
    return { data }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      set({ profile: null, isAdmin: false, isDealer: false, isDealerApproved: false, isLoading: false })
      return
    }

    set({
      profile: data,
      isAdmin: data.role === 'admin',
      isDealer: data.role === 'dealer',
      isDealerApproved: data.role === 'dealer' && data.is_approved === true,
      isLoading: false,
    })
  },
}))

export default useAuthStore
