"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Leaf,
  FlaskConical,
  QrCode,
  Scan,
  User,
  LogOut,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Camera,
  MapPin,
  TestTube,
} from "lucide-react"
import Link from "next/link"

interface TestSample {
  id: string
  qrCode: string
  herbName: string
  farmerName: string
  collectionDate: string
  location: string
  quantity: number
  unit: string
  testStatus: "pending" | "in-progress" | "completed" | "failed"
  testResults?: {
    purity: number
    moisture: number
    heavyMetals: "pass" | "fail"
    pesticides: "pass" | "fail"
    microbial: "pass" | "fail"
    overallGrade: "A" | "B" | "C" | "F"
  }
  testDate?: string
  technicianNotes?: string
}

export default function LaboratoryDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [scanningQR, setScanningQR] = useState(false)
  const [scannedCode, setScannedCode] = useState("")
  const [samples] = useState<TestSample[]>([
    {
      id: "TS001",
      qrCode: "QR001",
      herbName: "Ashwagandha",
      farmerName: "Rajesh Kumar",
      collectionDate: "2024-01-15",
      location: "Rajasthan, India",
      quantity: 25,
      unit: "kg",
      testStatus: "completed",
      testResults: {
        purity: 95,
        moisture: 8.5,
        heavyMetals: "pass",
        pesticides: "pass",
        microbial: "pass",
        overallGrade: "A",
      },
      testDate: "2024-01-16",
      technicianNotes: "Excellent quality sample with high purity levels.",
    },
    {
      id: "TS002",
      qrCode: "QR002",
      herbName: "Turmeric",
      farmerName: "Priya Sharma",
      collectionDate: "2024-01-14",
      location: "Kerala, India",
      quantity: 15,
      unit: "kg",
      testStatus: "in-progress",
      testDate: "2024-01-15",
    },
    {
      id: "TS003",
      qrCode: "QR003",
      herbName: "Neem",
      farmerName: "Amit Patel",
      collectionDate: "2024-01-13",
      location: "Gujarat, India",
      quantity: 20,
      unit: "kg",
      testStatus: "pending",
    },
  ])

  const handleQRScan = () => {
    setScanningQR(true)
    // Simulate QR scanning
    setTimeout(() => {
      setScannedCode("QR004")
      setScanningQR(false)
    }, 2000)
  }

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Test results submitted")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-primary"
      case "B":
        return "text-accent"
      case "C":
        return "text-yellow-500"
      case "F":
        return "text-destructive"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Herb Abhilekh</h1>
            </Link>
            <Badge variant="secondary">Laboratory Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>Dr. Meera Singh</span>
            </div>
            <Link href="/auth">
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scan">QR Scanner</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
                  <TestTube className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">91% completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Currently testing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">Quality standard</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Test Results</CardTitle>
                  <CardDescription>Latest completed quality assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {samples
                      .filter((s) => s.testStatus === "completed")
                      .map((sample) => (
                        <div key={sample.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FlaskConical className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{sample.herbName}</p>
                              <p className="text-sm text-muted-foreground">
                                {sample.farmerName} • {sample.testDate}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${getGradeColor(sample.testResults?.overallGrade || "")}`}
                            >
                              Grade {sample.testResults?.overallGrade}
                            </div>
                            <p className="text-xs text-muted-foreground">{sample.testResults?.purity}% purity</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Testing Queue</CardTitle>
                  <CardDescription>Samples awaiting quality assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {samples
                      .filter((s) => s.testStatus !== "completed")
                      .map((sample) => (
                        <div key={sample.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <QrCode className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{sample.herbName}</p>
                              <p className="text-sm text-muted-foreground">
                                {sample.farmerName} • {sample.quantity}
                                {sample.unit}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(sample.testStatus)}>
                            {sample.testStatus === "in-progress" && <Clock className="h-3 w-3 mr-1" />}
                            {sample.testStatus === "pending" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {sample.testStatus}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* QR Scanner Tab */}
          <TabsContent value="scan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Scan herb collection QR codes to begin testing process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 mb-6">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">{scanningQR ? "Scanning..." : "Ready to Scan"}</p>
                    <p className="text-sm text-muted-foreground mb-4">Position the QR code within the camera frame</p>
                    <Button onClick={handleQRScan} disabled={scanningQR}>
                      <Scan className="h-4 w-4 mr-2" />
                      {scanningQR ? "Scanning..." : "Start Scanner"}
                    </Button>
                  </div>

                  {scannedCode && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Scanned QR Code:</p>
                      <p className="font-mono text-lg font-bold">{scannedCode}</p>
                      <Button className="mt-3" onClick={() => setActiveTab("testing")}>
                        Proceed to Testing
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-qr">Manual QR Code Entry</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-qr"
                      placeholder="Enter QR code manually"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                    />
                    <Button variant="outline">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Testing Form</CardTitle>
                <CardDescription>Record comprehensive test results for herb samples</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTest} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sample-id">Sample ID</Label>
                      <Input id="sample-id" value={scannedCode || "TS004"} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-date">Test Date</Label>
                      <Input id="test-date" type="date" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Physical Tests</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="purity">Purity (%)</Label>
                        <Input id="purity" type="number" min="0" max="100" step="0.1" placeholder="95.5" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="moisture">Moisture Content (%)</Label>
                        <Input id="moisture" type="number" min="0" max="100" step="0.1" placeholder="8.5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Chemical Tests</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="heavy-metals">Heavy Metals</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Test result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pesticides">Pesticide Residue</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Test result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="microbial">Microbial Load</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Test result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pass">Pass</SelectItem>
                            <SelectItem value="fail">Fail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overall-grade">Overall Grade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Grade A - Excellent</SelectItem>
                        <SelectItem value="B">Grade B - Good</SelectItem>
                        <SelectItem value="C">Grade C - Fair</SelectItem>
                        <SelectItem value="F">Grade F - Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="technician-notes">Technician Notes</Label>
                    <Textarea
                      id="technician-notes"
                      placeholder="Additional observations, recommendations, or notes about the sample..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Test Images</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload test result images and documentation</p>
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Add Images
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Test Results
                    </Button>
                    <Button type="button" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Reports</CardTitle>
                <CardDescription>View and manage all quality test reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {samples
                    .filter((s) => s.testStatus === "completed")
                    .map((sample) => (
                      <div key={sample.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <FlaskConical className="h-10 w-10 text-primary" />
                            <div>
                              <h3 className="font-semibold">{sample.herbName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Sample ID: {sample.id} • QR: {sample.qrCode}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-xl font-bold ${getGradeColor(sample.testResults?.overallGrade || "")}`}
                            >
                              Grade {sample.testResults?.overallGrade}
                            </div>
                            <Badge variant="default">Certified</Badge>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm mb-4">
                          <div>
                            <span className="text-muted-foreground">Farmer:</span>
                            <p className="font-medium">{sample.farmerName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Collection Date:</span>
                            <p className="font-medium">{sample.collectionDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Test Date:</span>
                            <p className="font-medium">{sample.testDate}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">{sample.location}</p>
                          </div>
                        </div>

                        {sample.testResults && (
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 text-sm mb-4 p-3 bg-muted/30 rounded">
                            <div>
                              <span className="text-muted-foreground">Purity:</span>
                              <p className="font-medium">{sample.testResults.purity}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Moisture:</span>
                              <p className="font-medium">{sample.testResults.moisture}%</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Heavy Metals:</span>
                              <p
                                className={`font-medium ${sample.testResults.heavyMetals === "pass" ? "text-primary" : "text-destructive"}`}
                              >
                                {sample.testResults.heavyMetals.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pesticides:</span>
                              <p
                                className={`font-medium ${sample.testResults.pesticides === "pass" ? "text-primary" : "text-destructive"}`}
                              >
                                {sample.testResults.pesticides.toUpperCase()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Microbial:</span>
                              <p
                                className={`font-medium ${sample.testResults.microbial === "pass" ? "text-primary" : "text-destructive"}`}
                              >
                                {sample.testResults.microbial.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        )}

                        {sample.technicianNotes && (
                          <div className="mb-4">
                            <span className="text-sm text-muted-foreground">Technician Notes:</span>
                            <p className="text-sm mt-1">{sample.technicianNotes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Download PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            <QrCode className="h-3 w-3 mr-1" />
                            View QR
                          </Button>
                          <Button size="sm" variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            Location
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
