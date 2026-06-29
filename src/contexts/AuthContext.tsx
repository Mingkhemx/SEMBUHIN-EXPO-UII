import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  userProfile: any | null
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
  const [userProfile, setUserProfile] = useState<any | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [isDoctor, setIsDoctor] = useState(false)
  const [membershipLoading, setMembershipLoading] = useState(false)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) return
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) throw error
      setUserProfile(profile)
      
      // Check premium from profile if columns exist, otherwise check memberships table
      if (profile?.is_premium !== undefined) {
        setIsPremium(!!profile.is_premium)
      } else {
        fetchMembership(userId)
      }

      // Check doctor role from profile
      if (profile?.role?.includes('doctor')) {
        setIsDoctor(true)
      } else {
        checkDoctorStatus(userId)
      }

    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [])

  const fetchMembership = async (userId: string) => {
    setMembershipLoading(true)
    try {
      const { data } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()
      if (data && data.plan === 'premium') {
        setIsPremium(true)
      }
    } finally {
      setMembershipLoading(false)
    }
  }

  const checkDoctorStatus = async (userId: string) => {
    try {
      const { data: doctorRecord } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      setIsDoctor(!!doctorRecord)
    } catch {}
  }

  const upgradeToPremium = async () => {
    // Fungsi ini sekarang hanya akan dipanggil jika pembayaran berhasil di route.tsx
    if (!user) return
    try {
      // First check if membership exists
      const { data: existing } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
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
    } catch (err) {
      console.error('Error upgrading membership:', err)
      throw err // lempar error agar bisa ditangkap oleh route.tsx
    }
  }

  useEffect(() => {
    // Check active session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setIsPremium(false)
          setUserProfile(null)
        }
      }
    )

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    }).catch((err) => {
      console.error("Error getting session:", err)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setIsPremium(false)
    setIsDoctor(false)
    setUserProfile(null)
  }

  // Paksa refresh user dari Supabase — dipanggil setelah updateUser()
  const refreshUser = async () => {
    const { data: { user: freshUser } } = await supabase.auth.getUser()
    setUser(freshUser)
    if (freshUser) fetchProfile(freshUser.id)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, session, loading, isPremium, isDoctor, membershipLoading, signOut, upgradeToPremium, refreshUser }}>
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
