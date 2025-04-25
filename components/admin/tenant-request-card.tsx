import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, Mail } from "lucide-react"

interface TenantRequestCardProps {
  request: {
    id: string
    title: string
    description: string
    status: string
    tenant: {
      name: string
      email: string
      phone: string
    }
    createdAt: Date
  }
}

export function TenantRequestCard({ request }: TenantRequestCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${request.tenant.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${request.tenant.email}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{request.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{request.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-2" />
              {request.tenant.phone}
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              {request.tenant.email}
            </Button>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
} 