import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Chave não configurada na Vercel." }, { status: 500 })
    }

    const resolvedParams = await params
    const subjectId = resolvedParams.id
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    const bytes = await file.arrayBuffer()
    const base64Data = Buffer.from(bytes).toString("base64")

    // Chamada direta via Fetch (ignora bugs da biblioteca)
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analise esta prova e extraia as questões de múltipla escolha. Retorne APENAS um array JSON: [{content, optionA, optionB, optionC, optionD, optionE, correctOption, explanation}]" },
            { inlineData: { mimeType: file.type || "image/jpeg", data: base64Data } }
          ]
        }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ 
        error: "Erro na API da Google", 
        message: data.error?.message || "Erro desconhecido" 
      }, { status: response.status })
    }

    const text = data.candidates[0].content.parts[0].text.trim()
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim()
    
    const questionsData = JSON.parse(cleanJson)

    const saved = await Promise.all(
      questionsData.map((q: any) => 
        prisma.question.create({
          data: {
            content: q.content,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD || null,
            optionE: q.optionE || null,
            correctOption: q.correctOption || "A",
            explanation: q.explanation || null,
            subjectId: subjectId
          }
        })
      )
    )

    return NextResponse.json({ message: `${saved.length} questões importadas!` })

  } catch (error: any) {
    console.error("[IMPORT_QUESTIONS_FATAL]", error)
    return NextResponse.json({ 
      error: "Erro no processamento", 
      message: error.message 
    }, { status: 500 })
  }
}
