"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, PlusCircle, Search, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Residence, StockCategory, StockItem, StockTransaction } from "@/lib/types"

interface StockManagementProps {
  selectedResidence: Residence | "All"
}

// Sample stock data for demonstration
const sampleStockItems = [
  {
    id: "1",
    name: "Light Bulbs",
    category: "Electrical" as StockCategory,
    quantity: 45,
    minQuantity: 20,
    unit: "pcs",
    residence: "My Domain Salt River" as Residence,
    lastUpdated: new Date(),
    notes: "Standard 60W bulbs",
  },
  {
    id: "2",
    name: "Shower Heads",
    category: "Plumbing" as StockCategory,
    quantity: 12,
    minQuantity: 5,
    unit: "pcs",
    residence: "My Domain Salt River" as Residence,
    lastUpdated: new Date(),
    notes: "Standard shower heads",
  },
  {
    id: "3",
    name: "Door Handles",
    category: "Furniture" as StockCategory,
    quantity: 8,
    minQuantity: 10,
    unit: "sets",
    residence: "My Domain Observatory" as Residence,
    lastUpdated: new Date(),
    notes: "Interior door handles with locks",
  },
  {
    id: "4",
    name: "Cleaning Solution",
    category: "Cleaning" as StockCategory,
    quantity: 15,
    minQuantity: 5,
    unit: "bottles",
    residence: "My Domain Observatory" as Residence,
    lastUpdated: new Date(),
    notes: "All-purpose cleaning solution",
  },
  {
    id: "5",
    name: "Toilet Plungers",
    category: "Plumbing" as StockCategory,
    quantity: 6,
    minQuantity: 3,
    unit: "pcs",
    residence: "My Domain Salt River" as Residence,
    lastUpdated: new Date(),
  },
  {
    id: "6",
    name: "Extension Cords",
    category: "Electrical" as StockCategory,
    quantity: 10,
    minQuantity: 5,
    unit: "pcs",
    residence: "My Domain Observatory" as Residence,
    lastUpdated: new Date(),
    notes: "5m extension cords",
  },
  {
    id: "7",
    name: "Mops",
    category: "Cleaning" as StockCategory,
    quantity: 8,
    minQuantity: 4,
    unit: "pcs",
    residence: "My Domain Salt River" as Residence,
    lastUpdated: new Date(),
  },
  {
    id: "8",
    name: "Desk Chairs",
    category: "Furniture" as StockCategory,
    quantity: 3,
    minQuantity: 2,
    unit: "pcs",
    residence: "My Domain Observatory" as Residence,
    lastUpdated: new Date(),
    notes: "Office chairs for study desks",
  },
]

