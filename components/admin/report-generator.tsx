"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Download, Loader2 } from "lucide-react"
import type { MaintenanceRequest, Residence } from "@/lib/types"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"

interface ReportGeneratorProps {
  requests: MaintenanceRequest[]
}

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
    fontWeight: "bold",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    borderBottomStyle: "solid",
    alignItems: "center",
    minHeight: 30,
  },
  tableRowHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    width: "25%",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    borderRightStyle: "solid",
    paddingLeft: 5,
  },
  tableColLast: {
    width: "25%",
    paddingLeft: 5,
  },
  tableCell: {
    fontSize: 10,
    padding: 5,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#bfbfbf",
    borderStyle: "solid",
    padding: 10,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: "center",
  },
})

// PDF Document Component
const MaintenanceReport = ({
  requests,
  reportDate,
  residenceFilter,
}: {
  requests: MaintenanceRequest[]
  reportDate: Date
  residenceFilter: Residence | "All"
}) => {
  // Filter requests by date and residence
  const filteredRequests = requests.filter((req) => {
    const reqDate = new Date(req.submittedAt)
    const isMatchingDate = reqDate.toDateString() === reportDate.toDateString()
    const isMatchingResidence = residenceFilter === "All" || req.tenant?.residence === residenceFilter
    return isMatchingDate && isMatchingResidence
  })

  // Calculate statistics
  const totalRequests = filteredRequests.length
  const pendingRequests = filteredRequests.filter((req) => req.status !== "Completed").length
  const completedRequests = filteredRequests.filter((req) => req.status === "Completed").length

  const saltRiverRequests = filteredRequests.filter((req) => req.tenant?.residence === "My Domain Salt River").length
  const observatoryRequests = filteredRequests.filter((req) => req.tenant?.residence === "My Domain Observatory").length

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>RezTek Maintenance Report</Text>
        <Text style={{ fontSize: 14, marginBottom: 20, textAlign: "center" }}>{formatDate(reportDate)}</Text>

        {/* Summary Statistics */}
        <View style={styles.summaryBox}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Requests:</Text>
            <Text style={styles.summaryValue}>{totalRequests}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pending Requests:</Text>
            <Text style={styles.summaryValue}>{pendingRequests}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed Requests:</Text>
            <Text style={styles.summaryValue}>{completedRequests}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completion Rate:</Text>
            <Text style={styles.summaryValue}>
              {totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* Residence Breakdown */}
        <Text style={styles.subheader}>Residence Breakdown</Text>
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>My Domain Salt River:</Text>
            <Text style={styles.summaryValue}>{saltRiverRequests} requests</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>My Domain Observatory:</Text>
            <Text style={styles.summaryValue}>{observatoryRequests} requests</Text>
          </View>
        </View>

        {/* Request Details */}
        <Text style={styles.subheader}>Request Details</Text>
        {filteredRequests.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Request ID</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Location</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Status</Text>
              </View>
              <View style={styles.tableColLast}>
                <Text style={styles.tableCell}>Residence</Text>
              </View>
            </View>

            {/* Table Rows */}
            {filteredRequests.map((request) => (
              <View key={request.id} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{request.waitingNumber}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{request.issueLocation}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{request.status}</Text>
                </View>
                <View style={styles.tableColLast}>
                  <Text style={styles.tableCell}>{request.tenant?.residence || "Unknown"}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
            No maintenance requests found for this date.
          </Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Generated on {new Date().toLocaleString()} | RezTek Maintenance Portal</Text>
      </Page>
    </Document>
  )
}

export function ReportGenerator({ requests }: ReportGeneratorProps) {
  const [reportDate, setReportDate] = useState<Date>(new Date())
  const [residenceFilter, setResidenceFilter] = useState<Residence | "All">("All")
  const [includeDetails, setIncludeDetails] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  // Filter requests by date and residence
  const filteredRequests = requests.filter((req) => {
    const reqDate = new Date(req.submittedAt)
    const isMatchingDate = reqDate.toDateString() === reportDate.toDateString()
    const isMatchingResidence = residenceFilter === "All" || req.tenant?.residence === residenceFilter
    return isMatchingDate && isMatchingResidence
  })

  // Generate PDF
  const generatePDF = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const blob = await pdf(
        <MaintenanceReport requests={requests} reportDate={reportDate} residenceFilter={residenceFilter} />,
      ).toBlob()

      setPdfBlob(blob)
    } catch (err) {
      console.error("Error generating PDF:", err)
      setError("Failed to generate PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  // Download PDF
  const downloadPDF = () => {
    if (!pdfBlob) return

    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `maintenance-report-${reportDate.toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-ZA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Maintenance Report Generator
        </CardTitle>
        <CardDescription>Generate daily maintenance reports in PDF format</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Date</Label>
              <DatePicker date={reportDate} onDateChange={setReportDate} />
            </div>
            <div className="space-y-2">
              <Label>Residence Filter</Label>
              <Select value={residenceFilter} onValueChange={(value) => setResidenceFilter(value as Residence | "All")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select residence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Residences</SelectItem>
                  <SelectItem value="My Domain Salt River">My Domain Salt River</SelectItem>
                  <SelectItem value="My Domain Observatory">My Domain Observatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={includeDetails}
              onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
            />
            <Label htmlFor="includeDetails">Include detailed request information</Label>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Report Preview</h3>
            <p className="text-sm text-gray-600 mb-2">
              Date: <span className="font-medium">{formatDate(reportDate)}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Residence: <span className="font-medium">{residenceFilter}</span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Requests found: <span className="font-medium">{filteredRequests.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              The report will include summary statistics and{" "}
              {includeDetails ? "detailed request information" : "basic request counts"}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={generatePDF} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF
                </>
              )}
            </Button>

            {pdfBlob && (
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
