"use client"

import { useState, useEffect, useRef } from "react"
import { generateClient } from "aws-amplify/data"
import { uploadData } from "aws-amplify/storage"
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth"
import type { Schema } from "../../../../amplify/data/resource"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import PolicyCoverageCard from "@/components/dashboard/PolicyCoverageCard"
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const client = generateClient<Schema>()

type PolicyStatus = "uploading" | "parsing" | "ready" | "error"

export default function PoliciesPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [policies, setPolicies] = useState<Schema["UserPolicy"]["type"][]>([])
  const [selectedPolicy, setSelectedPolicy] = useState<Schema["UserPolicy"]["type"] | null>(null)
  const [pollingId, setPollingId] = useState<string | null>(null)

  useEffect(() => {
    loadPolicies()
  }, [])

  // Poll for status updates
  useEffect(() => {
    if (!pollingId) return
    const interval = setInterval(async () => {
      const res = await client.models.UserPolicy.get({ id: pollingId })
      if (res.data?.status === "ready" || res.data?.status === "error") {
        clearInterval(interval)
        setPollingId(null)
        loadPolicies()
        if (res.data.status === "ready") {
          toast({ title: "Policy parsed!", description: "Your coverage details are ready." })
        } else {
          toast({ title: "Parsing failed", description: "Could not parse the policy.", variant: "destructive" })
        }
      }
    }, 5000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingId])

  async function loadPolicies() {
    const res = await client.models.UserPolicy.list()
    setPolicies(res.data)
  }

  async function handleFileUpload(file: File) {
    if (!file || file.type !== "application/pdf") {
      toast({ title: "Please upload a PDF file", variant: "destructive" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB allowed", variant: "destructive" })
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      const user = await getCurrentUser()
      const session = await fetchAuthSession()
      const identityId = session.identityId
      if (!identityId) throw new Error("Could not get identity ID")
      const s3Key = `policies/${identityId}/${Date.now()}-${file.name}`

      // Create policy record
      const policyRes = await client.models.UserPolicy.create({
        userId: user.userId,
        fileName: file.name,
        s3Key,
        status: "uploading",
        insurer: ""
      })

      setUploadProgress(30)

      // Upload to S3
      await uploadData({
        path: s3Key,
        data: file,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              setUploadProgress(30 + Math.round((transferredBytes / totalBytes) * 40))
            }
          }
        }
      }).result

      setUploadProgress(70)

      // Update status to parsing
      if (policyRes.data) {
        await client.models.UserPolicy.update({ id: policyRes.data.id, status: "parsing" })

        // Trigger Lambda via API route
        fetch("/api/policy-parser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3Key, userId: user.userId, policyId: policyRes.data.id })
        }).catch(console.error)

        setPollingId(policyRes.data.id)
      }

      setUploadProgress(100)
      loadPolicies()
      toast({ title: "Upload complete!", description: "Parsing your policy with AI..." })
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  async function handleDeletePolicy(id: string) {
    await client.models.UserPolicy.delete({ id })
    setPolicies((prev) => prev.filter((p) => p.id !== id))
    if (selectedPolicy?.id === id) setSelectedPolicy(null)
    toast({ title: "Policy removed" })
  }

  function getStatusIcon(status: string) {
    if (status === "ready") return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (status === "error") return <AlertCircle className="w-4 h-4 text-red-500" />
    return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
  }

  function getStatusColor(status: string) {
    if (status === "ready") return "bg-green-100 text-green-700 border-green-200"
    if (status === "error") return "bg-red-100 text-red-700 border-red-200"
    return "bg-blue-100 text-blue-700 border-blue-200"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Policies</h1>
        <p className="text-gray-500 mt-1">Upload PDF policies to get AI-powered coverage analysis</p>
      </div>

      {/* Upload Zone */}
      <Card className="mb-8 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Upload Insurance Policy</CardTitle>
          <CardDescription>
            PDF format only · Max 10MB · Health, Life, Term, or Motor policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 font-medium mb-1">
              Drop your policy PDF here or click to browse
            </p>
            <p className="text-sm text-gray-400">Supports: Health, Life, Term, Motor, Travel policies</p>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  {uploadProgress < 70 ? "Uploading..." : uploadProgress < 100 ? "Processing..." : "Complete!"}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Policies List */}
      {policies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Policies ({policies.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {policies.map((policy) => (
              <Card
                key={policy.id}
                className={`cursor-pointer transition-all ${
                  selectedPolicy?.id === policy.id ? "ring-2 ring-blue-500" : "hover:shadow-md"
                }`}
                onClick={() =>
                  setSelectedPolicy(
                    selectedPolicy?.id === policy.id ? null : policy
                  )
                }
              >
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
                          {policy.fileName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {policy.insurer || "Parsing..."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePolicy(policy.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {getStatusIcon(policy.status || "")}
                    <Badge className={`${getStatusColor(policy.status || "")} text-xs`}>
                      {policy.status || "uploading"}
                    </Badge>
                    {policy.status === "parsing" && (
                      <span className="text-xs text-gray-400">AI parsing in progress...</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Expanded Policy View */}
          {selectedPolicy && selectedPolicy.parsedCoverage && selectedPolicy.status === "ready" && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedPolicy.fileName} — Coverage Analysis
              </h3>
              <PolicyCoverageCard
                data={JSON.parse(selectedPolicy.parsedCoverage)}
                fileName={selectedPolicy.fileName}
              />
            </div>
          )}

          {selectedPolicy && selectedPolicy.status === "parsing" && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Parsing policy with AI...</p>
                <p className="text-sm text-gray-400 mt-1">This may take up to 60 seconds</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {policies.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No policies uploaded yet. Upload your first policy PDF above.</p>
        </div>
      )}
    </div>
  )
}
