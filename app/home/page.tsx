// app/home/page.tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import NoteForm from "@/components/notes/note-form"
import NoteList from "@/components/notes/note-list"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")
  const email = session.user.email || "User"

  return (
    <main className="min-h-dvh bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Highway Delight</h1>
            <p className="text-sm text-gray-600">Welcome, {email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="grid gap-6">
          <NoteForm />
          <NoteList />
        </div>
      </section>
    </main>
  )
}
