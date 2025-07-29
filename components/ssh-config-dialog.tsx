"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, TestTube } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SSHConfig {
  host: string
  port: number
  username: string
  privateKey: string
  remotePath: string
}

interface SSHConfigDialogProps {
  onConfigUpdate: (config: SSHConfig) => void
  initialConfig?: SSHConfig
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

export function SSHConfigDialog({ onConfigUpdate, initialConfig }: SSHConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<SSHConfig>(initialConfig || DEFAULT_CONFIG)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  const testConnection = async () => {
    setTesting(true)
    try {
      const response = await fetch("/api/ssh-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "SSH connection test passed successfully.",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to SSH server.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection.",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    if (!config.host || !config.username || !config.privateKey) {
      toast({
        title: "Missing Configuration",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    onConfigUpdate(config)
    setOpen(false)
    toast({
      title: "Configuration Updated",
      description: "SSH configuration has been updated successfully.",
    })
  }

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG)
    toast({
      title: "Reset to Default",
      description: "Configuration has been reset to default values.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          SSH Config
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>SSH Configuration</DialogTitle>
          <DialogDescription>Configure your SSH connection settings to access remote CSV files.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right">
              Host *
            </Label>
            <Input
              id="host"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="104.197.251.175"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="port" className="text-right">
              Port
            </Label>
            <Input
              id="port"
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: Number.parseInt(e.target.value) || 22 })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username *
            </Label>
            <Input
              id="username"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="pranavanil123"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="remotePath" className="text-right">
              Remote Path
            </Label>
            <Input
              id="remotePath"
              value={config.remotePath}
              onChange={(e) => setConfig({ ...config, remotePath: e.target.value })}
              placeholder="/home/pranavanil123/semgrep_findings"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="privateKey" className="text-right">
              Private Key *
            </Label>
            <Textarea
              id="privateKey"
              value={config.privateKey}
              onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
              className="col-span-3 min-h-[100px] font-mono text-xs"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={testConnection} disabled={testing}>
              {testing ? (
                <>
                  <TestTube className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={resetToDefault}>
              Reset to Default
            </Button>
          </div>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
