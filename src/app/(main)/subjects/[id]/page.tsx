import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { SubjectDetailsClient } from "./subject-details-client"
import { auth } from "@/auth"

export const dynamic = "force-dynamic"

export default async function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return null

  const resolvedParams = await params
  const { id } = resolvedParams

  const subject = await prisma.subject.findUnique({
    where: { 
      id,
      userId: session.user.id
    },
    include: {
      materials: true,
      flashcards: true,
      questions: true
    }
  })

  if (!subject) {
    notFound()
  }

  return <SubjectDetailsClient initialSubjectData={subject} />
}
