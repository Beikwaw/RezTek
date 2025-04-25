import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Feedback, MaintenanceRequest } from "@/lib/types"

export function FeedbackPDFDownloader() {
  const downloadPDF = async () => {
    try {
      // Fetch feedback data
      const feedbackRef = collection(db, "feedback")
      const feedbackSnapshot = await getDocs(feedbackRef)
      const feedbackData = feedbackSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          requestId: data.requestId || '',
          rating: data.rating || 0,
          description: data.description || '',
          submittedAt: data.submittedAt?.toDate() || new Date()
        } as Feedback
      })

      // Fetch maintenance requests to get tenant information
      const requestsRef = collection(db, "maintenanceRequests")
      const requestsSnapshot = await getDocs(requestsRef)
      const requestsData = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRequest[]

      // Create PDF
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text("Tenant Feedback Report", 14, 15)
      
      // Add date
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

      // Create table data
      const tableData = feedbackData.map(feedback => {
        const request = requestsData.find(req => req.id === feedback.requestId)
        return [
          request?.waitingNumber || 'N/A',
          request?.tenant?.residence || 'N/A',
          request?.tenant?.name || 'N/A',
          (feedback.rating || 0).toString(),
          feedback.description || '-',
          new Date(feedback.submittedAt).toLocaleDateString()
        ]
      })

      // Sort data by residence and date
      tableData.sort((a, b) => {
        if (a[1] === b[1]) { // If same residence
          return new Date(b[5]).getTime() - new Date(a[5]).getTime() // Sort by date descending
        }
        return a[1].localeCompare(b[1]) // Sort by residence
      })

      // Add table using autoTable
      autoTable(doc, {
        head: [['Request #', 'Residence', 'Tenant', 'Rating', 'Feedback', 'Date']],
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
          cellPadding: 2,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Request #
          1: { cellWidth: 30 }, // Residence
          2: { cellWidth: 30 }, // Tenant
          3: { cellWidth: 15 }, // Rating
          4: { cellWidth: 50 }, // Feedback
          5: { cellWidth: 20 }  // Date
        },
        didParseCell: function(data) {
          // Highlight low ratings (1-2) in red
          if (data.column.index === 3 && data.cell.raw && parseInt(data.cell.raw.toString()) <= 2) {
            data.cell.styles.textColor = [255, 0, 0]
          }
        },
        didDrawPage: function(data) {
          // Add summary statistics after the table
          const totalFeedback = feedbackData.length
          const averageRating = feedbackData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalFeedback || 0
          
          doc.setFontSize(12)
          if (data.cursor) {
            doc.text(`Total Feedback: ${totalFeedback}`, 14, data.cursor.y + 20)
            doc.text(`Average Rating: ${averageRating.toFixed(1)}/5`, 14, data.cursor.y + 30)

            // Add residence-wise summary
            const residences = [...new Set(feedbackData.map(f => {
              const request = requestsData.find(req => req.id === f.requestId)
              return request?.tenant?.residence || 'Unknown'
            }))]

            let y = data.cursor.y + 50
            doc.setFontSize(11)
            doc.text('Feedback by Residence:', 14, y)
            y += 10

            residences.forEach(residence => {
              const residenceFeedback = feedbackData.filter(f => {
                const request = requestsData.find(req => req.id === f.requestId)
                return request?.tenant?.residence === residence
              })
              const avgResidenceRating = residenceFeedback.reduce((acc, curr) => acc + (curr.rating || 0), 0) / residenceFeedback.length || 0
              doc.setFontSize(10)
              doc.text(
                `${residence}: ${residenceFeedback.length} feedback(s), Avg Rating: ${avgResidenceRating.toFixed(1)}/5`,
                20,
                y
              )
              y += 10
            })
          }
        }
      })

      // Save PDF
      doc.save('tenant-feedback.pdf')
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  return (
    <Button onClick={downloadPDF} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Download Feedback PDF
    </Button>
  )
} 