"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  QrCode,
  Scan,
  Shield,
  MapPin,
  FlaskConical,
  User,
  CheckCircle,
  AlertCircle,
  Camera,
  Search,
  ArrowLeft,
  ExternalLink,
  Download,
} from "lucide-react"
import Link from "next/link"

interface VerificationResult {
  isValid: boolean
  herbDetails: {
    id: string
    name: string
    scientificName: string
    quantity: number
    unit: string
    grade: "A" | "B" | "C" | "F"
    images: string[]
  }
  farmerDetails: {
    name: string
    location: string
    collectionDate: string
    gpsCoordinates: {
      latitude: number
      longitude: number
    }
  }
  labDetails: {
    name: string
    testDate: string
    technician: string
    testResults: {
      purity: number
      moisture: number
      heavyMetals: "pass" | "fail"
      pesticides: "pass" | "fail"
      microbial: "pass" | "fail"
      overallGrade: "A" | "B" | "C" | "F"
    }
    certificationNumber: string
  }
  blockchainDetails: {
    transactionHash: string
    blockNumber: number
    timestamp: string
    verified: boolean
  }
}

export default function ConsumerPortal() {
  const [activeTab, setActiveTab] = useState("verify")
  const [qrCode, setQrCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleQRScan = () => {
    setIsScanning(true)
    // Simulate QR scanning
    setTimeout(() => {
      setQrCode("QR001")
      setIsScanning(false)
    }, 2000)
  }

  const handleVerification = async () => {
    if (!qrCode) return

    setIsVerifying(true)
    setShowResult(false)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock verification result
    const mockResult: VerificationResult = {
      isValid: true,
      herbDetails: {
        id: "HC001",
        name: "Ashwagandha",
        scientificName: "Withania somnifera",
        quantity: 25,
        unit: "kg",
        grade: "A",
        images: ["/ashwagandha-herbs.jpg", "/placeholder.svg?key=herb2"],
      },
      farmerDetails: {
        name: "Rajesh Kumar",
        location: "Rajasthan, India",
        collectionDate: "2024-01-15",
        gpsCoordinates: {
          latitude: 28.6139,
          longitude: 77.209,
        },
      },
      labDetails: {
        name: "Ayurveda Quality Labs",
        testDate: "2024-01-16",
        technician: "Dr. Meera Singh",
        testResults: {
          purity: 95.2,
          moisture: 8.5,
          heavyMetals: "pass",
          pesticides: "pass",
          microbial: "pass",
          overallGrade: "A",
        },
        certificationNumber: "AQL-2024-001",
      },
      blockchainDetails: {
        transactionHash: "0x1234567890abcdef",
        blockNumber: 18945672,
        timestamp: "2024-01-16T10:30:00Z",
        verified: true,
      },
    }

    setVerificationResult(mockResult)
    setIsVerifying(false)
    setShowResult(true)
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

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case "A":
        return "default"
      case "B":
        return "secondary"
      case "C":
        return "outline"
      case "F":
        return "destructive"
      default:
        return "outline"
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
            <Badge variant="secondary">Consumer Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verify">Verify Product</TabsTrigger>
            <TabsTrigger value="scan">QR Scanner</TabsTrigger>
            <TabsTrigger value="about">About Verification</TabsTrigger>
          </TabsList>

          {/* Verify Tab */}
          <TabsContent value="verify" className="space-y-6">
            {!showResult ? (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Verify Ayurvedic Herb Authenticity</CardTitle>
                  <CardDescription>
                    Enter the QR code from your herb product to verify its authenticity and view complete traceability
                    information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="qr-input">QR Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="qr-input"
                          placeholder="Enter QR code (e.g., QR001)"
                          value={qrCode}
                          onChange={(e) => setQrCode(e.target.value)}
                        />
                        <Button variant="outline" onClick={() => setActiveTab("scan")}>
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleVerification} disabled={!qrCode || isVerifying} className="w-full" size="lg">
                      {isVerifying ? (
                        <>
                          <Search className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Authenticity
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Verification is powered by blockchain technology</p>
                    <p>ensuring complete transparency and authenticity</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Verification Status */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      {verificationResult?.isValid ? (
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-primary">Verified Authentic</h2>
                            <p className="text-muted-foreground">This product has been verified as genuine</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
                            <p className="text-muted-foreground">This product could not be verified</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {verificationResult?.isValid && (
                  <>
                    {/* Herb Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-primary" />
                          Herb Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-semibold">{verificationResult.herbDetails.name}</h3>
                              <p className="text-sm text-muted-foreground italic">
                                {verificationResult.herbDetails.scientificName}
                              </p>
                            </div>

                            <div className="grid gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Product ID:</span>
                                <span className="font-medium">{verificationResult.herbDetails.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quantity:</span>
                                <span className="font-medium">
                                  {verificationResult.herbDetails.quantity} {verificationResult.herbDetails.unit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Quality Grade:</span>
                                <Badge variant={getGradeBadgeVariant(verificationResult.herbDetails.grade)}>
                                  Grade {verificationResult.herbDetails.grade}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Product Images</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {verificationResult.herbDetails.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image || "/placeholder.svg"}
                                  alt={`${verificationResult.herbDetails.name} ${index + 1}`}
                                  className="w-full h-24 object-cover rounded border"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Farmer Details */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-accent" />
                          Farmer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Farmer Name:</span>
                              <span className="font-medium">{verificationResult.farmerDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Location:</span>
                              <span className="font-medium">{verificationResult.farmerDetails.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Collection Date:</span>
                              <span className="font-medium">{verificationResult.farmerDetails.collectionDate}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">GPS Coordinates</h4>
                            <div className="p-3 bg-muted/30 rounded text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">Verified Location</span>
                              </div>
                              <p className="text-muted-foreground">
                                {verificationResult.farmerDetails.gpsCoordinates.latitude.toFixed(6)},{" "}
                                {verificationResult.farmerDetails.gpsCoordinates.longitude.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Lab Test Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-chart-2" />
                          Laboratory Test Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Laboratory:</span>
                              <span className="font-medium">{verificationResult.labDetails.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Test Date:</span>
                              <span className="font-medium">{verificationResult.labDetails.testDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Technician:</span>
                              <span className="font-medium">{verificationResult.labDetails.technician}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Certification:</span>
                              <span className="font-medium">{verificationResult.labDetails.certificationNumber}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium">Quality Test Results</h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Purity</span>
                                    <span className="font-medium">
                                      {verificationResult.labDetails.testResults.purity}%
                                    </span>
                                  </div>
                                  <Progress value={verificationResult.labDetails.testResults.purity} className="h-2" />
                                </div>

                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Moisture Content</span>
                                    <span className="font-medium">
                                      {verificationResult.labDetails.testResults.moisture}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={verificationResult.labDetails.testResults.moisture}
                                    className="h-2"
                                  />
                                </div>
                              </div>

                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span>Heavy Metals:</span>
                                  <Badge
                                    variant={
                                      verificationResult.labDetails.testResults.heavyMetals === "pass"
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {verificationResult.labDetails.testResults.heavyMetals.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pesticide Residue:</span>
                                  <Badge
                                    variant={
                                      verificationResult.labDetails.testResults.pesticides === "pass"
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {verificationResult.labDetails.testResults.pesticides.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>Microbial Load:</span>
                                  <Badge
                                    variant={
                                      verificationResult.labDetails.testResults.microbial === "pass"
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {verificationResult.labDetails.testResults.microbial.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Overall Quality Grade</span>
                                <div
                                  className={`text-2xl font-bold ${getGradeColor(verificationResult.labDetails.testResults.overallGrade)}`}
                                >
                                  Grade {verificationResult.labDetails.testResults.overallGrade}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Blockchain Verification */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-chart-4" />
                          Blockchain Verification
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <span className="font-medium">Blockchain Verified</span>
                          </div>

                          <div className="grid gap-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transaction Hash:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">
                                  {verificationResult.blockchainDetails.transactionHash}
                                </span>
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Block Number:</span>
                              <span className="font-medium">
                                {verificationResult.blockchainDetails.blockNumber.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Timestamp:</span>
                              <span className="font-medium">
                                {new Date(verificationResult.blockchainDetails.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button onClick={() => setShowResult(false)} variant="outline" className="flex-1">
                        <Search className="h-4 w-4 mr-2" />
                        Verify Another Product
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          {/* QR Scanner Tab */}
          <TabsContent value="scan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Scanner</CardTitle>
                <CardDescription>Scan the QR code on your herb product packaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 mb-6">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">{isScanning ? "Scanning QR Code..." : "Ready to Scan"}</p>
                    <p className="text-sm text-muted-foreground mb-4">Position the QR code within the camera frame</p>
                    <Button onClick={handleQRScan} disabled={isScanning}>
                      <Scan className="h-4 w-4 mr-2" />
                      {isScanning ? "Scanning..." : "Start Camera"}
                    </Button>
                  </div>

                  {qrCode && (
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Scanned QR Code:</p>
                      <p className="font-mono text-lg font-bold mb-3">{qrCode}</p>
                      <Button onClick={() => setActiveTab("verify")}>Proceed to Verification</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Herb Verification</CardTitle>
                <CardDescription>Understanding our blockchain-powered authenticity system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">How Verification Works</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Farm Collection</h4>
                          <p className="text-sm text-muted-foreground">
                            Farmers record herb collection with GPS location and images
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-accent">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Laboratory Testing</h4>
                          <p className="text-sm text-muted-foreground">
                            Quality tests are conducted and results are recorded
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-chart-2">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Blockchain Storage</h4>
                          <p className="text-sm text-muted-foreground">
                            All data is stored immutably on the blockchain
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-chart-4">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Consumer Verification</h4>
                          <p className="text-sm text-muted-foreground">You can verify authenticity using the QR code</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What You Can Verify</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Product authenticity</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Farmer information</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Collection location</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Quality test results</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Laboratory certification</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Blockchain proof</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2">Why Trust Our System?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our verification system uses blockchain technology to ensure that all data is immutable and
                    transparent. Once information is recorded, it cannot be altered or tampered with, providing you with
                    complete confidence in the authenticity and quality of your Ayurvedic herbs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
