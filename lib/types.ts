export type Residence = "My Domain Salt River" | "My Domain Observatory"

export type UrgencyLevel = "Low" | "Medium" | "High"

export type IssueLocation = "Kitchen" | "Bathroom" | "Bedroom" | "Utilities"

export type RequestStatus = "Submitted" | "Application Viewed" | "Pending" | "Completed"

export type StockCategory = "Plumbing" | "Electrical" | "Furniture" | "Appliances" | "Cleaning" | "Other"

export interface Tenant {
  id: string
  name: string
  surname: string
  email: string
  contactNumber: string
  roomNumber: string
  residence: Residence
  tenantCode: string
  createdAt: Date
}

export interface MaintenanceRequest {
  id: string
  waitingNumber: string
  tenantId: string
  tenant?: Tenant
  issueLocation: IssueLocation
  urgencyLevel: UrgencyLevel
  description: string
  imageUrl?: string
  status: RequestStatus
  submittedAt: Date
  updatedAt: Date
  hasFeedback?: boolean
}

export interface Feedback {
  id: string
  requestId: string
  rating: number // 1-5
  description: string
  submittedAt: Date
}

export interface Admin {
  id: string
  username: string
  email: string
  role: string
}

export interface StockItem {
  id: string
  name: string
  category: StockCategory
  quantity: number
  residence: Residence
  minQuantity: number
  unit: string
  lastUpdated: Date
  notes?: string
}

export interface StockTransaction {
  id: string
  stockItemId: string
  type: "add" | "remove"
  quantity: number
  date: Date
  updatedBy: string
  reason: string
}
