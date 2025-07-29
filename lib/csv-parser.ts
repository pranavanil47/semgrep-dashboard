export interface CSVVulnerability {
  severity: string
  title: string
  description: string
  file: string
  line: string
  rule: string
  branch: string
  commit: string
}

export function parseCSV(csvContent: string): CSVVulnerability[] {
  const lines = csvContent.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  const vulnerabilities: CSVVulnerability[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const vulnerability: any = {}

    headers.forEach((header, index) => {
      vulnerability[header] = values[index] || ""
    })

    vulnerabilities.push(vulnerability as CSVVulnerability)
  }

  return vulnerabilities
}

export function validateVulnerability(vuln: CSVVulnerability): boolean {
  return !!(vuln.title && vuln.file && vuln.severity)
}
