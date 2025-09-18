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
  MapPin,
  Camera,
  QrCode,
  Plus,
  Calendar,
  Clock,
  User,
  LogOut,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

interface HerbCollection {
  id: string
  herbName: string
  quantity: number
  unit: string
  collectionDate: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  status: "pending" | "verified" | "rejected"
  qrCode: string
  images: string[]
}

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isCollecting, setIsCollecting] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [collections] = useState<HerbCollection[]>([
    {
      id: "HC001",
      herbName: "Ashwagandha",
      quantity: 25,
      unit: "kg",
      collectionDate: "2024-01-15",
      location: {
        latitude: 28.6139,
        longitude: 77.209,
        address: "Rajasthan, India",
      },
      status: "verified",
      qrCode: "QR001",
      images: ["/ashwagandha-herbs.jpg"],
    },
    {
      id: "HC002",
      herbName: "Turmeric",
      quantity: 15,
      unit: "kg",
      collectionDate: "2024-01-14",
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: "Delhi, India",
      },
      status: "pending",
      qrCode: "QR002",
      images: ["/turmeric-roots.jpg"],
    },
  ])

  const getCurrentLocation = () => {
    setIsCollecting(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsCollecting(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsCollecting(false)
        },
      )
    }
  }

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Collection submitted")
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
            <Badge variant="secondary">Farmer Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>Rajesh Kumar</span>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="new-collection">New Collection</TabsTrigger>
            <TabsTrigger value="history">Collection History</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified</CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">75% success rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">Awaiting verification</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">340kg</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Collections</CardTitle>
                  <CardDescription>Your latest herb collection records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collections.slice(0, 3).map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={collection.images[0] || "/placeholder.svg"}
                            alt={collection.herbName}
                            className="w-10 h-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{collection.herbName}</p>
                            <p className="text-sm text-muted-foreground">
                              {collection.quantity} {collection.unit}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            collection.status === "verified"
                              ? "default"
                              : collection.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {collection.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("new-collection")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                  <Button onClick={() => setActiveTab("history")} className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* New Collection Tab */}
          <TabsContent value="new-collection" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record New Herb Collection</CardTitle>
                <CardDescription>Document your herb collection with GPS tracking and images</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCollection} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="herbName">Herb Name</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select herb type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ashwagandha">Ashwagandha</SelectItem>
                          <SelectItem value="turmeric">Turmeric</SelectItem>
                          <SelectItem value="neem">Neem</SelectItem>
                          <SelectItem value="tulsi">Tulsi</SelectItem>
                          <SelectItem value="brahmi">Brahmi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">Collection Date</Label>
                      <Input id="collectionDate" type="date" required />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" type="number" placeholder="Enter quantity" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="bundles">Bundles</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional notes about the collection (quality, conditions, etc.)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>GPS Location</Label>
                    <div className="flex items-center gap-4">
                      <Button type="button" onClick={getCurrentLocation} disabled={isCollecting} variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        {isCollecting ? "Getting Location..." : "Get Current Location"}
                      </Button>
                      {location && (
                        <div className="text-sm text-muted-foreground">
                          Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Upload Images</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop herb images</p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Record Collection
                    </Button>
                    <Button type="button" variant="outline">
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection History</CardTitle>
                <CardDescription>View all your herb collection records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collections.map((collection) => (
                    <div key={collection.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={collection.images[0] || "/placeholder.svg"}
                            alt={collection.herbName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h3 className="font-semibold">{collection.herbName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {collection.id}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            collection.status === "verified"
                              ? "default"
                              : collection.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {collection.status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {collection.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {collection.status === "rejected" && <AlertCircle className="h-3 w-3 mr-1" />}
                          {collection.status}
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>
                          <p className="font-medium">
                            {collection.quantity} {collection.unit}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">{collection.collectionDate}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">{collection.location.address}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">QR Code:</span>
                          <p className="font-medium">{collection.qrCode}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <QrCode className="h-3 w-3 mr-1" />
                          View QR
                        </Button>
                        <Button size="sm" variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          View Location
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
