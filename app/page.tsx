"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, GitBranch, Search, Upload } from "lucide-react"
import { VulnerabilityTable } from "@/components/vulnerability-table"
import { MetricsCards } from "@/components/metrics-cards"
import { VulnerabilityChart } from "@/components/vulnerability-chart"
import { RecentScans } from "@/components/recent-scans"
import { FileSelector } from "@/components/file-selector"

export interface Vulnerability {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  file: string
  line: number
  rule: string
  timestamp: string
  branch: string
  commit: string
}

export interface ScanResult {
  id: string
  timestamp: string
  branch: string
  commit: string
  totalVulnerabilities: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  status: "completed" | "running" | "failed"
  vulnerabilities: Vulnerability[]
}

export default function Dashboard() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [isConnected, setIsConnected] = useState(false)
  const [showFileSelector, setShowFileSelector] = useState(false)

  // Simulate real-time data connection
  useEffect(() => {
    const connectToServer = () => {
      setIsConnected(true)

      // Simulate receiving initial data
      const mockData: ScanResult[] = [
        {
          id: "scan-1",
          timestamp: new Date().toISOString(),
          branch: "main",
          commit: "abc123f",
          totalVulnerabilities: 12,
          criticalCount: 2,
          highCount: 4,
          mediumCount: 5,
          lowCount: 1,
          status: "completed",
          vulnerabilities: [
            {
              id: "vuln-1",
              severity: "critical",
              title: "SQL Injection Vulnerability",
              description: "Potential SQL injection in user input handling",
              file: "src/auth/login.js",
              line: 45,
              rule: "security/detect-sql-injection",
              timestamp: new Date().toISOString(),
              branch: "main",
              commit: "abc123f",
            },
            {
              id: "vuln-2",
              severity: "high",
              title: "Cross-Site Scripting (XSS)",
              description: "Unescaped user input in template rendering",
              file: "src/components/UserProfile.jsx",
              line: 78,
              rule: "security/detect-xss",
              timestamp: new Date().toISOString(),
              branch: "main",
              commit: "abc123f",
            },
            {
              id: "vuln-3",
              severity: "medium",
              title: "Hardcoded Secret",
              description: "API key found in source code",
              file: "src/config/api.js",
              line: 12,
              rule: "security/detect-hardcoded-secrets",
              timestamp: new Date().toISOString(),
              branch: "main",
              commit: "abc123f",
            },
          ],
        },
      ]

      setScanResults(mockData)
    }

    connectToServer()

    const interval = setInterval(() => {
      console.log("Listening for new scan results...")
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleDataLoaded = (vulnerabilities: Vulnerability[]) => {
    const newScanResult: ScanResult = {
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      branch: "main",
      commit: "remote-csv",
      totalVulnerabilities: vulnerabilities.length,
      criticalCount: vulnerabilities.filter((v) => v.severity === "critical").length,
      highCount: vulnerabilities.filter((v) => v.severity === "high").length,
      mediumCount: vulnerabilities.filter((v) => v.severity === "medium").length,
      lowCount: vulnerabilities.filter((v) => v.severity === "low").length,
      status: "completed",
      vulnerabilities,
    }

    setScanResults((prev) => [newScanResult, ...prev])
    setShowFileSelector(false)
  }

  const allVulnerabilities = scanResults.flatMap((scan) => scan.vulnerabilities)

  const filteredVulnerabilities = allVulnerabilities.filter((vuln) => {
    const matchesSearch =
      vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.file.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || vuln.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const totalVulnerabilities = allVulnerabilities.length
  const criticalCount = allVulnerabilities.filter((v) => v.severity === "critical").length
  const highCount = allVulnerabilities.filter((v) => v.severity === "high").length
  const mediumCount = allVulnerabilities.filter((v) => v.severity === "medium").length
  const lowCount = allVulnerabilities.filter((v) => v.severity === "low").length

  if (showFileSelector) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Load CSV Data</h1>
            <p className="text-muted-foreground">
              Select a CSV file from your remote server to import vulnerability data
            </p>
          </div>

          <FileSelector onDataLoaded={handleDataLoaded} />

          <div className="text-center">
            <Button variant="outline" onClick={() => setShowFileSelector(false)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Shield className="h-6 w-6" />
            <h1 className="text-xl font-semibold">SAST Dashboard</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => setShowFileSelector(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Load CSV
            </Button>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-muted-foreground">{isConnected ? "Dashboard Ready" : "Disconnected"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Security Overview</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <GitBranch className="mr-2 h-4 w-4" />
              main
            </Button>
          </div>
        </div>

        <MetricsCards
          totalVulnerabilities={totalVulnerabilities}
          criticalCount={criticalCount}
          highCount={highCount}
          mediumCount={mediumCount}
          lowCount={lowCount}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vulnerability Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <VulnerabilityChart scanResults={scanResults} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Scans</CardTitle>
              <CardDescription>Latest security scans from push requests</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentScans scanResults={scanResults} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilities</CardTitle>
            <CardDescription>Detailed view of all security findings</CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vulnerabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <VulnerabilityTable vulnerabilities={filteredVulnerabilities} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
