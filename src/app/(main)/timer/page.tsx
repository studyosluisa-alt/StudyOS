"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save,
  BookOpen,
  TrendingUp,
  Clock,
  Bell
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function TimerPage() {
  const [mode, setMode] = useState<"stopwatch" | "timer" | "manual">("stopwatch")
  const [time, setTime] = useState(0) // time always stores ELAPSED time in seconds
  const [targetTime, setTargetTime] = useState(25 * 60) // Default 25 min Pomodoro
  
  // Manual mode state
  const [manualHours, setManualHours] = useState(0)
  const [manualMinutes, setManualMinutes] = useState(0)
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split("T")[0])
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [subjects, setSubjects] = useState<{id: string, name: string, color: string}[]>([])
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [studyType, setStudyType] = useState("Estudo")
  const [scheduleReview, setScheduleReview] = useState("0")

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects")
        const data = await response.json()
        setSubjects(data)
      } catch (error) {
        console.error("Erro ao buscar matérias", error)
      }
    }
    fetchSubjects()
  }, [])

  // Load from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("study-timer-mode") as "stopwatch" | "timer" | "manual" | null
    const savedTime = localStorage.getItem("study-timer-time")
    const savedTarget = localStorage.getItem("study-timer-target")
    const savedIsRunning = localStorage.getItem("study-timer-isRunning")
    const lastUpdate = localStorage.getItem("study-timer-lastUpdate")
    const savedStartTime = localStorage.getItem("study-timer-startTime")

    if (savedMode) setMode(savedMode)
    if (savedTarget) setTargetTime(parseInt(savedTarget))
    if (savedStartTime) setStartTime(new Date(savedStartTime))

    if (savedTime) {
      let currentTime = parseInt(savedTime)
      if (savedIsRunning === "true" && lastUpdate) {
        const diff = Math.floor((Date.now() - parseInt(lastUpdate)) / 1000)
        currentTime += diff
        setIsRunning(true)
      }
      setTime(currentTime)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("study-timer-mode", mode)
    localStorage.setItem("study-timer-target", targetTime.toString())
    localStorage.setItem("study-timer-time", time.toString())
    localStorage.setItem("study-timer-isRunning", isRunning.toString())
    localStorage.setItem("study-timer-lastUpdate", Date.now().toString())
    if (startTime) {
      localStorage.setItem("study-timer-startTime", startTime.toISOString())
    } else {
      localStorage.removeItem("study-timer-startTime")
    }
  }, [mode, targetTime, time, isRunning, startTime])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          const next = prev + 1
          if (mode === "timer" && next >= targetTime) {
            setIsRunning(false)
            toast.success("Tempo esgotado!", {
              icon: <Bell className="h-5 w-5 text-yellow-500" />
            })
            // Opcional: tocar um som aqui
          }
          return next
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, mode, targetTime])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const displaySeconds = mode === "timer" ? Math.max(0, targetTime - time) : time

  const handleStartPause = () => {
    if (!selectedSubject && !isRunning) {
      toast.error("Por favor, selecione uma matéria primeiro.")
      return
    }
    if (mode === "timer" && time >= targetTime) {
       toast.error("O tempo deste timer já acabou. Zere para recomeçar.")
       return
    }
    if (!isRunning && !startTime) {
      setStartTime(new Date())
    }
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    if (confirm("Tem certeza que deseja zerar o tempo?")) {
      setTime(0)
      setIsRunning(false)
      setStartTime(null)
    }
  }

  const handleSave = async () => {
    if (time < 60) {
      toast.error("O tempo de estudo deve ser de pelo menos 1 minuto.")
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          subjectId: selectedSubject,
          startTime: startTime || new Date(Date.now() - time * 1000),
          endTime: new Date(),
          duration: time,
          manual: false,
          type: studyType,
          scheduleReview: scheduleReview !== "0" ? parseInt(scheduleReview) : null
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Sessão salva com sucesso!")
        setTime(0)
        setIsRunning(false)
        setStartTime(null)
      } else {
        toast.error("Erro ao salvar a sessão.")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveManual = async () => {
    const totalSeconds = (manualHours * 3600) + (manualMinutes * 60)
    if (totalSeconds < 60) {
      toast.error("O tempo de estudo deve ser de pelo menos 1 minuto.")
      return
    }
    if (!selectedSubject) {
      toast.error("Selecione uma matéria.")
      return
    }

    setIsSaving(true)
    try {
      const start = new Date(manualDate + "T12:00:00") // rough estimate for the middle of the day
      
      const response = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          subjectId: selectedSubject,
          startTime: start,
          endTime: new Date(start.getTime() + totalSeconds * 1000),
          duration: totalSeconds,
          manual: true,
          type: studyType,
          scheduleReview: scheduleReview !== "0" ? parseInt(scheduleReview) : null
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast.success("Registro manual salvo com sucesso!")
        setManualHours(0)
        setManualMinutes(0)
      } else {
        toast.error("Erro ao salvar o registro manual.")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tempo de Estudo</h2>
        <p className="text-sm md:text-base text-muted-foreground">Escolha entre contar o tempo progressivamente ou estabelecer uma meta regressiva.</p>
      </div>

      <Card className="w-full">
        <CardHeader className="text-center pb-2">
           <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stopwatch" disabled={isRunning}>Cronômetro</TabsTrigger>
              <TabsTrigger value="timer" disabled={isRunning}>Timer</TabsTrigger>
              <TabsTrigger value="manual" disabled={isRunning}>Manual</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 md:space-y-8 pb-10 pt-4">
          
          {mode === "timer" && !isRunning && time === 0 && (
             <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium">Tempo (min):</span>
                <Input 
                  type="number" 
                  className="w-20 text-center" 
                  value={targetTime === 0 ? "" : targetTime / 60} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    setTargetTime(isNaN(val) ? 0 : val * 60)
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) <= 0) {
                      setTargetTime(25 * 60)
                    }
                  }}
                />
             </div>
          )}

          {mode !== "manual" ? (
            <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums">
              {formatTime(displaySeconds)}
            </div>
          ) : (
            <div className="flex gap-4 items-end mb-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70">Horas</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={manualHours} 
                  onChange={e => setManualHours(parseInt(e.target.value) || 0)} 
                  className="w-24 text-center text-2xl h-14 rounded-2xl" 
                />
              </div>
              <div className="text-3xl font-bold pb-3 opacity-30">:</div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-70">Minutos</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="59" 
                  value={manualMinutes} 
                  onChange={e => setManualMinutes(parseInt(e.target.value) || 0)} 
                  className="w-24 text-center text-2xl h-14 rounded-2xl" 
                />
              </div>
            </div>
          )}

          <div className="w-full max-w-md space-y-4 pt-4 border-t border-dashed">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Matéria</label>
                <Select onValueChange={(val) => setSelectedSubject(val || "")} value={selectedSubject} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione...">
                      {selectedSubject 
                        ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subjects.find(s => s.id === selectedSubject)?.color || "#ccc" }} />
                            {subjects.find(s => s.id === selectedSubject)?.name || "Selecionado"}
                          </div>
                        )
                        : "Selecione..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                         <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                           {subject.name}
                         </div>
                      </SelectItem>
                    ))}
                    {subjects.length === 0 && (
                      <div className="p-2 text-xs text-muted-foreground text-center">Nenhuma matéria</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select onValueChange={(val) => setStudyType(val || "Estudo")} value={studyType} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione...">
                      {studyType}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estudo">Geral</SelectItem>
                    <SelectItem value="Leitura">Leitura</SelectItem>
                    <SelectItem value="Vídeo Aula">Vídeo Aula</SelectItem>
                    <SelectItem value="Atividades">Atividades / Exercícios</SelectItem>
                    <SelectItem value="Revisão">Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Agendar Revisão</label>
                <Select onValueChange={(val) => setScheduleReview(val || "0")} value={scheduleReview} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione...">
                      {scheduleReview === "0" ? "Não agendar" : 
                       scheduleReview === "1" ? "Rever amanhã" : 
                       scheduleReview === "3" ? "Rever em 3 dias" : 
                       scheduleReview === "7" ? "Rever em 1 semana" : "Selecione..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Não agendar</SelectItem>
                    <SelectItem value="1">Rever amanhã</SelectItem>
                    <SelectItem value="3">Rever em 3 dias</SelectItem>
                    <SelectItem value="7">Rever em 1 semana</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div className="w-full flex justify-center mt-8">
            {mode !== "manual" ? (
              <div className="flex flex-wrap justify-center items-center gap-4">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-16 w-16 rounded-full"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                
                <Button 
                  size="lg" 
                  className={`h-24 w-24 rounded-full shadow-lg transition-all active:scale-95 ${
                    isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={handleStartPause}
                >
                  {isRunning ? (
                    <Pause className="h-10 w-10 text-white" />
                  ) : (
                    <Play className="h-10 w-10 text-white ml-1" />
                  )}
                </Button>

                <Button 
                  size="lg" 
                  variant="default" 
                  className="h-16 w-16 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleSave}
                  disabled={time === 0 || isRunning || isSaving}
                >
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 w-full max-w-md bg-muted/20 p-6 rounded-3xl border border-border/50">
                <div className="space-y-2">
                   <label className="text-sm font-medium">Data do Estudo</label>
                   <Input 
                     type="date" 
                     className="h-12 rounded-xl"
                     value={manualDate} 
                     onChange={e => setManualDate(e.target.value)} 
                   />
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 rounded-xl text-base font-bold shadow-indigo-500/20 shadow-lg disabled:opacity-70" 
                  onClick={handleSaveManual}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
                  {isSaving ? "Salvando..." : "Salvar Tempo Manual"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
