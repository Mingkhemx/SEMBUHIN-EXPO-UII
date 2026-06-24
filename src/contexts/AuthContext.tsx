import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isPremium: boolean
  isDoctor: boolean
  membershipLoading: boolean
  signOut: () => Promise<void>
  upgradeToPremium: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [isDoctor, setIsDoctor] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(false)

  const fetchMembership = useCallback(async (userId: string) => {
    if (!userId) return
    setMembershipLoading(true)
    try {
      // Check premium membership
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (data && data.plan === 'premium') {
        setIsPremium(true)
      } else {
        setIsPremium(false)
      }
    } catch (err) {
      console.error('Error fetching membership:', err)
      setIsPremium(false)
    } finally {
      setMembershipLoading(false)
    }

    // Check doctor role from user metadata or doctors table
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const role = authUser?.user_metadata?.role
      
      if (role === 'doctor') {
        setIsDoctor(true)
      } else {
        // Fallback: check doctors table directly
        const { data: doctorRecord } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()
        setIsDoctor(!!doctorRecord)
      }
    } catch {
      setIsDoctor(false)
    }
  }, [])

  const upgradeToPremium = async () => {
    // This is a mock function - in real app, integrate payment gateway (Midtrans/Xendit)
    if (!user) return
    try {
      // First check if membership exists
      const { data: existing } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (existing) {
        // Update existing membership
        await supabase
          .from('memberships')
          .update({
            plan: 'premium',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        // Create new membership
        await supabase
          .from('memberships')
          .insert({
            user_id: user.id,
            plan: 'premium',
            is_active: true
          })
      }
      setIsPremium(true)
      alert('Selamat! Kamu sudah menjadi member Premium! 🎉')
    } catch (err) {
      console.error('Error upgrading membership:', err)
      alert('Gagal upgrade membership, silakan coba lagi nanti!')
    }
  }

  useEffect(() => {
    // Check active session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // USER_UPDATED terjadi saat updateUser() dipanggil (misal ganti avatar)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          fetchMembership(session.user.id)
        } else {
          setIsPremium(false)
        }
      }
    )

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchMembership(session.user.id)
      }
    }).catch((err) => {
      console.error("Error getting session:", err)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchMembership])

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsPremium(false)
    setIsDoctor(false)
  }

  // Paksa refresh user dari Supabase — dipanggil setelah updateUser()
  const refreshUser = async () => {
    const { data: { user: freshUser } } = await supabase.auth.getUser()
    setUser(freshUser)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isPremium, isDoctor, membershipLoading, signOut, upgradeToPremium, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
