import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { StockItem } from "@/lib/types"

export function StockPDFDownloader() {
  const downloadPDF = async () => {
    try {
      // Fetch stock data
      const stockRef = collection(db, "stockItems")
      const snapshot = await getDocs(stockRef)
      const stockData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockItem[]

      // Create PDF
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text("Stock Inventory Report", 14, 15)
      
      // Add date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

      // Create table data
      const tableData = stockData.map(item => {
        // Check if item is low in stock
        const isLowStock = item.quantity <= item.minQuantity
        const quantityText = isLowStock ? `${item.quantity} ${item.unit}\nLow stock` : `${item.quantity} ${item.unit}`
        
        return [
          item.name,
          item.notes || '-', // Description/notes
          item.category,
          quantityText,
          item.residence,
          item.minQuantity.toString(),
          new Date(item.lastUpdated).toLocaleDateString()
        ]
      })

      // Sort data by residence and category
      tableData.sort((a, b) => {
        if (a[4] === b[4]) { // If same residence
          return a[2].localeCompare(b[2]) // Sort by category
        }
        return a[4].localeCompare(b[4]) // Sort by residence
      })

      // Add table using autoTable
      autoTable(doc, {
        head: [['Item Name', 'Description', 'Category', 'Quantity', 'Residence', 'Min Qty', 'Last Updated']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Item Name
          1: { cellWidth: 35 }, // Description
          2: { cellWidth: 20 }, // Category
          3: { cellWidth: 20 }, // Quantity
          4: { cellWidth: 30 }, // Residence
          5: { cellWidth: 15 }, // Min Quantity
          6: { cellWidth: 20 }  // Last Updated
        },
        didParseCell: function(data) {
          // Highlight low stock items in red
          if (data.column.index === 3 && data.cell.raw && data.cell.raw.toString().includes('Low stock')) {
            data.cell.styles.textColor = [255, 0, 0]
          }
        },
        didDrawPage: function(data) {
          // Add summary statistics after the table
          const totalItems = stockData.length
          const totalQuantity = stockData.reduce((acc, curr) => acc + curr.quantity, 0)
          const lowStockItems = stockData.filter(item => item.quantity <= item.minQuantity).length
          
          doc.setFontSize(12)
          if (data.cursor) {
            doc.text(`Total Items: ${totalItems}`, 14, data.cursor.y + 20)
            doc.text(`Total Quantity: ${totalQuantity}`, 14, data.cursor.y + 30)
            doc.text(`Low Stock Items: ${lowStockItems}`, 14, data.cursor.y + 40)

            // Add residence-wise summary
            const residences = [...new Set(stockData.map(item => item.residence))]
            let y = data.cursor.y + 60
            doc.setFontSize(11)
            doc.text('Stock by Residence:', 14, y)
            y += 10
            residences.forEach(residence => {
              const residenceItems = stockData.filter(item => item.residence === residence)
              const residenceLowStock = residenceItems.filter(item => item.quantity <= item.minQuantity).length
              doc.setFontSize(10)
              doc.text(`${residence}: ${residenceItems.length} items (${residenceLowStock} low stock)`, 20, y)
              y += 10
            })
          }
        }
      })

      // Save PDF
      doc.save('stock-inventory.pdf')
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <Button onClick={downloadPDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Download Stock PDF
    </Button>
  )
} 