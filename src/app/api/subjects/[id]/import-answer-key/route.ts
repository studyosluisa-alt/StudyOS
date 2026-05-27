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
    const file = formData.get("file") as File | null
    const examName = formData.get("examName") as string | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo do gabarito é obrigatório." }, { status: 400 })
    }

    if (!examName) {
      return NextResponse.json({ error: "Selecione a prova alvo." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const mimeType = file.type || "application/pdf"

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]

    const prompt = `Analise este gabarito oficial e extraia APENAS as respostas das questões de múltipla escolha em formato JSON. Retorne somente um array JSON válido, sem markdown, sem texto adicional. Exemplo de saída:
[
  { "question": 1, "answer": "D" },
  { "question": 2, "answer": "A" },
  ...
]
As respostas devem ser uma letra entre A, B, C, D ou E.`

    let result = null
    let lastError = ""

    for (const modelName of modelsToTry) {
      try {
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
          break
        }
      } catch (err: any) {
        lastError = err.message
      }
    }

    if (!result) {
      return NextResponse.json({
        error: "Não foi possível processar o gabarito no momento.",
        message: lastError
      }, { status: 503 })
    }

    const text = result.response.text().trim()
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim()

    let answerKey: Array<{ question: number; answer: string }> = []
    try {
      answerKey = JSON.parse(cleanJson)
    } catch {
      // fallback para saída que não seja JSON puro
      const regex = /(?<question>\d+)\D*(?<answer>[A-E])/gi
      const fallback: Array<{ question: number; answer: string }> = []
      let match
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(cleanJson))) {
        const question = Number(match.groups?.question)
        const answer = String(match.groups?.answer || "").toUpperCase().trim()
        if (question && /^[A-E]$/.test(answer)) {
          fallback.push({ question, answer })
        }
      }
      answerKey = fallback
    }

    if (!Array.isArray(answerKey) || answerKey.length === 0) {
      return NextResponse.json({ error: "Gabarito extraído está vazio ou inválido." }, { status: 400 })
    }

    const validAnswers = answerKey
      .map((item) => ({ question: Number(item.question), answer: String(item.answer || "").toUpperCase().trim() }))
      .filter((item) => Number.isInteger(item.question) && item.question > 0 && /^[A-E]$/.test(item.answer))

    if (validAnswers.length === 0) {
      return NextResponse.json({ error: "O gabarito extraído não contém respostas válidas." }, { status: 400 })
    }

    const questions = await prisma.question.findMany({
      where: {
        subjectId,
        examName
      },
      orderBy: { createdAt: "asc" }
    })

    if (questions.length === 0) {
      return NextResponse.json({ message: "Nenhuma questão encontrada para essa prova.", updatedCount: 0 })
    }

    const updates = await Promise.all(
      validAnswers.map(async (item) => {
        const questionIndex = item.question - 1
        if (questionIndex < 0 || questionIndex >= questions.length) {
          return null
        }
        return prisma.question.update({
          where: { id: questions[questionIndex].id },
          data: { correctOption: item.answer }
        })
      })
    )

    return NextResponse.json({ message: `${updates.length} questões atualizadas com o gabarito.`, updatedCount: updates.length })
  } catch (error: any) {
    return NextResponse.json({
      error: "Erro ao processar o gabarito.",
      message: error.message
    }, { status: 500 })
  }
}
