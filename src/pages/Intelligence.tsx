import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Brain, Zap, TrendingUp, AlertTriangle, Clock, Flame, RefreshCw, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAiInsights, generateInsights, fetchProductivityMetrics } from "@/lib/api/internal";
import { formatDistanceToNow } from "date-fns";

const insightIcons: Record<string, any> = {
  weekly_report: TrendingUp,
  peak_hours: Clock,
  burnout_warning: AlertTriangle,
  flow_score: Zap,
};

const insightColors: Record<string, string> = {
  weekly_report: "text-primary",
  peak_hours: "text-secondary",
  burnout_warning: "text-destructive",
  flow_score: "text-accent",
};

const Intelligence = () => {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => fetchAiInsights(20),
  });

  const { data: metrics } = useQuery({
    queryKey: ["productivity-metrics"],
    queryFn: () => fetchProductivityMetrics(7),
  });

  const generate = useMutation({
    mutationFn: generateInsights,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-insights"] });
      queryClient.invalidateQueries({ queryKey: ["productivity-metrics"] });
    },
  });

  const latestMetric = metrics?.[0];
  const latestScore = latestMetric?.weekly_score ?? 0;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-7 w-7 text-primary" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-primary/20"
              />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                AI Intelligence
              </h1>
              <p className="text-muted-foreground">
                Ambient intelligence from your activity
              </p>
            </div>
          </div>
          <button
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate Insights
          </button>
        </div>

        {/* Score Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Intelligence Score", value: latestScore, icon: Brain, color: "primary" },
            { label: "Weekly Commits", value: latestMetric?.commit_count ?? 0, icon: Flame, color: "secondary" },
            { label: "Focus Minutes", value: latestMetric?.focus_minutes ?? 0, icon: Clock, color: "accent" },
            { label: "Streak", value: `${latestMetric?.streak ?? 0}d`, icon: Zap, color: "primary" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <stat.icon className={`h-5 w-5 text-${stat.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Insights Feed */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Insights</h2>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/30" />
            ))
          ) : !insights?.length ? (
            <div className="glass-card p-8 text-center">
              <Brain className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No insights generated yet. Click "Generate Insights" to analyze your activity.
              </p>
            </div>
          ) : (
            insights.map((insight, index) => {
              const Icon = insightIcons[insight.insight_type] || Brain;
              const color = insightColors[insight.insight_type] || "text-muted-foreground";
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${color}`} />
                      <h3 className="font-display font-semibold text-foreground">{insight.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {insight.intelligence_score !== null && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          Score: {insight.intelligence_score}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Intelligence;
