"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Plus, 
  ExternalLink,
  BrainCircuit,
  Eye,
  EyeOff,
  Upload,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Question {
  id: string
  content: string
  optionA: string
  optionB: string
  optionC: string
  optionD?: string
  optionE?: string
  correctOption: string
  explanation?: string
}

interface Material {
  id: string
  title: string
  url: string
  type: string
}

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface Subject {
  id: string
  name: string
  color: string
}

export default function SubjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const subjectId = resolvedParams.id
  const router = useRouter()

  const [subject, setSubject] = useState<Subject | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isMaterialOpen, setIsMaterialOpen] = useState(false)
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false)
  const [isQuestionOpen, setIsQuestionOpen] = useState(false)

  // Forms state
  const [matTitle, setMatTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  // Flashcards state
  const [cardQ, setCardQ] = useState("")
  const [cardA, setCardA] = useState("")
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})

  // Questions state
  const [questContent, setQuestContent] = useState("")
  const [optA, setOptA] = useState("")
  const [optB, setOptB] = useState("")
  const [optC, setOptC] = useState("")
  const [optD, setOptD] = useState("")
  const [optE, setOptE] = useState("")
  const [correctOpt, setCorrectOpt] = useState("A")
  const [questExpl, setQuestExpl] = useState("")
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})

  // Refresh data function to keep UI in sync
  const refreshData = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}`)
      const data = await res.json()
      setSubject({ id: data.id, name: data.name, color: data.color })
      setMaterials(data.materials || [])
      setFlashcards(data.flashcards || [])
      setQuestions(data.questions || [])
      setLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    refreshData()
  }, [subjectId])

  const handleAddMaterial = async () => {
    if (!selectedFile) return toast.error("Selecione um arquivo")
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      const uploadData = await uploadRes.json()
      
      if (!uploadRes.ok) throw new Error(uploadData.error)
      
      const finalTitle = matTitle || uploadData.name
      
      const res = await fetch(`/api/subjects/${subjectId}/materials`, {
        method: "POST",
        body: JSON.stringify({ 
          title: finalTitle, 
          url: uploadData.url, 
          type: "UPLOAD" 
        }),
        headers: { "Content-Type": "application/json" }
      })
      
      if (res.ok) {
        toast.success("Material enviado!")
        setIsMaterialOpen(false)
        setMatTitle("")
        setSelectedFile(null)
        refreshData()
      }
    } catch (e: any) {
      toast.error("Erro: " + e.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!questContent || !optA || !optB || !optC) {
      return toast.error("Preencha a pergunta e ao menos 3 opções")
    }

    try {
      const res = await fetch(`/api/subjects/${subjectId}/questions`, {
        method: "POST",
        body: JSON.stringify({
          content: questContent,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD || null,
          optionE: optE || null,
          correctOption: correctOpt,
          explanation: questExpl || null
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (res.ok) {
        toast.success("Questão adicionada!")
        setIsQuestionOpen(false)
        setQuestContent("")
        setOptA("")
        setOptB("")
        setOptC("")
        setOptD("")
        setOptE("")
        setCorrectOpt("A")
        setQuestExpl("")
        refreshData()
      } else {
        const errorText = await res.text()
        console.error("Erro ao salvar questão:", errorText)
        toast.error(`Erro: ${errorText}`)
      }
    } catch (e: any) {
      console.error("Erro na requisição:", e)
      toast.error("Erro ao salvar questão: " + e.message)
    }
  }

  const handleAddFlashcard = async () => {
    if (!cardQ || !cardA) return toast.error("Preencha pergunta e resposta")
    
    try {
      const res = await fetch(`/api/subjects/${subjectId}/flashcards`, {
        method: "POST",
        body: JSON.stringify({ question: cardQ, answer: cardA }),
        headers: { "Content-Type": "application/json" }
      })
      if (res.ok) {
        toast.success("Flashcard salvo!")
        setIsFlashcardOpen(false)
        setCardQ("")
        setCardA("")
        refreshData()
      }
    } catch (e) {
      toast.error("Erro ao salvar")
    }
  }

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) return <div className="p-8">Carregando...</div>
  if (!subject) return <div className="p-8">Matéria não encontrada.</div>

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/subjects")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{subject.name}</h2>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="inline-flex w-full md:w-auto h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar gap-1">
          <TabsTrigger 
            value="materials" 
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Materiais
          </TabsTrigger>
          <TabsTrigger 
            value="flashcards" 
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Flashcards
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Questões (Tarefas)
          </TabsTrigger>
        </TabsList>
        
        {/* Materiais Tab */}
        <TabsContent value="materials" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Materiais de Estudo</h3>
            <Dialog open={isMaterialOpen} onOpenChange={setIsMaterialOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-sky-600 text-primary-foreground shadow hover:bg-sky-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fazer Upload de Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecionar Arquivo</label>
                    <Input 
                      type="file" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSelectedFile(e.target.files[0])
                          if (!matTitle) setMatTitle(e.target.files[0].name)
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome (Opcional)</label>
                    <Input 
                      placeholder="Ex: Resumo de Anatomia" 
                      value={matTitle} 
                      onChange={e => setMatTitle(e.target.value)} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMaterialOpen(false)} disabled={isUploading}>Cancelar</Button>
                  <Button onClick={handleAddMaterial} disabled={isUploading}>
                    {isUploading ? "Enviando..." : "Enviar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map(mat => (
              <Card key={mat.id} className="hover:shadow-md transition border-emerald-500/10">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-emerald-500" />
                      <CardTitle className="text-base">{mat.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button variant="secondary" className="w-full" onClick={() => window.open(mat.url, "_blank")}>
                    Abrir Material <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg border-dashed">
                Nenhum material importado para esta matéria ainda.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Flashcards de Revisão</h3>
            <Dialog open={isFlashcardOpen} onOpenChange={setIsFlashcardOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-indigo-600 text-primary-foreground shadow hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Flashcard
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Flashcard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pergunta</label>
                    <Input placeholder="Qual é o conceito de..." value={cardQ} onChange={e => setCardQ(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resposta (Oculta)</label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={cardA} 
                      onChange={e => setCardA(e.target.value)} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFlashcardOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddFlashcard}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {flashcards.map(card => {
              const isFlipped = flippedCards[card.id]
              return (
                <Card key={card.id} className="relative overflow-hidden transition-all duration-300 hover:shadow-md border-indigo-500/20">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <BrainCircuit className="w-16 h-16" />
                  </div>
                  <CardHeader className="p-4 pb-2 relative z-10">
                    <CardTitle className="text-base font-medium leading-relaxed">
                      {card.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 relative z-10">
                    {isFlipped ? (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-md text-sm border border-indigo-100 dark:border-indigo-900 mb-4 animate-in fade-in duration-300">
                        {card.answer}
                      </div>
                    ) : (
                      <div className="h-4 mb-4" /> // Spacer to prevent jumping
                    )}
                    
                    <Button 
                      variant={isFlipped ? "outline" : "secondary"} 
                      className="w-full"
                      onClick={() => toggleFlip(card.id)}
                    >
                      {isFlipped ? (
                        <><EyeOff className="h-4 w-4 mr-2" /> Ocultar Resposta</>
                      ) : (
                        <><Eye className="h-4 w-4 mr-2" /> Revelar Resposta</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
            {flashcards.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg border-dashed">
                Nenhum flashcard criado. Teste seus conhecimentos criando perguntas e respostas!
              </div>
            )}
          </div>
        </TabsContent>

        {/* Questões Tab */}
        <TabsContent value="questions" className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Banco de Questões</h3>
            <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-orange-600 text-primary-foreground shadow hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Questão
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Questão ao Banco</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enunciado da Questão</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Escreva o enunciado aqui..."
                      value={questContent}
                      onChange={e => setQuestContent(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opção A</label>
                      <Input value={optA} onChange={e => setOptA(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opção B</label>
                      <Input value={optB} onChange={e => setOptB(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opção C</label>
                      <Input value={optC} onChange={e => setOptC(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opção D (Opcional)</label>
                      <Input value={optD} onChange={e => setOptD(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Opção E (Opcional)</label>
                      <Input value={optE} onChange={e => setOptE(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gabarito Correto</label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={correctOpt}
                        onChange={e => setCorrectOpt(e.target.value)}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Explicação/Comentário (Opcional)</label>
                    <Input value={questExpl} onChange={e => setQuestExpl(e.target.value)} placeholder="Por que esta é a correta?" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsQuestionOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddQuestion} className="bg-orange-600 hover:bg-orange-700">Salvar Questão</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selected = userAnswers[q.id]
              const showResult = showResults[q.id]
              const isCorrect = selected === q.correctOption

              return (
                <Card key={q.id} className="border-l-4 border-l-orange-500 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded">Questão {idx + 1}</span>
                    </div>
                    <div className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                      {q.content}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { key: "A", text: q.optionA },
                      { key: "B", text: q.optionB },
                      { key: "C", text: q.optionC },
                      { key: "D", text: q.optionD },
                      { key: "E", text: q.optionE }
                    ].filter(opt => opt.text).map((opt) => (
                      <button
                        key={opt.key}
                        disabled={showResult}
                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left text-sm ${
                          selected === opt.key 
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20" 
                            : "border-border hover:bg-muted"
                        } ${
                          showResult && opt.key === q.correctOption ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 ring-1 ring-emerald-500" : ""
                        } ${
                          showResult && selected === opt.key && !isCorrect ? "border-red-500 bg-red-50 dark:bg-red-950/20 ring-1 ring-red-500" : ""
                        }`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full border text-xs font-bold shrink-0 ${
                          selected === opt.key ? "bg-orange-500 border-orange-500 text-white" : "border-muted-foreground/30"
                        }`}>
                          {opt.key}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {showResult && opt.key === q.correctOption && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                        {showResult && selected === opt.key && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                      </button>
                    ))}

                    <div className="pt-4 flex flex-col md:flex-row items-center gap-3">
                      {!showResult ? (
                        <Button 
                          onClick={() => {
                            if (!selected) return toast.error("Selecione uma resposta")
                            setShowResults(prev => ({ ...prev, [q.id]: true }))
                          }}
                          className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto"
                        >
                          Responder
                        </Button>
                      ) : (
                        <div className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                          {isCorrect ? (
                            <><CheckCircle2 className="h-5 w-5" /> Você acertou!</>
                          ) : (
                            <><XCircle className="h-5 w-5" /> Resposta errada. A correta era {q.correctOption}.</>
                          )}
                        </div>
                      )}
                      
                      {showResult && q.explanation && (
                        <div className="flex-1 p-3 bg-muted rounded-md text-xs flex gap-2">
                          <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <p><strong>Comentário:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {questions.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg border-dashed">
                Seu banco de questões está vazio. Clique em "Nova Questão" para começar a praticar!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
