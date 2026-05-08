"use client";

import { Button } from "@/components/ui/button";
import { Plus, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

export function DashboardActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "week";

  const [isPending, startTransition] = useTransition();
  const [optimisticPeriod, setOptimisticPeriod] = useState<string | null>(null);

  // Sincroniza o estado otimista quando o período real da URL muda
  useEffect(() => {
    setOptimisticPeriod(null);
  }, [currentPeriod]);

  const handlePeriodChange = (period: string) => {
    if (period === currentPeriod || isPending) return;
    setOptimisticPeriod(period);

    const params = new URLSearchParams(searchParams);
    params.set("period", period);

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const activePeriod = optimisticPeriod || currentPeriod;

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
      <div className="flex bg-muted p-1 rounded-md">
        <Button 
          variant={activePeriod === "week" ? "default" : "ghost"} 
          size="sm" 
          disabled={isPending}
          onClick={() => handlePeriodChange("week")}
          className="text-xs min-w-[70px] transition-all duration-200"
        >
          {isPending && optimisticPeriod === "week" && (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          )}
          Semana
        </Button>
        <Button 
          variant={activePeriod === "month" ? "default" : "ghost"} 
          size="sm" 
          disabled={isPending}
          onClick={() => handlePeriodChange("month")}
          className="text-xs min-w-[70px] transition-all duration-200"
        >
          {isPending && optimisticPeriod === "month" && (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          )}
          Mês
        </Button>
        <Button 
          variant={activePeriod === "year" ? "default" : "ghost"} 
          size="sm" 
          disabled={isPending}
          onClick={() => handlePeriodChange("year")}
          className="text-xs min-w-[70px] transition-all duration-200"
        >
          {isPending && optimisticPeriod === "year" && (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          )}
          Ano
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Link href="/timer" className="flex-1 sm:flex-none">
          <Button size="sm" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-0">
            <Play className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Iniciar Estudo</span>
            <span className="sm:hidden">Estudar</span>
          </Button>
        </Link>
        <Link href="/subjects" className="flex-1 sm:flex-none">
          <Button size="sm" variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Matéria</span>
            <span className="sm:hidden">Matéria</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
