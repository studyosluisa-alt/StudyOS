import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, TrendingUp, Calendar } from "lucide-react";
import { OverviewChart, DistributionChart } from "@/components/charts";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { ReviewList } from "@/components/dashboard/review-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage(
  props: { searchParams: Promise<{ period?: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const searchParams = await props.searchParams;
  const period = searchParams?.period || "week";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  // 1. Horas Hoje
  const todaySessions = await prisma.studySession.findMany({
    where: { 
      startTime: { gte: startOfToday },
      subject: { userId }
    },
    include: { subject: true }
  });
  const todaySeconds = todaySessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
  const hrsToday = Math.floor(todaySeconds / 3600);
  const minsToday = Math.floor((todaySeconds % 3600) / 60);

  // 1.5. Visão Diária por Matéria
  const dailyDistributionMap = new Map();
  todaySessions.forEach((session: any) => {
    if (!dailyDistributionMap.has(session.subjectId)) {
      dailyDistributionMap.set(session.subjectId, {
        name: session.subject.name,
        color: session.subject.color || "#3b82f6",
        duration: 0
      });
    }
    const data = dailyDistributionMap.get(session.subjectId);
    data.duration += session.duration;
    dailyDistributionMap.set(session.subjectId, data);
  });
  const dailyData = Array.from(dailyDistributionMap.values()).sort((a: any, b: any) => b.duration - a.duration);

  // 2. Total do Período
  const periodSessions = await prisma.studySession.findMany({
    where: { 
      startTime: { gte: startDate },
      subject: { userId }
    },
    include: { subject: true }
  });
  const periodSeconds = periodSessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
  const hrsPeriod = Math.floor(periodSeconds / 3600);
  const minsPeriod = Math.floor((periodSeconds % 3600) / 60);

  // 3. Matérias Ativas no Período
  const activeSubjectIds = new Set(periodSessions.map(s => s.subjectId));
  const activeSubjectsCount = activeSubjectIds.size;

  // 4. Bar Chart Data
  const chartDataMap = new Map();
  if (period === 'year') {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    for (let i = 0; i <= now.getMonth(); i++) {
      chartDataMap.set(i.toString(), { name: months[i], total: 0 });
    }
  } else {
    const daysCount = period === 'month' ? 30 : 7;
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toDateString();
      const label = period === 'month' 
        ? `${d.getDate()}/${d.getMonth()+1}` 
        : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
      chartDataMap.set(key, { name: label, total: 0 });
    }
  }
  
  periodSessions.forEach(session => {
    if (period === 'year') {
      const m = session.startTime.getMonth().toString();
      if (chartDataMap.has(m)) {
        const data = chartDataMap.get(m);
        data.total += (session.duration / 3600);
        chartDataMap.set(m, data);
      }
    } else {
      const dateStr = session.startTime.toDateString();
      if (chartDataMap.has(dateStr)) {
        const data = chartDataMap.get(dateStr);
        data.total += (session.duration / 3600);
        chartDataMap.set(dateStr, data);
      }
    }
  });
  const overviewData = Array.from(chartDataMap.values()).map(d => ({...d, total: parseFloat(d.total.toFixed(1))}));

  // 5. Pie Chart Data
  const distributionMap = new Map();
  periodSessions.forEach(session => {
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
  
  const totalDuration = Array.from(distributionMap.values()).reduce((acc: number, curr: any) => acc + (curr.value || 0), 0);
  const pieData = Array.from(distributionMap.values()).map(d => ({
    ...d,
    value: totalDuration > 0 ? Math.round((d.value / totalDuration) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  // 6. Revisões Pendentes
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const pendingReviews = await prisma.review.findMany({
    where: { 
      completed: false,
      dueDate: { lte: endOfToday },
      subject: { userId }
    },
    include: { subject: true },
    orderBy: { dueDate: "asc" }
  });

  const periodLabel = period === "week" ? "da Semana" : period === "month" ? "do Mês" : "do Ano";

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <DashboardActions />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-card to-sky-500/5 shadow-sm transition-all card-hover-effect cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Hoje</CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrsToday.toString().padStart(2, '0')}:{minsToday.toString().padStart(2, '0')}</div>
            <p className="text-xs text-muted-foreground mt-1">Foco contínuo e consistente</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5 shadow-sm transition-all card-hover-effect cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matérias Ativas</CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubjectsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Disciplinas estudadas no período</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-indigo-500/20 bg-gradient-to-br from-card to-indigo-500/5 shadow-sm transition-all card-hover-effect cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total {periodLabel}</CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrsPeriod}h {minsPeriod}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              {periodSeconds > 0 ? "Ritmo constante!" : "Vamos começar?"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-card to-rose-500/5 shadow-sm transition-all card-hover-effect cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration > 0 ? "Alta" : "Iniciando"}</div>
            <p className="text-xs text-muted-foreground mt-1">Baseado no foco reportado</p>
          </CardContent>
        </Card>
      </div>

      <ReviewList initialReviews={pendingReviews} />

      <div className="grid gap-4 grid-cols-1">
        <Card className="shadow-sm border-border/50 bg-gradient-to-b from-card to-muted/10">
          <CardHeader className="pb-4">
            <CardTitle className="font-semibold text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Estudado Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Você ainda não registrou nenhum estudo hoje.</p>
                <Link href="/timer">
                  <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    Iniciar o Cronômetro
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyData.map((d: any, i: number) => {
                  const hrs = Math.floor(d.duration / 3600);
                  const mins = Math.floor((d.duration % 3600) / 60);
                  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
                  const percentage = todaySeconds > 0 ? Math.round((d.duration / todaySeconds) * 100) : 0;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: d.color }} />
                          <span className="font-medium">{d.name}</span>
                        </div>
                        <span className="font-bold text-muted-foreground">{timeStr} <span className="opacity-50 font-normal ml-1">({percentage}%)</span></span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ backgroundColor: d.color, width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 shadow-sm border-border/50 bg-gradient-to-b from-card to-muted/10">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">Visão Geral ({periodLabel})</CardTitle>
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
