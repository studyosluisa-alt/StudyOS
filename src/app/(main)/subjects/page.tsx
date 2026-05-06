import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { SubjectsClient } from "./subjects-client"

export const dynamic = "force-dynamic"

export default async function SubjectsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const subjects = await prisma.subject.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' }
  })

  return <SubjectsClient initialSubjects={subjects} />
}
