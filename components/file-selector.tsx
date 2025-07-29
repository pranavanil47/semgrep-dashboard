"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Wifi,
  TestTube,
  AlertCircle,
  Info,
  WifiOff,
} from "lucide-react"
import { parseCSV, validateVulnerability } from "@/lib/csv-parser"
import { SSHConfigDialog } from "./ssh-config-dialog"
import type { Vulnerability } from "@/app/page"

interface SSHConfig {
  host: string
  port: number
  username: string
  privateKey: string
  remotePath: string
}

interface FileSelectorProps {
  onDataLoaded: (vulnerabilities: Vulnerability[]) => void
}

const DEFAULT_CONFIG: SSHConfig = {
  host: "104.197.251.175",
  port: 22,
  username: "pranavanil123",
  privateKey: `-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----`,
  remotePath: "/home/pranavanil123/semgrep_findings",
}

export function FileSelector({ onDataLoaded }: FileSelectorProps) {
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string>("")
  const [sshConfig, setSSHConfig] = useState<SSHConfig>(DEFAULT_CONFIG)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle")
  const [connectionMessage, setConnectionMessage] = useState<string>("")
  const [autoConnected, setAutoConnected] = useState(false)

  // Auto-connect on component mount
  useEffect(() => {
    if (!autoConnected) {
      testSSHConnection()
      setAutoConnected(true)
    }
  }, [autoConnected])

  const fetchFiles = async () => {
    if (!sshConfig) {
      setError("Please configure SSH settings first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ssh-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "list", config: sshConfig }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        console.error("Failed to parse JSON response:", text)
        throw new Error("Server returned invalid response format")
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      setFiles(data.files || [])
    } catch (err) {
      console.error("Fetch files error:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch files")
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async () => {
    if (!selectedFile || !sshConfig) return

    setDownloading(true)
    setError("")

    try {
      const response = await fetch("/api/ssh-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "download",
          filename: selectedFile,
          config: sshConfig,
        }),
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        const text = await response.text()
        console.error("Failed to parse JSON response:", text)
        throw new Error("Server returned invalid response format")
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      // Parse CSV content
      const csvData = parseCSV(data.content)
      const validVulnerabilities = csvData.filter(validateVulnerability)

      // Convert to dashboard format
      const vulnerabilities: Vulnerability[] = validVulnerabilities.map((vuln, index) => ({
        id: `vuln-${Date.now()}-${index}`,
        severity: vuln.severity.toLowerCase() as "critical" | "high" | "medium" | "low",
        title: vuln.title,
        description: vuln.description,
        file: vuln.file,
        line: Number.parseInt(vuln.line) || 0,
        rule: vuln.rule,
        timestamp: new Date().toISOString(),
        branch: vuln.branch || "main",
        commit: vuln.commit || "unknown",
      }))

      onDataLoaded(vulnerabilities)
    } catch (err) {
      console.error("Download file error:", err)
      setError(err instanceof Error ? err.message : "Failed to download file")
    } finally {
      setDownloading(false)
    }
  }

  const handleConfigUpdate = (config: SSHConfig) => {
    setSSHConfig(config)
    setFiles([])
    setSelectedFile("")
    setError("")
    setConnectionStatus("idle")
    setConnectionMessage("")
  }

  const testSSHConnection = async () => {
    if (!sshConfig) {
      setError("Please configure SSH settings first")
      return
    }

    setConnectionStatus("testing")
    setConnectionMessage("Connecting to server...")
    setError("")

    try {
      console.log("Testing SSH connection to:", sshConfig.host)

      const response = await fetch("/api/ssh-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sshConfig),
      })

      console.log("Response status:", response.status)

      let result
      try {
        const responseText = await response.text()
        console.log("Raw response:", responseText.substring(0, 500))

        if (!responseText.trim()) {
          throw new Error("Empty response from server")
        }

        result = JSON.parse(responseText)
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError)
        setConnectionStatus("failed")
        setConnectionMessage("Server returned invalid response")
        setError("Server configuration error - check server logs")
        return
      }

      console.log("Parsed result:", result)

      if (response.ok && result.success) {
        setConnectionStatus("success")
        setConnectionMessage(result.message || "SSH connection successful!")
        // Auto-fetch files after successful connection
        setTimeout(() => {
          fetchFiles()
        }, 500)
      } else {
        setConnectionStatus("failed")
        const errorMsg = result.error || `Server error: ${response.status}`
        setConnectionMessage(errorMsg)
        setError(errorMsg)

        // Log additional details for debugging
        if (result.details) {
          console.error("Connection error details:", result.details)
        }
      }
    } catch (err) {
      console.error("Connection test error:", err)
      setConnectionStatus("failed")
      setConnectionMessage("Network error occurred")
      setError(err instanceof Error ? err.message : "Failed to test connection")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Remote CSV File Selector
        </CardTitle>
        <CardDescription>
          Connected to your server at {sshConfig.host} - Select a CSV file to load vulnerability data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Production Ready:</strong> Using your permanent SSH configuration for{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {sshConfig.username}@{sshConfig.host}
            </code>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SSHConfigDialog onConfigUpdate={handleConfigUpdate} initialConfig={sshConfig} />
            <Badge variant="secondary" className="flex items-center gap-1">
              {connectionStatus === "success" ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              {sshConfig.username}@{sshConfig.host}:{sshConfig.port}
            </Badge>
            {connectionStatus === "success" && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Connected
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={testSSHConnection}
              disabled={connectionStatus === "testing"}
              className="w-full bg-transparent"
            >
              {connectionStatus === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test SSH Connection
                </>
              )}
            </Button>

            {connectionStatus !== "idle" && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                  connectionStatus === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : connectionStatus === "failed"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {connectionStatus === "success" && <CheckCircle className="h-4 w-4" />}
                {connectionStatus === "failed" && <XCircle className="h-4 w-4" />}
                {connectionStatus === "testing" && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>{connectionMessage}</span>
              </div>
            )}
          </div>
        </div>

        {connectionStatus === "success" && (
          <>
            <div className="flex items-center gap-2">
              <Select value={selectedFile} onValueChange={setSelectedFile} disabled={loading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a CSV file..." />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchFiles} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {files.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{files.length} CSV files found</Badge>
                <Badge variant="outline" className="text-xs">
                  Path: {sshConfig.remotePath}
                </Badge>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {connectionStatus === "success" && (
          <Button onClick={downloadFile} disabled={!selectedFile || downloading} className="w-full">
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading {selectedFile}...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Load Selected File
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
