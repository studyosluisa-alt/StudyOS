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
      return NextResponse.json({ error: "Chave da API não encontrada na Vercel." }, { status: 500 })
    }

    const resolvedParams = await params
    const subjectId = resolvedParams.id
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"

    // FORÇAR VERSÃO V1 DA API
    const genAI = new GoogleGenerativeAI(apiKey)
    
    const prompt = `
      Analise este documento/imagem de prova e extraia todas as questões de múltipla escolha.
      Retorne APENAS um array JSON puro, contendo objetos com:
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

    // Tentar o modelo Flash na v1 (versão estável)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" })
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ])

    if (!result) {
      return NextResponse.json({ error: "Falha na resposta da IA" }, { status: 500 })
    }

    const text = result.response.text().trim()
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim()
    
    let questionsData
    try {
      questionsData = JSON.parse(cleanJson)
    } catch (e) {
      return NextResponse.json({ error: "Erro ao ler as questões geradas.", details: text }, { status: 500 })
    }

    const saved = await Promise.all(
      questionsData.map((q: any) => 
        prisma.question.create({
          data: {
            content: q.content || "Questão sem enunciado",
            optionA: q.optionA || "-",
            optionB: q.optionB || "-",
            optionC: q.optionC || "-",
            optionD: q.optionD || null,
            optionE: q.optionE || null,
            correctOption: q.correctOption || "A",
            explanation: q.explanation || null,
            subjectId: subjectId
          }
        })
      )
    )

    return NextResponse.json({ 
      message: `${saved.length} questões importadas com sucesso!`,
      count: saved.length 
    })

  } catch (error: any) {
    console.error("[IMPORT_QUESTIONS_FATAL]", error)
    return NextResponse.json({ 
      error: "Erro na conexão com a IA", 
      message: error.message 
    }, { status: 500 })
  }
}
