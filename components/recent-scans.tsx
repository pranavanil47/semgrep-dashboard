import { Badge } from "@/components/ui/badge"
import { GitBranch, Clock, CheckCircle, XCircle, Loader } from "lucide-react"
import type { ScanResult } from "@/app/page"

interface RecentScansProps {
  scanResults: ScanResult[]
}

export function RecentScans({ scanResults }: RecentScansProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {scanResults.slice(0, 5).map((scan) => (
        <div key={scan.id} className="flex items-center space-x-4">
          <div className="flex-shrink-0">{getStatusIcon(scan.status)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{scan.branch}</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">{scan.commit}</code>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">{new Date(scan.timestamp).toLocaleString()}</span>
              <Badge variant="outline" className="text-xs">
                {scan.totalVulnerabilities} issues
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
