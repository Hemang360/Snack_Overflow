import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, Users, FlaskConical, Shield, QrCode, MapPin } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-balance">Herb Abhilekh</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="hidden sm:flex">
              Blockchain Verified
            </Badge>
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            The complete platform for <span className="text-primary">Ayurvedic herb</span> traceability.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Securely track, verify, and authenticate Ayurvedic herbs from farm collection through laboratory testing to
            consumer verification using blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Blockchain Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Real-time Tracking</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">GPS</div>
            <div className="text-sm text-muted-foreground">Location Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">QR</div>
            <div className="text-sm text-muted-foreground">Instant Verification</div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-balance">Choose Your Role</h3>
          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
            Access specialized dashboards designed for your specific needs in the herb traceability ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/farmer">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Farmer</CardTitle>
                <CardDescription>Record herb collections with GPS tracking and image documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    GPS Location Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code Generation
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Herb Documentation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/laboratory">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-lg bg-accent/10 w-fit group-hover:bg-accent/20 transition-colors">
                  <FlaskConical className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Laboratory</CardTitle>
                <CardDescription>Scan QR codes and conduct quality testing with detailed reports</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code Scanning
                  </li>
                  <li className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Quality Testing
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Test Reports
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-lg bg-chart-2/10 w-fit group-hover:bg-chart-2/20 transition-colors">
                  <Shield className="h-8 w-8 text-chart-2" />
                </div>
                <CardTitle>Administrator</CardTitle>
                <CardDescription>Manage system overview, analytics, and user administration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    User Management
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    System Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Data Overview
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>

          <Link href="/consumer">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-lg bg-chart-4/10 w-fit group-hover:bg-chart-4/20 transition-colors">
                  <QrCode className="h-8 w-8 text-chart-4" />
                </div>
                <CardTitle>Consumer</CardTitle>
                <CardDescription>Verify product authenticity and view complete traceability history</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Product Verification
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Trace History
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Authenticity Check
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-balance">Comprehensive Traceability</h3>
          <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
            Advanced features ensuring complete transparency and authenticity in the Ayurvedic herb supply chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">GPS Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Precise location tracking for every herb collection point with immutable GPS coordinates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <QrCode className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">QR Code System</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Unique QR codes for instant verification and seamless data transfer between stakeholders.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-2/10">
                  <Shield className="h-5 w-5 text-chart-2" />
                </div>
                <CardTitle className="text-lg">Blockchain Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Immutable blockchain records ensuring data integrity and preventing tampering.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <FlaskConical className="h-5 w-5 text-chart-4" />
                </div>
                <CardTitle className="text-lg">Quality Testing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive laboratory testing with detailed reports and quality certifications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-5/10">
                  <Users className="h-5 w-5 text-chart-5" />
                </div>
                <CardTitle className="text-lg">Multi-Role Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Specialized interfaces for farmers, laboratories, administrators, and consumers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Ayurvedic Focus</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Purpose-built for Ayurvedic herbs with specialized data fields and requirements.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="font-semibold">Herb Abhilekh</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Blockchain-powered traceability for authentic Ayurvedic herbs
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
