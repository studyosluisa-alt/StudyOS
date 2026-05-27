"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
  Info,
  Sparkles,
  FileUp,
  Loader2,
  RotateCcw,
  Pencil,
  Trash2
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
  examName?: string | null
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

export function SubjectDetailsClient({ initialSubjectData }: { initialSubjectData: any }) {
  const params = useParams()
  const subjectId = params.id as string
  const router = useRouter()

  const [subject, setSubject] = useState<Subject | null>({ 
    id: initialSubjectData.id, 
    name: initialSubjectData.name, 
    color: initialSubjectData.color 
  })
  const [materials, setMaterials] = useState<Material[]>(initialSubjectData.materials || [])
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialSubjectData.flashcards || [])
  const [questions, setQuestions] = useState<Question[]>(initialSubjectData.questions || [])

  // Modals state
  const [isMaterialOpen, setIsMaterialOpen] = useState(false)
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false)
  const [isQuestionOpen, setIsQuestionOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  // Forms state
  const [matTitle, setMatTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState(false)
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null)
  const [answerKeyExam, setAnswerKeyExam] = useState("")
  const [isApplyingAnswerKey, setIsApplyingAnswerKey] = useState(false)
  
  // Flashcards state
  const [cardQ, setCardQ] = useState("")
  const [cardA, setCardA] = useState("")
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({})

  // Questions state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
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
  const [importExamName, setImportExamName] = useState("")
  const [questExamName, setQuestExamName] = useState("")
  const [selectedExamFilter, setSelectedExamFilter] = useState("all")
  const availableExamNames = Array.from(new Set(questions.map(q => q.examName).filter(Boolean))) as string[]

  const filteredQuestions = questions.filter(q => {
    if (selectedExamFilter === "all") return true
    if (selectedExamFilter === "Avulsas") return !q.examName
    return q.examName === selectedExamFilter
  })

  // Refresh data function to keep UI in sync
  const refreshData = async () => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}`)
      const data = await res.json()
      setSubject({ id: data.id, name: data.name, color: data.color })
      setMaterials(data.materials || [])
      setFlashcards(data.flashcards || [])
      setQuestions(data.questions || [])
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

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
      const url = editingQuestionId 
        ? `/api/questions/${editingQuestionId}`
        : `/api/subjects/${subjectId}/questions`
      const method = editingQuestionId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        body: JSON.stringify({
          content: questContent,
          optionA: optA,
          optionB: optB,
          optionC: optC,
          optionD: optD || null,
          optionE: optE || null,
          correctOption: correctOpt,
          explanation: questExpl || null,
          examName: questExamName || null
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (res.ok) {
        toast.success(editingQuestionId ? "Questão atualizada!" : "Questão adicionada!")
        setIsQuestionOpen(false)
        setEditingQuestionId(null)
        setQuestContent("")
        setOptA("")
        setOptB("")
        setOptC("")
        setOptD("")
        setOptE("")
        setCorrectOpt("A")
        setQuestExpl("")
        setQuestExamName("")
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

  const handleEditQuestion = (q: Question) => {
    setEditingQuestionId(q.id)
    setQuestContent(q.content)
    setOptA(q.optionA)
    setOptB(q.optionB)
    setOptC(q.optionC)
    setOptD(q.optionD || "")
    setOptE(q.optionE || "")
    setCorrectOpt(q.correctOption)
    setQuestExpl(q.explanation || "")
    setQuestExamName(q.examName || "")
    setIsQuestionOpen(true)
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Questão excluída!")
        refreshData()
      } else {
        toast.error("Erro ao excluir questão")
      }
    } catch (e) {
      toast.error("Erro na comunicação com servidor")
    }
  }

  const handleDeleteAllQuestions = async () => {
    if (!confirm("Tem certeza que deseja excluir todas as questões desta matéria? Esta ação é irreversível e não pode ser desfeita!")) return
    try {
      const res = await fetch(`/api/subjects/${subjectId}/questions`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Todas as questões foram excluídas!")
        refreshData()
      } else {
        toast.error("Erro ao excluir todas as questões")
      }
    } catch (e) {
      toast.error("Erro na comunicação com o servidor")
    }
  }

  const handleImportQuestions = async () => {
    if (!importFile) return toast.error("Selecione um arquivo de prova")
    
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      if (importExamName) {
        formData.append("examName", importExamName)
      }
      
      const res = await fetch(`/api/subjects/${subjectId}/import-questions`, {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        setIsImportOpen(false)
        setImportFile(null)
        setImportExamName("")
        refreshData()
      } else {
        // Exibe o erro específico + a mensagem técnica para diagnóstico
        const fullError = data.message ? `${data.error}: ${data.message}` : data.error
        toast.error(fullError || "Erro ao importar questões")
      }
    } catch (e: any) {
      toast.error("Ocorreu um erro na comunicação com o servidor")
    } finally {
      setIsImporting(false)
    }
  }

  const handleApplyAnswerKey = async () => {
    if (!answerKeyFile) return toast.error("Selecione o gabarito oficial")
    if (!answerKeyExam) return toast.error("Selecione a prova alvo")

    setIsApplyingAnswerKey(true)
    try {
      const formData = new FormData()
      formData.append("file", answerKeyFile)
      formData.append("examName", answerKeyExam)

      const res = await fetch(`/api/subjects/${subjectId}/import-answer-key`, {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.updatedCount > 0 ? `${data.updatedCount} questões atualizadas com o gabarito!` : "Nenhuma questão encontrada para essa prova.")
        setIsAnswerKeyOpen(false)
        setAnswerKeyFile(null)
        setAnswerKeyExam("")
        refreshData()
      } else {
        const fullError = data.message ? `${data.error}: ${data.message}` : data.error
        toast.error(fullError || "Erro ao aplicar gabarito")
      }
    } catch (e: any) {
      toast.error("Erro na comunicação com o servidor")
    } finally {
      setIsApplyingAnswerKey(false)
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

  if (!subject) return <div className="p-8">Matéria não encontrada.</div>

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/subjects")} className="hover:bg-muted/80">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full shadow-lg" style={{ backgroundColor: subject.color }} />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{subject.name}</h2>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="inline-flex w-full md:w-auto h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto no-scrollbar gap-1 mb-6">
          <TabsTrigger 
            value="materials" 
            className="flex-1 md:flex-none px-6 py-3 text-sm font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Materiais
          </TabsTrigger>
          <TabsTrigger 
            value="flashcards" 
            className="flex-1 md:flex-none px-6 py-3 text-sm font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Flashcards
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            className="flex-1 md:flex-none px-6 py-3 text-sm font-semibold rounded-lg whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
          >
            Questões (Tarefas)
          </TabsTrigger>
        </TabsList>
        
        {/* Materiais Tab */}
        <TabsContent value="materials" className="space-y-4 outline-none">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border border-border/50">
            <div>
              <h3 className="text-lg font-bold">Biblioteca de Materiais</h3>
              <p className="text-sm text-muted-foreground">PDFs, resumos e arquivos de estudo.</p>
            </div>
            <Dialog open={isMaterialOpen} onOpenChange={setIsMaterialOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-sky-600 text-primary-foreground shadow hover:bg-sky-700 shadow-lg shadow-sky-900/20">
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Fazer Upload de Material</DialogTitle>
                  <DialogDescription>Selecione um arquivo de estudo para vincular a esta matéria.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Arquivo</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer relative">
                      <Input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0])
                            if (!matTitle) setMatTitle(e.target.files[0].name)
                          }
                        }}
                      />
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {selectedFile ? selectedFile.name : "Clique ou arraste um arquivo"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título Exibição (Opcional)</label>
                    <Input 
                      placeholder="Ex: Resumo de Geometria" 
                      value={matTitle} 
                      onChange={e => setMatTitle(e.target.value)} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMaterialOpen(false)} disabled={isUploading}>Cancelar</Button>
                  <Button onClick={handleAddMaterial} disabled={isUploading} className="bg-sky-600 hover:bg-sky-700">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isUploading ? "Enviando..." : "Enviar Material"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {materials.map(mat => (
              <Card key={mat.id} className="group hover:shadow-xl transition-all border-border/40 hover:border-sky-500/30 overflow-hidden">
                <CardHeader className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 rounded-lg">
                      <Upload className="h-5 w-5 text-sky-500" />
                    </div>
                    <CardTitle className="text-base font-semibold group-hover:text-sky-500 transition-colors line-clamp-1">{mat.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Button variant="secondary" className="w-full bg-muted/50 hover:bg-sky-500 hover:text-white transition-all" onClick={() => window.open(mat.url, "_blank")}>
                    Visualizar <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {materials.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/10 border-2 border-dashed rounded-3xl">
                <div className="p-4 bg-muted/20 w-fit mx-auto rounded-full mb-4">
                  <FileUp className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-medium">Nenhum material importado</p>
                <p className="text-xs">Suba PDFs ou resumos para começar.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4 outline-none">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl border border-border/50">
            <div>
              <h3 className="text-lg font-bold">Mesa de Revisão</h3>
              <p className="text-sm text-muted-foreground">Teste sua memória com flashcards ativos.</p>
            </div>
            <Dialog open={isFlashcardOpen} onOpenChange={setIsFlashcardOpen}>
              <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-indigo-600 text-primary-foreground shadow hover:bg-indigo-700 shadow-lg shadow-indigo-900/20">
                <Plus className="h-4 w-4 mr-2" />
                Novo Flashcard
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Flashcard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frente (Pergunta)</label>
                    <Input placeholder="Qual é o conceito de..." value={cardQ} onChange={e => setCardQ(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Verso (Resposta)</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Explicação detalhada..."
                      value={cardA} 
                      onChange={e => setCardA(e.target.value)} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsFlashcardOpen(false)}>Cancelar</Button>
                  <Button onClick={handleAddFlashcard} className="bg-indigo-600 hover:bg-indigo-700">Salvar Card</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
            {flashcards.map(card => {
              const isFlipped = flippedCards[card.id]
              return (
                <div key={card.id} className="perspective-1000 group">
                  <Card 
                    className={`relative w-full min-h-[220px] transition-all duration-500 preserve-3d cursor-pointer border-indigo-500/10 hover:border-indigo-500/40 shadow-sm hover:shadow-indigo-500/10 ${isFlipped ? "rotate-y-180" : ""}`}
                    onClick={() => toggleFlip(card.id)}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between bg-card">
                      <div className="p-2 bg-indigo-500/5 w-fit rounded-lg mb-2 text-indigo-500/50">
                        <BrainCircuit className="h-5 w-5" />
                      </div>
                      <p className="text-base font-semibold text-center leading-relaxed flex-1 flex items-center justify-center italic">
                        "{card.question}"
                      </p>
                      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-4">Clique para ver a resposta</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between bg-indigo-950/10 rotate-y-180 border-t-2 border-indigo-500/50">
                      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        <p className="text-sm font-medium leading-relaxed text-indigo-100/90 whitespace-pre-wrap">
                          {card.answer}
                        </p>
                      </div>
                      <p className="text-[10px] text-center text-indigo-500/50 uppercase tracking-widest mt-4">Concluído</p>
                    </div>
                  </Card>
                </div>
              )
            })}
            {flashcards.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/10 border-2 border-dashed rounded-3xl">
                <p className="font-medium">Mesa vazia</p>
                <p className="text-xs">Crie perguntas desafiadoras para revisar.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Questões Tab */}
        <TabsContent value="questions" className="space-y-6 outline-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
            <div>
              <h3 className="text-lg font-bold">Banco de Questões</h3>
              <p className="text-sm text-muted-foreground">Pratique com exercícios e simulados inteligentes.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              {/* Botão de Refazer */}
              <Button 
                variant="outline" 
                onClick={() => { setUserAnswers({}); setShowResults({}) }}
                className="h-9 px-4 py-2 border-border hover:bg-muted font-medium"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refazer
              </Button>

              {/* Botão de Excluir Todos */}
              {questions.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleDeleteAllQuestions}
                  className="h-9 px-4 py-2 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Todas
                </Button>
              )}

              {/* Botão de Importação IA */}
              <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 flex-1 border border-orange-500/30 hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold group">
                  <Sparkles className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                  Importar Prova IA
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-500" />
                      Importação Inteligente
                    </DialogTitle>
                    <DialogDescription>
                      Suba uma imagem da prova ou PDF. Nossa IA vai ler as questões e opções para você automaticamente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-orange-500/20 rounded-2xl p-8 text-center hover:bg-orange-500/5 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <div className="bg-orange-500/10 p-4 rounded-full w-fit mx-auto mb-4">
                        <FileUp className="h-8 w-8 text-orange-500" />
                      </div>
                      <p className="font-semibold text-sm">
                        {importFile ? importFile.name : "Clique para selecionar a prova"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou PDF (Máx 4MB)</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold opacity-50">NOME DA PROVA / SIMULADO (OPCIONAL)</label>
                      <Input
                        placeholder="Ex: ENEM 2025 (Padrão: nome do arquivo)"
                        value={importExamName}
                        onChange={(e) => setImportExamName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsImportOpen(false)} disabled={isImporting}>Cancelar</Button>
                    <Button 
                      onClick={handleImportQuestions} 
                      disabled={isImporting || !importFile}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {isImporting ? "IA está lendo a prova..." : "Iniciar Extração IA"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {availableExamNames.length > 0 && (
                <Dialog open={isAnswerKeyOpen} onOpenChange={setIsAnswerKeyOpen}>
                  <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 flex-1 border border-sky-500/30 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold group">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Importar Gabarito
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-sky-500" />
                        Importar Gabarito Oficial
                      </DialogTitle>
                      <DialogDescription>
                        Selecione a prova alvo e suba o arquivo do gabarito para corrigir automaticamente as questões importadas.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold opacity-50">Prova alvo</label>
                        <select
                          value={answerKeyExam}
                          onChange={(e) => setAnswerKeyExam(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                        >
                          <option value="">Selecione uma prova</option>
                          {availableExamNames.map((exam) => (
                            <option key={exam} value={exam}>{exam}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold opacity-50">Arquivo do gabarito</label>
                        <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:border-sky-500/50 transition-colors cursor-pointer relative">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)}
                          />
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {answerKeyFile ? answerKeyFile.name : "Clique ou arraste o gabarito oficial"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsAnswerKeyOpen(false)} disabled={isApplyingAnswerKey}>Cancelar</Button>
                      <Button 
                        onClick={handleApplyAnswerKey} 
                        disabled={isApplyingAnswerKey || !answerKeyFile || !answerKeyExam}
                        className="bg-sky-600 hover:bg-sky-700"
                      >
                        {isApplyingAnswerKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isApplyingAnswerKey ? "Aplicando gabarito..." : "Aplicar Gabarito"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
                <DialogTrigger 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-900/20"
                  onClick={() => {
                    setEditingQuestionId(null)
                    setQuestContent("")
                    setOptA("")
                    setOptB("")
                    setOptC("")
                    setOptD("")
                    setOptE("")
                    setCorrectOpt("A")
                    setQuestExpl("")
                    setQuestExamName("")
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Questão
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>{editingQuestionId ? "Editar Questão" : "Adicionar Questão Manual"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-orange-500">ENUNCIADO</label>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        placeholder="Escreva a pergunta detalhadamente..."
                        value={questContent}
                        onChange={e => setQuestContent(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["A", "B", "C", "D", "E"].map((letter) => (
                        <div key={letter} className="space-y-2">
                          <label className="text-xs font-bold opacity-50">OPÇÃO {letter}</label>
                          <Input 
                            value={letter === "A" ? optA : letter === "B" ? optB : letter === "C" ? optC : letter === "D" ? optD : optE} 
                            onChange={e => {
                              if (letter === "A") setOptA(e.target.value)
                              if (letter === "B") setOptB(e.target.value)
                              if (letter === "C") setOptC(e.target.value)
                              if (letter === "D") setOptD(e.target.value)
                              if (letter === "E") setOptE(e.target.value)
                            }}
                            className="rounded-xl"
                          />
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-emerald-500">GABARITO CORRETO</label>
                        <select 
                          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={correctOpt}
                          onChange={e => setCorrectOpt(e.target.value)}
                        >
                          <option value="A">Alternativa A</option>
                          <option value="B">Alternativa B</option>
                          <option value="C">Alternativa C</option>
                          <option value="D">Alternativa D</option>
                          <option value="E">Alternativa E</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold opacity-50">EXPLICAÇÃO (OPCIONAL)</label>
                      <Input value={questExpl} onChange={e => setQuestExpl(e.target.value)} placeholder="Comentários sobre a resposta..." className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold opacity-50">PROVA / SIMULADO (OPCIONAL)</label>
                      <Input value={questExamName} onChange={e => setQuestExamName(e.target.value)} placeholder="Ex: ENEM 2025" className="rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsQuestionOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddQuestion} className="bg-orange-600 hover:bg-orange-700">
                      {editingQuestionId ? "Salvar Alterações" : "Salvar Questão"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filtros de Prova */}
          {questions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 pb-4">
              <button
                onClick={() => setSelectedExamFilter("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border shrink-0 ${
                  selectedExamFilter === "all"
                    ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-900/20"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                Todas ({questions.length})
              </button>
              {Array.from(new Set(questions.map(q => q.examName || "Avulsas"))).map(exam => {
                const countNum = questions.filter(q => (q.examName || "Avulsas") === exam).length
                return (
                  <div 
                    key={exam} 
                    onClick={() => setSelectedExamFilter(exam)}
                    className={`flex items-center gap-2 pl-4 pr-2 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedExamFilter === exam
                        ? "bg-orange-600/10 border-orange-500/30 text-orange-500"
                        : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>
                      {exam} ({countNum})
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm(`Tem certeza que deseja excluir todas as ${countNum} questões da prova "${exam}"?`)) {
                          try {
                            const res = await fetch(`/api/subjects/${subjectId}/questions?examName=${encodeURIComponent(exam === "Avulsas" ? "" : exam)}`, { method: "DELETE" })
                            if (res.ok) {
                              toast.success(`Questões da prova "${exam}" excluídas!`)
                              setSelectedExamFilter("all")
                              refreshData()
                            } else {
                              toast.error("Erro ao excluir questões da prova")
                            }
                          } catch (err) {
                            toast.error("Erro na comunicação com o servidor")
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-6 pt-4">
            {questions.length > 0 && filteredQuestions.length === 0 && (
              <div className="py-16 text-center text-muted-foreground bg-muted/10 border-2 border-dashed rounded-3xl">
                <p className="font-semibold">Nenhuma questão encontrada para este filtro.</p>
              </div>
            )}
            {filteredQuestions.map((q) => {
              const absoluteIdx = questions.findIndex(orig => orig.id === q.id)
              const selected = userAnswers[q.id]
              const showResult = showResults[q.id]
              const isCorrect = selected === q.correctOption

              return (
                <Card key={q.id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3 bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">QUESTÃO #{absoluteIdx + 1}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-indigo-500" onClick={() => handleEditQuestion(q)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => handleDeleteQuestion(q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm md:text-base font-semibold leading-relaxed whitespace-pre-wrap">
                      {q.content}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-6 pt-4">
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
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left text-sm group ${
                          selected === opt.key 
                            ? "border-orange-500 bg-orange-500/5" 
                            : "border-transparent bg-muted/40 hover:bg-muted/60"
                        } ${
                          showResult && opt.key === q.correctOption ? "border-emerald-500/50 bg-emerald-500/5" : ""
                        } ${
                          showResult && selected === opt.key && !isCorrect ? "border-red-500/50 bg-red-500/5" : ""
                        }`}
                      >
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl border-2 text-xs font-black shrink-0 transition-colors ${
                          selected === opt.key ? "bg-orange-500 border-orange-500 text-white" : "border-muted-foreground/20 text-muted-foreground"
                        } ${
                          showResult && opt.key === q.correctOption ? "bg-emerald-500 border-emerald-500 text-white" : ""
                        } ${
                          showResult && selected === opt.key && !isCorrect ? "bg-red-500 border-red-500 text-white" : ""
                        }`}>
                          {opt.key}
                        </span>
                        <span className="flex-1 font-medium">{opt.text}</span>
                        {showResult && opt.key === q.correctOption && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                        {showResult && selected === opt.key && !isCorrect && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                      </button>
                    ))}

                    <div className="pt-6 flex flex-col md:flex-row items-center gap-4">
                      {!showResult ? (
                        <Button 
                          onClick={() => {
                            if (!selected) return toast.error("Selecione uma resposta")
                            setShowResults(prev => ({ ...prev, [q.id]: true }))
                          }}
                          className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto h-12 px-10 rounded-2xl shadow-lg shadow-orange-900/20 font-bold"
                        >
                          Verificar Gabarito
                        </Button>
                      ) : (
                        <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border-2 w-full md:w-auto ${isCorrect ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"}`}>
                          {isCorrect ? (
                            <><CheckCircle2 className="h-6 w-6" /> PARABÉNS! VOCÊ ACERTOU.</>
                          ) : (
                            <><XCircle className="h-6 w-6" /> OPS! A RESPOSTA CORRETA ERA {q.correctOption}.</>
                          )}
                        </div>
                      )}
                      
                      {showResult && q.explanation && (
                        <div className="flex-1 p-5 bg-muted/30 rounded-2xl text-xs flex gap-3 border border-border/50 backdrop-blur-sm">
                          <Info className="h-5 w-5 shrink-0 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="font-bold uppercase tracking-wider text-muted-foreground/60">Explicação do Professor</p>
                            <p className="leading-relaxed opacity-90">{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {questions.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/10 border-2 border-dashed rounded-[3rem]">
                <div className="p-5 bg-orange-500/5 w-fit mx-auto rounded-full mb-6">
                  <ClipboardCheck className="h-10 w-10 text-orange-500 opacity-20" />
                </div>
                <p className="text-xl font-bold mb-1">Seu banco de questões está vazio</p>
                <p className="text-sm max-w-sm mx-auto opacity-70">Comece adicionando questões manualmente ou use nossa IA para importar uma prova inteira de uma vez!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  )
}
