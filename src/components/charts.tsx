"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

export function OverviewChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-[350px] items-center justify-center text-muted-foreground text-sm">Sem dados suficientes para a semana.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}h`}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ 
            backgroundColor: "rgba(15, 23, 42, 0.8)", 
            backdropFilter: "blur(8px)",
            borderRadius: "12px", 
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
          }}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}
          formatter={(value: any) => [`${value} horas`, 'Tempo']}
        />
        <Bar
          dataKey="total"
          fill="url(#colorTotal)"
          radius={[6, 6, 0, 0]}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistributionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">Sem estudos recentes para mostrar.</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          stroke="transparent"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "rgba(15, 23, 42, 0.8)", 
            backdropFilter: "blur(8px)",
            borderRadius: "12px", 
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
          }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: any) => [`${value}%`, 'Distribuição']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
