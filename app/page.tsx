import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center mb-8">
        <div className="flex justify-center mb-6">
          <Image src="/images/reztek-logo.png" alt="RezTek Logo" width={300} height={150} priority />
        </div>
        <p className="text-xl text-gray-600 mb-8">Streamlined maintenance management for My Domain residences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center bg-gray-50 rounded-t-lg">
            <CardTitle className="text-2xl">Tenant Portal</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4 px-6">
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
              <li>Easy maintenance request submission</li>
              <li>Track request status in real-time</li>
              <li>View request history</li>
              <li>Provide feedback on completed work</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Link href="/tenant/login" className="w-full">
              <Button className="w-full bg-gray-900 hover:bg-gray-800">Access Tenant Portal</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center bg-gray-50 rounded-t-lg">
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-4 px-6">
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
              <li>Comprehensive request management</li>
              <li>Detailed tenant information</li>
              <li>Real-time analytics dashboard</li>
              <li>Stock management for both buildings</li>
            </ul>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Link href="/admin/login" className="w-full">
              <Button className="w-full bg-gray-900 hover:bg-gray-800">Access Admin Portal</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>© {new Date().getFullYear()} RezTek Maintenance Portal. All rights reserved.</p>
      </div>
    </div>
  )
}
