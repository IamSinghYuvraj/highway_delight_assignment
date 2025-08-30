import { redirect } from "next/navigation"
import { getUserFromRequest } from "@/lib/auth"

export default async function HomePage() {
  const user = await getUserFromRequest()
  if (user) redirect("/dashboard")
  redirect("/login")
}
