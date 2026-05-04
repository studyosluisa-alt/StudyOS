import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "")

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const resolvedParams = await params
    const subjectId = resolvedParams.id
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return new NextResponse("Nenhum arquivo enviado", { status: 400 })
    }

    // Converter arquivo para base64 para o Gemini
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
      Analise este documento/imagem de prova e extraia todas as questões de múltipla escolha.
      Para cada questão, identifique:
      - O enunciado completo.
      - As alternativas A, B, C, D e E (se houver).
      - A letra da alternativa correta (A-E), se estiver indicada na prova ou se você souber.
      - Uma breve explicação do porquê essa é a correta.

      Retorne APENAS um array JSON de objetos, seguindo EXATAMENTE esta estrutura, sem markdown e sem textos adicionais:
      [
        {
          "content": "string",
          "optionA": "string",
          "optionB": "string",
          "optionC": "string",
          "optionD": "string ou null",
          "optionE": "string ou null",
          "correctOption": "A, B, C, D ou E",
          "explanation": "string ou null"
        }
      ]
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      }
    ])

    const response = result.response
    const text = response.text().replace(/```json|```/g, "").trim()
    
    let questionsData
    try {
      questionsData = JSON.parse(text)
    } catch (e) {
      console.error("Erro ao parsear JSON da IA:", text)
      return new NextResponse("A IA não conseguiu estruturar os dados corretamente. Tente uma imagem mais clara.", { status: 500 })
    }

    // Salvar todas as questões no banco de dados vinculadas à matéria
    const savedQuestions = await Promise.all(
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

    return NextResponse.json({ 
      message: `${savedQuestions.length} questões importadas com sucesso!`,
      count: savedQuestions.length 
    })

  } catch (error) {
    console.error("[IMPORT_QUESTIONS_ERROR]", error)
    return new NextResponse("Erro interno ao processar a prova", { status: 500 })
  }
}
