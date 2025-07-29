import { type NextRequest, NextResponse } from "next/server"
import { Client } from "ssh2"

interface SSHConfig {
  host: string
  port: number
  username: string
  privateKey: string
  remotePath: string
}

export async function POST(request: NextRequest) {
  try {
    const { action, config, filename } = await request.json()

    if (!config || !config.host || !config.username || !config.privateKey) {
      return NextResponse.json({ error: "SSH configuration missing" }, { status: 400 })
    }

    if (action === "list") {
      const files = await listRemoteFiles(config)
      return NextResponse.json({ files })
    } else if (action === "download") {
      if (!filename) {
        return NextResponse.json({ error: "Filename is required" }, { status: 400 })
      }
      const csvContent = await downloadRemoteFile(config, filename)
      return NextResponse.json({ content: csvContent })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("SSH operation error:", error)
    return NextResponse.json({ error: "SSH operation failed" }, { status: 500 })
  }
}

async function listRemoteFiles(config: SSHConfig): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on("ready", () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end()
          reject(err)
          return
        }

        sftp.readdir(config.remotePath, (err, list) => {
          conn.end()

          if (err) {
            reject(err)
            return
          }

          // Filter for CSV files only
          const csvFiles = list
            .filter((item) => item.filename.endsWith(".csv"))
            .map((item) => item.filename)
            .sort()

          resolve(csvFiles)
        })
      })
    })

    conn.on("error", (err) => {
      reject(err)
    })

    conn.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey: config.privateKey,
    })
  })
}

async function downloadRemoteFile(config: SSHConfig, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on("ready", () => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end()
          reject(err)
          return
        }

        const remotePath = `${config.remotePath}/${filename}`
        const chunks: Buffer[] = []

        const stream = sftp.createReadStream(remotePath)

        stream.on("data", (chunk) => {
          chunks.push(chunk)
        })

        stream.on("end", () => {
          conn.end()
          const content = Buffer.concat(chunks).toString("utf8")
          resolve(content)
        })

        stream.on("error", (err) => {
          conn.end()
          reject(err)
        })
      })
    })

    conn.on("error", (err) => {
      reject(err)
    })

    conn.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      privateKey: config.privateKey,
    })
  })
}

async function mockListRemoteFiles(config: SSHConfig): Promise<string[]> {
  console.log(`Mock: Listing files in ${config.remotePath}`)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock CSV files based on the configuration
  const mockFiles = [
    "semgrep_findings_2024_01_15.csv",
    "semgrep_findings_2024_01_14.csv",
    "semgrep_findings_2024_01_13.csv",
    "security_scan_results.csv",
    "vulnerability_report.csv",
    "code_analysis_2024_01_12.csv",
    "sast_results_main_branch.csv",
    "dependency_scan_results.csv",
  ]

  return mockFiles.sort().reverse() // Most recent first
}

async function mockDownloadRemoteFile(config: SSHConfig, filename: string): Promise<string> {
  console.log(`Mock: Downloading ${filename} from ${config.remotePath}`)

  // Simulate download delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Generate mock CSV content based on filename
  const mockCSVContent = generateMockCSVContent(filename)

  return mockCSVContent
}

function generateMockCSVContent(filename: string): string {
  const headers = "severity,title,description,file,line,rule,branch,commit"

  const mockVulnerabilities = [
    {
      severity: "critical",
      title: "SQL Injection Vulnerability",
      description: "Potential SQL injection in user input handling",
      file: "src/auth/login.js",
      line: "45",
      rule: "security.detect-sql-injection",
      branch: "main",
      commit: "abc123f",
    },
    {
      severity: "high",
      title: "Cross-Site Scripting (XSS)",
      description: "Unescaped user input in template rendering",
      file: "src/components/UserProfile.jsx",
      line: "78",
      rule: "security.detect-xss",
      branch: "main",
      commit: "abc123f",
    },
    {
      severity: "high",
      title: "Path Traversal Vulnerability",
      description: "Unsafe file path construction allows directory traversal",
      file: "src/utils/fileHandler.js",
      line: "23",
      rule: "security.detect-path-traversal",
      branch: "feature/file-upload",
      commit: "def456g",
    },
    {
      severity: "medium",
      title: "Hardcoded Secret",
      description: "API key found in source code",
      file: "src/config/api.js",
      line: "12",
      rule: "security.detect-hardcoded-secrets",
      branch: "main",
      commit: "abc123f",
    },
    {
      severity: "medium",
      title: "Weak Cryptographic Hash",
      description: "Use of MD5 hash function detected",
      file: "src/utils/crypto.js",
      line: "67",
      rule: "security.detect-weak-crypto",
      branch: "main",
      commit: "ghi789h",
    },
    {
      severity: "medium",
      title: "Insecure Random Number Generation",
      description: "Math.random() used for security-sensitive operations",
      file: "src/auth/tokenGenerator.js",
      line: "34",
      rule: "security.detect-insecure-random",
      branch: "develop",
      commit: "jkl012i",
    },
    {
      severity: "low",
      title: "Missing Input Validation",
      description: "User input not properly validated",
      file: "src/api/userController.js",
      line: "89",
      rule: "security.detect-missing-validation",
      branch: "main",
      commit: "abc123f",
    },
    {
      severity: "low",
      title: "Information Disclosure",
      description: "Sensitive information in error messages",
      file: "src/middleware/errorHandler.js",
      line: "56",
      rule: "security.detect-info-disclosure",
      branch: "main",
      commit: "mno345j",
    },
    {
      severity: "critical",
      title: "Command Injection",
      description: "Unsafe execution of system commands",
      file: "src/utils/systemUtils.js",
      line: "91",
      rule: "security.detect-command-injection",
      branch: "feature/system-integration",
      commit: "pqr678k",
    },
    {
      severity: "high",
      title: "LDAP Injection",
      description: "Unsanitized input in LDAP query",
      file: "src/auth/ldapAuth.js",
      line: "42",
      rule: "security.detect-ldap-injection",
      branch: "main",
      commit: "stu901l",
    },
  ]

  // Add some variation based on filename
  let selectedVulns = mockVulnerabilities
  if (filename.includes("2024_01_15")) {
    selectedVulns = mockVulnerabilities.slice(0, 8)
  } else if (filename.includes("2024_01_14")) {
    selectedVulns = mockVulnerabilities.slice(2, 7)
  } else if (filename.includes("security_scan")) {
    selectedVulns = mockVulnerabilities.filter((v) => v.severity === "critical" || v.severity === "high")
  }

  const rows = selectedVulns.map(
    (vuln) =>
      `${vuln.severity},"${vuln.title}","${vuln.description}",${vuln.file},${vuln.line},${vuln.rule},${vuln.branch},${vuln.commit}`,
  )

  return [headers, ...rows].join("\n")
}