export function StockManagement({ selectedResidence }: StockManagementProps) {
  const [categoryFilter, setCategoryFilter] = useState<StockCategory | "All">("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStockItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<StockItem | null>(null)
  const [formData, setFormData] = useState<Partial<StockItem>>({
    name: "",
    category: "Electrical",
    quantity: 0,
    minQuantity: 0,
    unit: "pcs",
    residence: "My Domain Salt River",
    notes: "",
  })
  const [updateQuantity, setUpdateQuantity] = useState<number>(0)
  const [updateReason, setUpdateReason] = useState<string>("")
  const [updateType, setUpdateType] = useState<"add" | "remove">("add")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions">("inventory")

  // Filter items based on selected residence and category
  const filteredItems = stockItems.filter((item) => {
    const matchesResidence = selectedResidence === "All" || item.residence === selectedResidence
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesResidence && matchesCategory && matchesSearch
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "quantity" || name === "minQuantity" ? Number.parseInt(value) || 0 : value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      category: "Electrical",
      quantity: 0,
      minQuantity: 0,
      unit: "pcs",
      residence: "My Domain Salt River",
      notes: "",
    })
    setError(null)
    setSuccess(null)
  }

  // Open add dialog
  const openAddDialog = () => {
    resetFormData()
    setIsAddDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (item: StockItem) => {
    setFormData({
      ...item,
    })
    setCurrentItem(item)
    setIsAddDialogOpen(true)
  }

  // Open update quantity dialog
  const openUpdateDialog = (item: StockItem) => {
    setCurrentItem(item)
    setUpdateQuantity(0)
    setUpdateReason("")
    setUpdateType("add")
    setIsUpdateDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (item: StockItem) => {
    setCurrentItem(item)
    setIsDeleteDialogOpen(true)
  }

  // Add new stock item
  const handleAddItem = async () => {
    if (!formData.name || !formData.category || !formData.residence) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newItem: StockItem = {
        id: currentItem?.id || `temp-${Date.now()}`,
        name: formData.name || "",
        category: formData.category as StockCategory,
        quantity: formData.quantity || 0,
        minQuantity: formData.minQuantity || 0,
        unit: formData.unit || "pcs",
        residence: formData.residence as Residence,
        lastUpdated: new Date(),
        notes: formData.notes,
      }

      if (currentItem) {
        // Update existing item
        const updatedItems = stockItems.map((item) => (item.id === currentItem.id ? newItem : item))
        setStockItems(updatedItems)

        // In a real app, you would update Firestore here
        // await updateDoc(doc(db, "stockItems", currentItem.id), newItem)
      } else {
        // Add new item
        setStockItems([...stockItems, newItem])

        // In a real app, you would add to Firestore here
        // const docRef = await addDoc(collection(db, "stockItems"), newItem)
        // newItem.id = docRef.id
      }

      setSuccess(currentItem ? "Item updated successfully" : "Item added successfully")
      setIsAddDialogOpen(false)
      resetFormData()
    } catch (err) {
      console.error("Error saving stock item:", err)
      setError("Failed to save item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update item quantity
  const handleUpdateQuantity = async () => {
    if (!currentItem) return
    if (updateQuantity <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    if (!updateReason) {
      setError("Please provide a reason for this update")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newQuantity =
        updateType === "add" ? currentItem.quantity + updateQuantity : currentItem.quantity - updateQuantity

      if (newQuantity < 0) {
        setError("Cannot remove more than available quantity")
        setIsSubmitting(false)
        return
      }

      // Update item quantity
      const updatedItems = stockItems.map((item) => {
        if (item.id === currentItem.id) {
          return {
            ...item,
            quantity: newQuantity,
            lastUpdated: new Date(),
          }
        }
        return item
      })

      setStockItems(updatedItems)

      // Create transaction record
      const transaction: StockTransaction = {
        id: `trans-${Date.now()}`,
        stockItemId: currentItem.id,
        type: updateType,
        quantity: updateQuantity,
        date: new Date(),
        updatedBy: "Admin", // In a real app, use the actual admin name
        reason: updateReason,
      }

      setTransactions([transaction, ...transactions])

      // In a real app, you would update Firestore here
      // await updateDoc(doc(db, "stockItems", currentItem.id), { quantity: newQuantity, lastUpdated: serverTimestamp() })
      // await addDoc(collection(db, "stockTransactions"), transaction)

      setSuccess(`Quantity ${updateType === "add" ? "added to" : "removed from"} inventory`)
      setIsUpdateDialogOpen(false)
    } catch (err) {
      console.error("Error updating quantity:", err)
      setError("Failed to update quantity. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete item
  const handleDeleteItem = async () => {
    if (!currentItem) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Remove item from state
      const updatedItems = stockItems.filter((item) => item.id !== currentItem.id)
      setStockItems(updatedItems)

      // In a real app, you would delete from Firestore here
      // await deleteDoc(doc(db, "stockItems", currentItem.id))

      setSuccess("Item deleted successfully")
      setIsDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error deleting item:", err)
      setError("Failed to delete item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clear success message after 3 seconds
  if (success) {
    setTimeout(() => {
      setSuccess(null)
    }, 3000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Stock Management
          </CardTitle>
          <CardDescription>Manage inventory for both residences</CardDescription>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "inventory" | "transactions")}>
          <TabsList className="mb-4">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="categoryFilter">Category:</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value as StockCategory | "All")}
                  >
                    <SelectTrigger id="categoryFilter" className="w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Appliances">Appliances</SelectItem>
                      <SelectItem value="Cleaning">Cleaning</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Residence
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                          No items found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.notes && <div className="text-xs text-gray-500">{item.notes}</div>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div
                              className={`font-medium ${
                                item.quantity <= item.minQuantity ? "text-red-600" : "text-gray-900"
                              }`}
                            >
                              {item.quantity} {item.unit}
                            </div>
                            {item.quantity <= item.minQuantity && <div className="text-xs text-red-600">Low stock</div>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{item.residence}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm" onClick={() => openUpdateDialog(item)}>
                                Update Stock
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-6">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No transaction history available.</div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => {
                        const item = stockItems.find((item) => item.id === transaction.stockItemId)
                        return (
                          <tr key={transaction.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {transaction.date.toLocaleDateString()} {transaction.date.toLocaleTimeString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{item?.name || "Unknown Item"}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <Badge
                                variant="outline"
                                className={
                                  transaction.type === "add"
                                    ? "text-green-600 border-green-200"
                                    : "text-red-600 border-red-200"
                                }
                              >
                                {transaction.type === "add" ? "Added" : "Removed"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              {transaction.quantity} {item?.unit || "units"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">{transaction.updatedBy}</td>
                            <td className="px-4 py-3 text-sm">{transaction.reason}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Edit Stock Item" : "Add New Stock Item"}</DialogTitle>
            <DialogDescription>
              {currentItem ? "Update the details of this stock item." : "Enter the details of the new stock item."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category*
              </Label>
              <Select
                value={formData.category as string}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Appliances">Appliances</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity*
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minQuantity" className="text-right">
                Min Quantity*
              </Label>
              <Input
                id="minQuantity"
                name="minQuantity"
                type="number"
                value={formData.minQuantity}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">
                Unit*
              </Label>
              <Input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="residence" className="text-right">
                Residence*
              </Label>
              <Select
                value={formData.residence as string}
                onValueChange={(value) => handleSelectChange("residence", value)}
              >
                <SelectTrigger id="residence" className="col-span-3">
                  <SelectValue placeholder="Select residence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="My Domain Salt River">My Domain Salt River</SelectItem>
                  <SelectItem value="My Domain Observatory">My Domain Observatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Optional notes about this item"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : currentItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Quantity Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Stock Quantity</DialogTitle>
            <DialogDescription>{currentItem && `Update the quantity of ${currentItem.name}.`}</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updateType" className="text-right">
                Action
              </Label>
              <Select value={updateType} onValueChange={(value) => setUpdateType(value as "add" | "remove")}>
                <SelectTrigger id="updateType" className="col-span-3">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add to Stock</SelectItem>
                  <SelectItem value="remove">Remove from Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updateQuantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="updateQuantity"
                type="number"
                value={updateQuantity}
                onChange={(e) => setUpdateQuantity(Number.parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updateReason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="updateReason"
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                className="col-span-3"
                placeholder="Reason for this stock update"
              />
            </div>
            {currentItem && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm">
                  <span className="font-medium">Current Stock:</span> {currentItem.quantity} {currentItem.unit}
                </div>
                <div className="text-sm">
                  <span className="font-medium">After Update:</span>{" "}
                  {updateType === "add" ? currentItem.quantity + updateQuantity : currentItem.quantity - updateQuantity}{" "}
                  {currentItem.unit}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuantity} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Quantity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Stock Item</DialogTitle>
            <DialogDescription>
              {currentItem && `Are you sure you want to delete ${currentItem.name}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
