"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { IssueLocation, UrgencyLevel } from "@/lib/types"
import { generateWaitingNumber } from "@/lib/utils"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { ExpandableImage } from "@/components/ui/expandable-image"

export default function MaintenanceRequestForm() {
  const { tenant } = useAuth()

  const [issueLocation, setIssueLocation] = useState<IssueLocation | "">("")
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel | "">("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [waitingNumber, setWaitingNumber] = useState("")

  if (!tenant) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setIssueLocation("")
    setUrgencyLevel("")
    setDescription("")
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!issueLocation) {
      setError("Please select an issue location")
      return
    }

    if (!urgencyLevel) {
      setError("Please select an urgency level")
      return
    }

    if (!description) {
      setError("Please provide a description of the issue")
      return
    }

    setIsSubmitting(true)

    try {
      // Generate waiting number
      const newWaitingNumber = generateWaitingNumber()
      setWaitingNumber(newWaitingNumber)

      // Upload image if provided and urgency is high
      let imageUrl = ""
      if (image && urgencyLevel === "High") {
        const storageRef = ref(storage, `maintenance-requests/${tenant.id}/${newWaitingNumber}/${image.name}`)
        await uploadBytes(storageRef, image)
        imageUrl = await getDownloadURL(storageRef)
      }

      // Add request to Firestore
      await addDoc(collection(db, "maintenanceRequests"), {
        waitingNumber: newWaitingNumber,
        tenantId: tenant.id,
        issueLocation,
        urgencyLevel,
        description,
        imageUrl,
        status: "Submitted",
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setSuccess(true)
      resetForm()
    } catch (error) {
      console.error("Error submitting request:", error)
      setError("An error occurred while submitting your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-green-600">Request Submitted Successfully</CardTitle>
          <CardDescription className="text-center">Your maintenance request has been received</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-medium">Your Waiting Number:</p>
            <p className="text-2xl font-bold font-mono">{waitingNumber}</p>
            <p className="text-sm text-gray-500">
              Please keep this number for reference. You can track the status of your request in the history section.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => setSuccess(false)}>Submit Another Request</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Maintenance Request</CardTitle>
        <CardDescription>Fill in the details of your maintenance issue</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-semibold mb-2">High Urgency Maintenance Disclaimer</p>
            <p>This request form is for emergencies only, such as electrical faults, severe flooding, fire sparks, or any issue posing immediate danger. Non-emergency or minor issues will not be attended to through this channel.</p>
            <p className="mt-2">Misuse of this service will result in your request being disregarded. Repeated abuse may lead to further action.</p>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Tenant Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={`${tenant.name} ${tenant.surname}`} disabled />
              </div>
              <div>
                <Label htmlFor="room">Room Number</Label>
                <Input id="room" value={tenant.roomNumber} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenantCode">Tenant Code</Label>
                <Input id="tenantCode" value={tenant.tenantCode} disabled />
              </div>
              <div>
                <Label htmlFor="residence">Residence</Label>
                <Input id="residence" value={tenant.residence} disabled />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Issue Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueLocation">Issue Location</Label>
                <Select value={issueLocation} onValueChange={(value) => setIssueLocation(value as IssueLocation)}>
                  <SelectTrigger id="issueLocation">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kitchen">Kitchen</SelectItem>
                    <SelectItem value="Bathroom">Bathroom</SelectItem>
                    <SelectItem value="Bedroom">Bedroom</SelectItem>
                    <SelectItem value="Common Area">Common Area</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Urgency Level</Label>
                <Select value={urgencyLevel} onValueChange={(value) => setUrgencyLevel(value as UrgencyLevel)}>
                  <SelectTrigger id="urgencyLevel">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail"
                className="h-32"
              />
            </div>

            {urgencyLevel === "High" && (
              <div className="space-y-2">
                <Label htmlFor="image">Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {image ? "Change Image" : "Upload Image"}
                  </Button>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <ExpandableImage
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="max-h-48 w-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
