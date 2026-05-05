"use client";

import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function DashboardActions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "week";

  const handlePeriodChange = (period: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", period);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
      <div className="flex bg-muted p-1 rounded-md">
        <Button 
          variant={currentPeriod === "week" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => handlePeriodChange("week")}
          className="text-xs"
        >
          Semana
        </Button>
        <Button 
          variant={currentPeriod === "month" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => handlePeriodChange("month")}
          className="text-xs"
        >
          Mês
        </Button>
        <Button 
          variant={currentPeriod === "year" ? "default" : "ghost"} 
          size="sm" 
          onClick={() => handlePeriodChange("year")}
          className="text-xs"
        >
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
