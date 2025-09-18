"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Leaf,
  Users,
  FlaskConical,
  Shield,
  User,
  LogOut,
  TrendingUp,
  Activity,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Settings,
  Database,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface SystemStats {
  totalUsers: number
  totalCollections: number
  totalTests: number
  verificationRate: number
  monthlyGrowth: number
}

interface UserData {
  id: string
  name: string
  email: string
  role: "farmer" | "laboratory" | "admin"
  status: "active" | "inactive" | "pending"
  joinDate: string
  lastActive: string
  collections?: number
  tests?: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats] = useState<SystemStats>({
    totalUsers: 1247,
    totalCollections: 3456,
    totalTests: 2891,
    verificationRate: 94.2,
    monthlyGrowth: 12.5,
  })

  const [users] = useState<UserData[]>([
    {
      id: "U001",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      role: "farmer",
      status: "active",
      joinDate: "2024-01-10",
      lastActive: "2024-01-20",
      collections: 24,
    },
    {
      id: "U002",
      name: "Dr. Meera Singh",
      email: "meera@labtech.com",
      role: "laboratory",
      status: "active",
      joinDate: "2024-01-05",
      lastActive: "2024-01-20",
      tests: 156,
    },
    {
      id: "U003",
      name: "Priya Sharma",
      email: "priya@farmer.com",
      role: "farmer",
      status: "pending",
      joinDate: "2024-01-18",
      lastActive: "2024-01-19",
      collections: 0,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "farmer":
        return "bg-primary/10 text-primary"
      case "laboratory":
        return "bg-accent/10 text-accent"
      case "admin":
        return "bg-chart-2/10 text-chart-2"
      default:
        return "bg-muted text-muted-foreground"
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
            <Badge variant="secondary">Administrator Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span>Admin User</span>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />+{stats.monthlyGrowth}% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collections</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCollections.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                    +8.2% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lab Tests</CardTitle>
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTests.toLocaleString()}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                    +15.3% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.verificationRate}%</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                    +2.1% from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>Real-time platform usage metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm">Active Users (24h)</span>
                      </div>
                      <span className="font-bold">342</span>
                    </div>
                    <Progress value={68} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-accent" />
                        <span className="text-sm">New Collections (24h)</span>
                      </div>
                      <span className="font-bold">28</span>
                    </div>
                    <Progress value={45} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-chart-2" />
                        <span className="text-sm">Tests Completed (24h)</span>
                      </div>
                      <span className="font-bold">19</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent System Events</CardTitle>
                  <CardDescription>Latest platform activities and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">New farmer registration approved</p>
                        <p className="text-xs text-muted-foreground">Priya Sharma from Kerala • 2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <FlaskConical className="h-5 w-5 text-accent mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Quality test completed</p>
                        <p className="text-xs text-muted-foreground">Ashwagandha sample - Grade A • 4 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">System maintenance scheduled</p>
                        <p className="text-xs text-muted-foreground">
                          Database backup - Tomorrow 2:00 AM • 6 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">Manage farmers, laboratories, and administrators</p>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Farmers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">892</div>
                  <p className="text-xs text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Laboratories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">+2 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">No change</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Directory</CardTitle>
                <CardDescription>View and manage all platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Search users..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="farmer">Farmers</SelectItem>
                        <SelectItem value="laboratory">Laboratories</SelectItem>
                        <SelectItem value="admin">Administrators</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <p className="font-medium">
                              {user.role === "farmer" && user.collections && `${user.collections} collections`}
                              {user.role === "laboratory" && user.tests && `${user.tests} tests`}
                              {user.role === "admin" && "System Admin"}
                            </p>
                            <p className="text-muted-foreground">Joined {user.joinDate}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                            <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
                          </div>

                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Collection Trends</CardTitle>
                  <CardDescription>Monthly herb collection statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">January 2024</span>
                      <span className="font-bold">456 collections</span>
                    </div>
                    <Progress value={85} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">December 2023</span>
                      <span className="font-bold">398 collections</span>
                    </div>
                    <Progress value={74} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">November 2023</span>
                      <span className="font-bold">342 collections</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>Test results by grade classification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm">Grade A (Excellent)</span>
                      </div>
                      <span className="font-bold">68%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                        <span className="text-sm">Grade B (Good)</span>
                      </div>
                      <span className="font-bold">24%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Grade C (Fair)</span>
                      </div>
                      <span className="font-bold">6%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span className="text-sm">Grade F (Failed)</span>
                      </div>
                      <span className="font-bold">2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Herb collections by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">Rajasthan</span>
                    </div>
                    <span className="font-bold">892</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="text-sm">Kerala</span>
                    </div>
                    <span className="font-bold">654</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-chart-2" />
                      <span className="text-sm">Gujarat</span>
                    </div>
                    <span className="font-bold">543</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-chart-4" />
                      <span className="text-sm">Tamil Nadu</span>
                    </div>
                    <span className="font-bold">432</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-chart-5" />
                      <span className="text-sm">Karnataka</span>
                    </div>
                    <span className="font-bold">321</span>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Others</span>
                    </div>
                    <span className="font-bold">614</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform performance and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm">API Response Time</span>
                      </div>
                      <span className="font-bold text-primary">142ms</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm">Database Performance</span>
                      </div>
                      <span className="font-bold text-primary">Optimal</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm">Blockchain Sync</span>
                      </div>
                      <span className="font-bold text-primary">Active</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm">Storage Usage</span>
                      </div>
                      <span className="font-bold text-primary">68%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Backup</CardTitle>
                  <CardDescription>System backup and recovery status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="font-bold">2 hours ago</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup Size</span>
                      <span className="font-bold">2.4 GB</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Next Scheduled</span>
                      <span className="font-bold">In 22 hours</span>
                    </div>

                    <Button className="w-full bg-transparent" variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Create Manual Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Database backup completed successfully</p>
                      <p className="text-muted-foreground">2024-01-20 14:30:25</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <Users className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">New user registration: farmer@example.com</p>
                      <p className="text-muted-foreground">2024-01-20 13:45:12</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <Shield className="h-4 w-4 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Blockchain transaction verified: TX#4567</p>
                      <p className="text-muted-foreground">2024-01-20 12:22:08</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg text-sm">
                    <FlaskConical className="h-4 w-4 text-chart-2 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Quality test report generated: TS001</p>
                      <p className="text-muted-foreground">2024-01-20 11:15:33</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>Manage system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Settings</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="platform-name">Platform Name</Label>
                      <Input id="platform-name" value="Herb Abhilekh" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input id="admin-email" type="email" value="admin@herbabhilekh.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-endpoint">API Base URL</Label>
                    <Input id="api-endpoint" value="https://api.herbabhilekh.com" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Settings</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input id="session-timeout" type="number" value="60" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                      <Input id="max-login-attempts" type="number" value="5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Blockchain Configuration</h3>

                  <div className="space-y-2">
                    <Label htmlFor="blockchain-network">Network</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blockchain network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
