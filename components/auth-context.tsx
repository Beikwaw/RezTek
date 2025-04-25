"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { Tenant, Admin } from "@/lib/types"
import { generateTenantCode } from "@/lib/utils"

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  admin: Admin | null
  loading: boolean
  error: string | null
  signUp: (
    email: string,
    password: string,
    tenantData: Omit<Tenant, "id" | "createdAt">,
  ) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth state listener
  useEffect(() => {
    console.log("Setting up auth state listener")

    try {
      // Verify auth is available
      if (!auth) {
        console.error("Firebase auth object is undefined")
        setError("Firebase authentication failed to initialize")
        setLoading(false)
        return
      }

      console.log("Auth object exists, setting up listener")

      const unsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          console.log("Auth state changed:", user ? "User logged in" : "No user")
          setUser(user)
          setAuthInitialized(true)

          if (user) {
            try {
              // Check if user is the official admin
              if (user.email === 'obsadmin@mydomainliving.co.za') {
                console.log("User is the official admin")
                const adminData: Admin = {
                  id: user.uid,
                  username: 'obsadmin',
                  email: user.email,
                  role: 'admin'
                }
                setAdmin(adminData)
                setIsAdmin(true)
                setTenant(null)
              } else {
                // Check if user is a tenant
                try {
                  const tenantDoc = await getDoc(doc(db, "tenants", user.uid))
                  if (tenantDoc.exists()) {
                    console.log("User is a tenant")
                    const tenantData = tenantDoc.data() as Tenant
                    setTenant({ ...tenantData, id: user.uid })
                    setIsAdmin(false)
                    setAdmin(null)
                  } else {
                    console.log("User is not authorized")
                    await firebaseSignOut(auth)
                    setError("Account not found. Please contact support.")
                  }
                } catch (err) {
                  console.error("Error fetching tenant data:", err)
                  setError("Failed to load your account. Please try again.")
                  await firebaseSignOut(auth)
                }
              }
            } catch (err) {
              console.error("Error fetching user data:", err)
              // FALLBACK: Create a mock tenant for preview purposes
              createMockTenantForPreview(user)
            }
          } else {
            setTenant(null)
            setAdmin(null)
            setIsAdmin(false)
          }

          setLoading(false)
        },
        (err) => {
          console.error("Auth state change error:", err)
          setError("Authentication error. Please check your connection and try again.")
          setLoading(false)
          setAuthInitialized(true)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Auth provider setup error:", err)
      setError("Failed to initialize authentication. Please check your connection and try again.")
      setLoading(false)
      return () => {}
    }
  }, [])

  // Add this helper function to create a mock tenant when Firestore access fails
  const createMockTenantForPreview = (user: User) => {
    console.log("Creating mock tenant for preview environment")
    // Create a mock tenant with data from the auth user
    const mockTenant: Tenant = {
      id: user.uid,
      name: user.displayName?.split(" ")[0] || "Preview",
      surname: user.displayName?.split(" ")[1] || "User",
      email: user.email || "preview@example.com",
      contactNumber: "0712345678",
      roomNumber: "A101",
      residence: "My Domain Observatory",
      tenantCode: "PREVIEW" + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date(),
    }

    setTenant(mockTenant)
    setIsAdmin(false)
    console.log("Mock tenant created:", mockTenant)
  }

  const signUp = async (
    email: string,
    password: string,
    tenantData: Omit<Tenant, "id" | "createdAt">,
  ) => {
    if (!authInitialized) {
      console.error("Auth not initialized during signup")
      throw new Error("Authentication system is still initializing. Please try again.")
    }

    try {
      console.log("Attempting to sign up user:", email)

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("User created successfully:", user.uid)

      // Create tenant document with provided tenant code
      const tenantDoc = {
        id: user.uid,
        ...tenantData,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "tenants", user.uid), tenantDoc)
      setTenant(tenantDoc as Tenant)
      console.log("Tenant document created successfully")
    } catch (error: any) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!authInitialized) {
      console.error("Auth not initialized during signin")
      throw new Error("Authentication system is still initializing. Please try again.")
    }

    try {
      console.log("Attempting to sign in user:", email)

      await signInWithEmailAndPassword(auth, email, password)
      console.log("User signed in successfully")
    } catch (error: any) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signOut = async () => {
    if (!authInitialized) {
      console.error("Auth not initialized during signout")
      throw new Error("Authentication system is still initializing. Please try again.")
    }

    try {
      console.log("Attempting to sign out user")

      await firebaseSignOut(auth)
      setTenant(null)
      setAdmin(null)
      console.log("User signed out successfully")
    } catch (error: any) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        admin,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
