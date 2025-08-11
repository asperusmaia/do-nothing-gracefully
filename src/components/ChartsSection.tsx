
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer, ComposedChart } from "recharts";
import { useChartsData } from "@/hooks/useChartsData";

const chartConfig = {
  agendamentos: {
    label: "Agendamentos",
    color: "hsl(var(--primary))",
  },
  status: {
    label: "Status",
    color: "hsl(var(--primary))",
  },
  performance: {
    label: "Performance",
    color: "hsl(var(--primary))",
  },
};

export const ChartsSection = () => {
  const { data: chartData, isLoading } = useChartsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Distribuição por Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Distribuição por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData?.statusData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData?.statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center mt-4 space-x-4">
            {chartData?.statusData?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Horários de Pico */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">
            Horários de Pico
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Horários mais procurados (dados históricos)
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart 
                 data={chartData?.horariosPicoData || []} 
                 margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis 
                   dataKey="hora"
                   stroke="hsl(var(--muted-foreground))"
                   fontSize={12}
                   axisLine={false}
                   tickLine={false}
                   label={{ value: 'Hora do Dia', position: 'insideBottom', offset: -10 }}
                 />
                 <YAxis 
                   stroke="hsl(var(--muted-foreground))"
                   fontSize={12}
                   axisLine={false}
                   tickLine={false}
                   label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }}
                 />
                 <Line 
                   type="monotone"
                   dataKey="agendamentos" 
                   stroke="hsl(var(--primary))"
                   strokeWidth={2}
                   dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                   activeDot={{ r: 6 }}
                 />
                 <ChartTooltip 
                   formatter={(value) => [`${value} agendamentos`, 'Quantidade']}
                   labelFormatter={(label) => `Horário: ${label}`}
                 />
               </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Performance por Profissional - Ocupa toda a largura e centralizado */}
      <Card className="bg-card border-border col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground text-center">
            Performance por Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-4xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData?.performanceData || []} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ 
                    value: 'Serviços\nRealizados', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Bar 
                  dataKey="agendamentos" 
                  radius={[4, 4, 0, 0]}
                  className="transition-all duration-300 hover:opacity-80"
                >
                  {chartData?.performanceData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                 <ChartTooltip 
                   formatter={(value) => [`${Math.floor(Number(value))} serviços`, 'Total']}
                   labelFormatter={(label) => `Profissional: ${label}`}
                 />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
