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
  RotateCcw
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

export default function SubjectDetailsPage() {
  const params = useParams()
  const subjectId = params.id as string
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
  const [isImportOpen, setIsImportOpen] = useState(false)

  // Forms state
  const [matTitle, setMatTitle] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  
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

  const handleImportQuestions = async () => {
    if (!importFile) return toast.error("Selecione um arquivo de prova")
    
    setIsImporting(true)
    try {
      const formData = new FormData()
      formData.append("file", importFile)
      
      const res = await fetch(`/api/subjects/${subjectId}/import-questions`, {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
        setIsImportOpen(false)
        setImportFile(null)
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

  if (loading) return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-muted rounded-md" />
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-muted" />
          <div className="h-8 w-48 bg-muted rounded-md" />
        </div>
      </div>
      <div className="w-full md:w-96 h-12 bg-muted rounded-xl" />
      <div className="h-[400px] bg-muted/50 rounded-3xl" />
    </div>
  )
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

              <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
                <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 flex-1 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-900/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Questão
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Adicionar Questão Manual</DialogTitle>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsQuestionOpen(false)}>Cancelar</Button>
                    <Button onClick={handleAddQuestion} className="bg-orange-600 hover:bg-orange-700">Salvar Questão</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            {questions.map((q, idx) => {
              const selected = userAnswers[q.id]
              const showResult = showResults[q.id]
              const isCorrect = selected === q.correctOption

              return (
                <Card key={q.id} className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-3 bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">QUESTÃO #{idx + 1}</span>
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
