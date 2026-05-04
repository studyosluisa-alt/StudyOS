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
      return NextResponse.json({ error: "Chave da API (GOOGLE_GEMINI_API_KEY) não encontrada no servidor. Verifique as variáveis de ambiente na Vercel." }, { status: 500 })
    }

    const resolvedParams = await params
    const subjectId = resolvedParams.id
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Preparar IA
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })

    // Converter arquivo para base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"

    const prompt = `
      Analise este documento/imagem de prova e extraia todas as questões de múltipla escolha.
      Retorne APENAS um array JSON puro, sem blocos de código markdown (sem \`\`\`json), contendo objetos com:
      - content: enunciado
      - optionA: texto da opção A
      - optionB: texto da opção B
      - optionC: texto da opção C
      - optionD: texto da opção D ou null
      - optionE: texto da opção E ou null
      - correctOption: A, B, C, D ou E
      - explanation: explicação curta
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ])

    const text = result.response.text().trim()
    
    // Tentar limpar possíveis markdown se a IA ainda assim enviar
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim()
    
    let questionsData
    try {
      questionsData = JSON.parse(cleanJson)
    } catch (e) {
      console.error("Erro no JSON da IA:", text)
      return NextResponse.json({ error: "A IA gerou um formato inválido. Tente novamente com uma imagem mais nítida.", details: text }, { status: 500 })
    }

    if (!Array.isArray(questionsData)) {
      return NextResponse.json({ error: "A IA não retornou uma lista de questões." }, { status: 500 })
    }

    // Salvar no banco
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
    console.error("[IMPORT_QUESTIONS_ERROR]", error)
    return NextResponse.json({ 
      error: "Erro interno no servidor de IA", 
      message: error.message 
    }, { status: 500 })
  }
}
