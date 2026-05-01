import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Calendar,
  Bell
} from "lucide-react";
import { OverviewChart, DistributionChart } from "@/components/charts";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch real data
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  // 1. Horas Hoje
  const todaySessions = await prisma.studySession.findMany({
    where: { startTime: { gte: startOfToday } }
  });
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const hrsToday = Math.floor(todaySeconds / 3600);
  const minsToday = Math.floor((todaySeconds % 3600) / 60);

  // 2. Total da Semana
  const weekSessions = await prisma.studySession.findMany({
    where: { startTime: { gte: startOfWeek } },
    include: { subject: true }
  });
  const weekSeconds = weekSessions.reduce((acc, s) => acc + s.duration, 0);
  const hrsWeek = Math.floor(weekSeconds / 3600);
  const minsWeek = Math.floor((weekSeconds % 3600) / 60);

  // 3. Matérias Ativas na Semana
  const activeSubjectIds = new Set(weekSessions.map(s => s.subjectId));
  const activeSubjectsCount = activeSubjectIds.size;

  // 4. Bar Chart Data (Last 7 Days)
  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const overviewDataMap = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    overviewDataMap.set(d.toDateString(), { name: daysOfWeek[d.getDay()], total: 0 });
  }
  
  weekSessions.forEach(session => {
    const dateStr = session.startTime.toDateString();
    if (overviewDataMap.has(dateStr)) {
      const data = overviewDataMap.get(dateStr);
      data.total += (session.duration / 3600); // Em horas
      overviewDataMap.set(dateStr, data);
    }
  });
  const overviewData = Array.from(overviewDataMap.values()).map(d => ({...d, total: parseFloat(d.total.toFixed(1))}));

  // 5. Pie Chart Data (Distribution)
  const distributionMap = new Map();
  weekSessions.forEach(session => {
    if (!distributionMap.has(session.subjectId)) {
      distributionMap.set(session.subjectId, {
        name: session.subject.name,
        color: session.subject.color || "#3b82f6",
        value: 0
      });
    }
    const data = distributionMap.get(session.subjectId);
    data.value += session.duration;
    distributionMap.set(session.subjectId, data);
  });
  
  const totalDuration = Array.from(distributionMap.values()).reduce((acc, curr) => acc + curr.value, 0);
  const pieData = Array.from(distributionMap.values()).map(d => ({
    ...d,
    value: totalDuration > 0 ? Math.round((d.value / totalDuration) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  // 6. Revisões Pendentes
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const pendingReviews = await prisma.review.findMany({
    where: { 
      completed: false,
      dueDate: { lte: endOfToday }
    },
    include: { subject: true },
    orderBy: { dueDate: "asc" }
  });

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-card to-sky-500/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Hoje</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrsToday.toString().padStart(2, '0')}:{minsToday.toString().padStart(2, '0')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Foco contínuo e consistente
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matérias Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Disciplinas estudadas na semana
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-card to-indigo-500/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Semana</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrsWeek}h {minsWeek}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              {weekSeconds > 0 ? "Você está em ritmo constante!" : "Vamos começar a estudar!"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-card to-rose-500/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration > 0 ? "Alta" : "Iniciando"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado no foco reportado
            </p>
          </CardContent>
        </Card>
      </div>

      {pendingReviews.length > 0 && (
        <div className="grid gap-4 grid-cols-1">
          <Card className="shadow-sm border-amber-500/20 bg-gradient-to-r from-card to-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="font-semibold text-lg flex items-center text-amber-600 dark:text-amber-500">
                <Bell className="w-5 h-5 mr-2" />
                Revisões Pendentes para Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {pendingReviews.map(review => (
                  <div key={review.id} className="flex items-center gap-2 p-3 bg-background rounded-lg border shadow-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: review.subject.color }} />
                    <span className="font-medium text-sm">{review.subject.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">Agendado para {review.dueDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-border/50 bg-gradient-to-b from-card to-muted/10">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">Visão Geral (Semanal)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <OverviewChart data={overviewData} />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 shadow-sm border-border/50 bg-gradient-to-b from-card to-muted/10">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">Distribuição por Matéria</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart data={pieData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
