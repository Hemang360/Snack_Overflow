"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginCollector } from "@/lib/api"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState("")
  const [collectorId, setCollectorId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // For now, wire only collector login which backend supports
      if (role === "farmer" || role === "collector") {
        const res = await loginCollector({ collectorId, password })
        if (!res.success) throw new Error(res.message || "Login failed")
        router.push("/farmer")
      } else if (role === "laboratory") {
        router.push("/laboratory")
      } else if (role === "admin") {
        router.push("/admin")
      } else if (role === "consumer") {
        router.push("/consumer")
      } else {
        router.push("/")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login error"
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <Leaf className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Herb Abhilekh</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Access your dashboard with your credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="consumer">Consumer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(role === "farmer" || role === "collector") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="collectorId">Collector ID</Label>
                        <Input id="collectorId" value={collectorId} onChange={(e) => setCollectorId(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="text-sm text-destructive" role="alert">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-role">Role</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="First name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Last name" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="Enter your email" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" placeholder="Create a password" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm your password" required />
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
