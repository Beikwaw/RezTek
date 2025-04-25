"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { isValidPhoneNumber } from "@/lib/utils"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function TenantProfile() {
  const { tenant } = useAuth()

  const [contactNumber, setContactNumber] = useState(tenant?.contactNumber || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  if (!tenant) return null

  const handleEdit = () => {
    setIsEditing(true)
    setError("")
    setSuccess(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setContactNumber(tenant.contactNumber)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValidPhoneNumber(contactNumber)) {
      setError("Please enter a valid South African phone number")
      return
    }

    setIsSubmitting(true)

    try {
      // Update tenant document
      await updateDoc(doc(db, "tenants", tenant.id), {
        contactNumber,
      })

      setSuccess(true)
      setIsEditing(false)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Profile</CardTitle>
        <CardDescription>View and update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Your profile has been updated successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={tenant.name} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input id="surname" value={tenant.surname} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={tenant.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input id="roomNumber" value={tenant.roomNumber} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residence">Residence</Label>
              <Input id="residence" value={tenant.residence} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantCode">Tenant Code</Label>
            <Input id="tenantCode" value={tenant.tenantCode} disabled />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!isEditing ? (
          <Button onClick={handleEdit}>Edit Contact Number</Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
