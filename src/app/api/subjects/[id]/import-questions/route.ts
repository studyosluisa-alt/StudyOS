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
    let examName = formData.get("examName") as string | null

    if (!examName && file) {
      const dotIndex = file.name.lastIndexOf(".")
      const rawName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name
      examName = rawName.replace(/[_-]/g, " ").trim()
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // LISTA DE MODELOS VÁLIDOS EM 2026 (Com fallback se um estiver lotado - Erro 503)
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
    
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

    let result = null
    let lastError = ""

    // Tentar cada modelo da lista
    for (const modelName of modelsToTry) {
      try {
        console.log(`Tentando modelo: ${modelName}...`)
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          }
        ])
        
        if (result) {
          console.log(`Sucesso com o modelo: ${modelName}`)
          break // Se deu certo, sai do loop
        }
      } catch (err: any) {
        console.error(`Falha no modelo ${modelName}:`, err.message)
        lastError = err.message
        // Se for erro de demanda (503), o loop continua e tenta o próximo!
      }
    }

    if (!result) {
      return NextResponse.json({ 
        error: "Todos os modelos estão ocupados no momento. Tente novamente em alguns segundos.", 
        message: lastError 
      }, { status: 503 })
    }

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
            subjectId: subjectId,
            examName: examName || null
          }
        })
      )
    )

    return NextResponse.json({ message: `${saved.length} questões importadas com sucesso!` })

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Erro no processamento dos dados", 
      message: error.message 
    }, { status: 500 })
  }
}
