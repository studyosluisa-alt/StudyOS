import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

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
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // ATUALIZADO PARA O MODELO GEMINI 2.5 FLASH! (O 1.5 FOI APOSENTADO)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `
      Analise este documento de prova e extraia todas as questões de múltipla escolha.
      Retorne APENAS um array JSON puro (sem markdown), contendo objetos com:
      {
        "content": "enunciado",
        "optionA": "texto A",
        "optionB": "texto B",
        "optionC": "texto C",
        "optionD": "texto D ou null",
        "optionE": "texto E ou null",
        "correctOption": "A, B, C, D ou E",
        "explanation": "explicação curta"
      }
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type || "image/jpeg"
        }
      }
    ])

    const text = result.response.text().trim()
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

    return NextResponse.json({ message: `${saved.length} questões importadas com sucesso!` })

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Erro na conexão com a IA", 
      message: error.message 
    }, { status: 500 })
  }
}
