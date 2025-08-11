
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, BarChart3 } from "lucide-react";
import { useAgendamentosStats } from "@/hooks/useAgendamentos";

export const StatsCards = () => {
  const { data: stats, isLoading } = useAgendamentosStats();

  const statsData = [
    {
      title: "Total de Agendamentos",
      value: isLoading ? "..." : Math.floor(stats?.totalAgendamentos || 0).toString(),
      icon: Calendar,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
    {
      title: "Agendamentos Hoje",
      value: isLoading ? "..." : Math.floor(stats?.agendamentosHoje || 0).toString(), 
      icon: Calendar,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Profissionais Ativos",
      value: isLoading ? "..." : Math.floor(stats?.profissionaisAtivos || 0).toString(),
      icon: Users,
      color: "text-yellow-400", 
      bgColor: "bg-yellow-500/20"
    },
    {
      title: "Taxa de Ocupação Diária",
      value: isLoading ? "..." : stats?.taxaOcupacao || "0%",
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-card border-border hover:bg-card/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-card-foreground mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
