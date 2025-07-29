import { type NextRequest, NextResponse } from "next/server"

interface SSHConfig {
  host: string
  port: number
  username: string
  privateKey: string
  remotePath: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("SSH test endpoint called")

    let config: SSHConfig
    try {
      config = await request.json()
    } catch (error) {
      console.error("Failed to parse request JSON:", error)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("Received config:", {
      host: config.host,
      port: config.port,
      username: config.username,
      remotePath: config.remotePath,
      hasPrivateKey: !!config.privateKey,
    })

    if (!config.host || !config.username || !config.privateKey) {
      return NextResponse.json(
        {
          error: "Missing required SSH configuration",
          details: {
            hasHost: !!config.host,
            hasUsername: !!config.username,
            hasPrivateKey: !!config.privateKey,
          },
        },
        { status: 400 },
      )
    }

    // Mock SSH connection test
    const testResult = await mockSSHConnection(config)
    console.log("Test result:", testResult)

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: testResult.message,
        details: testResult.details,
      })
    } else {
      return NextResponse.json(
        {
          error: testResult.error,
          details: testResult.details,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("SSH test error:", error)
    return NextResponse.json(
      {
        error: "Connection test failed",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}

interface TestResult {
  success: boolean
  message?: string
  error?: string
  details?: any
}

async function mockSSHConnection(config: SSHConfig): Promise<TestResult> {
  console.log("Starting mock SSH connection test...")

  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Basic validation
  if (!config.privateKey.includes("BEGIN") || !config.privateKey.includes("END")) {
    return {
      success: false,
      error: "Invalid private key format - must be in OpenSSH or PEM format",
      details: {
        keyLength: config.privateKey.length,
        hasBegin: config.privateKey.includes("BEGIN"),
        hasEnd: config.privateKey.includes("END"),
      },
    }
  }

  // Mock different scenarios based on host
  if (config.host.includes("invalid") || config.host === "bad-host") {
    return {
      success: false,
      error: "Host not found - check the hostname/IP address",
      details: {
        originalError: "ENOTFOUND",
        duration: 1500,
      },
    }
  }

  if (config.username === "invalid-user") {
    return {
      success: false,
      error: "Authentication failed - check username and private key",
      details: {
        originalError: "Authentication failure",
        duration: 1500,
      },
    }
  }

  // Mock successful connection
  const mockFiles = [
    "semgrep_findings_2024_01_15.csv",
    "semgrep_findings_2024_01_14.csv",
    "semgrep_findings_2024_01_13.csv",
    "security_scan_results.csv",
    "vulnerability_report.csv",
  ]

  return {
    success: true,
    message: `Connected successfully! Found ${mockFiles.length} CSV files in ${config.remotePath}`,
    details: {
      duration: 1500,
      totalFiles: mockFiles.length + 3, // Include some non-CSV files
      csvFiles: mockFiles.length,
      remotePath: config.remotePath,
      sampleFiles: mockFiles.slice(0, 3),
    },
  }
}
