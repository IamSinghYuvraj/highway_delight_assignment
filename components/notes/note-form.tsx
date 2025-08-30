// components/notes/note-form.tsx
"use client"

import type React from "react"
import { useSWRConfig } from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

async function createNote(data: { title: string; content: string }) {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || "Failed to create note")
  }
  return res.json()
}

export default function NoteForm() {
  const { mutate } = useSWRConfig()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }
    setLoading(true)
    try {
      await createNote({ title, content })
      setTitle("")
      setContent("")
      mutate("/api/notes")
    } catch (err: any) {
      setError(err.message || "Failed to create note")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              className="min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Write your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Saving..." : "Add Note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
