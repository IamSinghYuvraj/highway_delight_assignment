// components/notes/note-list.tsx
"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch notes")
    return res.json()
  })

async function deleteNote(id: string) {
  const res = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || "Failed to delete note")
  }
  return res.json()
}

export default function NoteList() {
  const { data, error, isLoading, mutate } = useSWR("/api/notes", fetcher)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">Loading notes...</CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-red-600">Failed to load notes. Please refresh.</CardContent>
      </Card>
    )
  }

  const notes: Array<{ _id: string; title: string; content: string }> = data?.notes || []

  if (!notes.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-600">
          No notes yet. Create your first note above!
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {notes.map((n) => (
        <Card key={n._id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">{n.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{n.content}</p>
              </div>
              <Button
                variant="destructive"
                onClick={async () => {
                  await deleteNote(n._id)
                  mutate()
                }}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
