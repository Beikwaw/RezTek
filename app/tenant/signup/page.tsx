"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isValidEmail, isValidPhoneNumber, isStrongPassword } from "@/lib/utils"
import type { Residence } from "@/lib/types"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export default function SignUp() {
  const router = useRouter()
  const { signUp } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    roomNumber: "",
    residence: "" as Residence,
    tenantCode: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleResidenceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, residence: value as Residence }))

    // Clear error when field is edited
    if (errors.residence) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.residence
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.surname.trim()) newErrors.surname = "Surname is required"

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required"
    } else if (!isValidPhoneNumber(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid South African phone number"
    }

    if (!formData.roomNumber.trim()) newErrors.roomNumber = "Room number is required"
    if (!formData.residence) newErrors.residence = "Place of residence is required"
    if (!formData.tenantCode.trim()) newErrors.tenantCode = "Tenant code is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        contactNumber: formData.contactNumber,
        roomNumber: formData.roomNumber,
        residence: formData.residence,
        tenantCode: formData.tenantCode,
      })

      setRegistrationSuccess(true)
      setTimeout(() => {
        router.push("/tenant/dashboard")
      }, 3000)
    } catch (error: any) {
      console.error("Signup error:", error)
      if (error.code === "auth/email-already-in-use") {
        setGeneralError("This email is already registered. Please use a different email or login.")
      } else {
        setGeneralError("An error occurred during sign up. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your RezTek account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/tenant/login" className="font-medium text-gray-900 hover:text-gray-700">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Registration</CardTitle>
            <CardDescription>Please fill in your details to create an account</CardDescription>
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Important Notice:</p>
                <p>Some details like your name, surname, and tenant code cannot be changed after registration. Please ensure all information is correct before submitting.</p>
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            {generalError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}
            {registrationSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Registration successful!</p>
                  <div className="bg-green-100 p-3 rounded-md">
                    <p>Welcome, {formData.name} {formData.surname}!</p>
                    <p>Email: {formData.email}</p>
                    <p>Tenant Code: {formData.tenantCode}</p>
                    <p className="mt-2 text-sm">Redirecting to dashboard...</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="Enter your surname"
                  />
                  {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter your contact number"
                />
                {errors.contactNumber && <p className="text-sm text-red-500">{errors.contactNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantCode">Tenant Code</Label>
                <Input
                  id="tenantCode"
                  name="tenantCode"
                  value={formData.tenantCode}
                  onChange={handleChange}
                  placeholder="Enter your tenant code"
                />
                {errors.tenantCode && <p className="text-sm text-red-500">{errors.tenantCode}</p>}
                <p className="text-sm text-gray-500">
                  <strong>Important:</strong> Your tenant code is crucial for admin to properly view and manage your requests.
                  Please keep it safe and use it when submitting any requests.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="e.g., 101"
                  />
                  {errors.roomNumber && <p className="text-sm text-red-500">{errors.roomNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residence">Place of Residence</Label>
                  <Select onValueChange={handleResidenceChange}>
                    <SelectTrigger id="residence">
                      <SelectValue placeholder="Select residence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="My Domain Salt River">My Domain Salt River</SelectItem>
                      <SelectItem value="My Domain Observatory">My Domain Observatory</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.residence && <p className="text-sm text-red-500">{errors.residence}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">By signing up, you agree to our Terms of Service and Privacy Policy</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
