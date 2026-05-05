"use client";

import { useState } from "react";
import { Bell, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export function ReviewList({ initialReviews }: { initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  if (reviews.length === 0) return null;

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsUpdating(id);
      const res = await fetch(`/api/reviews/${id}`, { method: "PATCH" });
      
      if (!res.ok) throw new Error("Falha ao concluir revisão");
      
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success("Revisão marcada como concluída!");
      router.refresh(); 
    } catch (error) {
      toast.error("Erro ao completar revisão");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1">
      <Card className="shadow-sm border-amber-500/20 bg-gradient-to-r from-card to-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="font-semibold text-lg flex items-center text-amber-600 dark:text-amber-500">
            <Bell className="w-5 h-5 mr-2" />
            Revisões Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviews.map(review => (
              <Link 
                href={`/subjects/${review.subjectId}`} 
                key={review.id} 
                className="group flex flex-col justify-between p-3 bg-background hover:bg-muted/50 rounded-lg border shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: review.subject.color }} />
                  <span className="font-medium text-sm truncate" title={review.subject.name}>{review.subject.name}</span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground flex items-center">
                    Acessar Matéria <ChevronRight className="w-3 h-3 ml-1" />
                  </span>
                  
                  <button 
                    onClick={(e) => handleComplete(e, review.id)}
                    disabled={isUpdating === review.id}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors"
                  >
                    <CheckCircle2 className={`w-3 h-3 ${isUpdating === review.id ? 'animate-spin' : ''}`} />
                    {isUpdating === review.id ? 'Salvando...' : 'Concluir'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
