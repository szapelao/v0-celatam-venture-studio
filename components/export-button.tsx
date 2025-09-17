"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function ExportButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const exportData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Fetch all data for export
      const [{ data: profiles }, { data: opportunities }, { data: matches }, { data: feedback }, { data: projects }] =
        await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("opportunities").select("*"),
          supabase.from("matches").select("*"),
          supabase.from("feedback").select("*"),
          supabase.from("projects").select("*"),
        ])

      // Create CSV content
      const createCSV = (data: any[], filename: string) => {
        if (!data.length) return ""

        const headers = Object.keys(data[0]).join(",")
        const rows = data
          .map((row) =>
            Object.values(row)
              .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
              .join(","),
          )
          .join("\n")

        return `${headers}\n${rows}`
      }

      // Create and download files
      const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }

      // Export each dataset
      if (profiles?.length) downloadCSV(createCSV(profiles, "profiles"), "profiles")
      if (opportunities?.length) downloadCSV(createCSV(opportunities, "opportunities"), "opportunities")
      if (matches?.length) downloadCSV(createCSV(matches, "matches"), "matches")
      if (feedback?.length) downloadCSV(createCSV(feedback, "feedback"), "feedback")
      if (projects?.length) downloadCSV(createCSV(projects, "projects"), "projects")

      toast({
        title: "Export Complete",
        description: "Data has been exported to CSV files",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={exportData} disabled={loading} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      {loading ? "Exporting..." : "Export Data"}
    </Button>
  )
}
