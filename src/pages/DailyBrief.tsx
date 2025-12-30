import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap, Clock, TrendingUp, Target, ArrowRight, CheckCircle2 } from "lucide-react";

const DailyBrief = () => {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl bg-primary/20"
            />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Daily Brief
            </h1>
            <p className="text-muted-foreground">
              AI-generated insights from your personal data
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Yesterday Recap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Yesterday Recap
              </h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                You had an <span className="text-foreground font-medium">exceptionally productive</span> day 
                with 12 commits pushed across your repositories. Your deep work sessions totaled 
                <span className="text-primary font-medium"> 4.2 hours</span>, primarily focused on 
                the semantic search implementation. Spotify data suggests you maintained a 
                <span className="text-secondary font-medium"> calm, focused state</span> throughout 
                the afternoon work block.
              </p>
            </div>
            
            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[
                { label: "Commits", value: "12", icon: Brain },
                { label: "Focus Time", value: "4.2h", icon: Clock },
                { label: "Flow States", value: "3", icon: Zap },
              ].map((stat, index) => (
                <div key={index} className="rounded-lg bg-muted/30 p-4 text-center">
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Today's Focus
              </h2>
            </div>
            <p className="mb-4 text-muted-foreground leading-relaxed">
              Your calendar shows 2 meetings this afternoon. Based on your productivity patterns, 
              I recommend scheduling deep work for the morning hours. The 
              <span className="text-foreground font-medium"> vector embeddings optimization</span> task 
              aligns well with your current cognitive state.
            </p>
            
            {/* Priority Tasks */}
            <div className="space-y-2">
              {[
                { task: "Complete embeddings optimization PR", priority: "high" },
                { task: "Review team feedback on search UX", priority: "medium" },
                { task: "Prepare notes for product sync", priority: "low" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
                >
                  <CheckCircle2 
                    className={`h-5 w-5 ${
                      item.priority === "high" 
                        ? "text-primary" 
                        : item.priority === "medium" 
                        ? "text-secondary" 
                        : "text-muted-foreground"
                    }`} 
                  />
                  <span className="flex-1 text-sm text-foreground">{item.task}</span>
                  <span 
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      item.priority === "high" 
                        ? "bg-primary/10 text-primary" 
                        : item.priority === "medium" 
                        ? "bg-secondary/10 text-secondary" 
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Suggested Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-glow-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Quick Actions
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Start 90-min focus session",
                "Block calendar for deep work",
                "Queue up focus playlist",
                "Set Slack to DND",
              ].map((action, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-4 text-left transition-all hover:bg-muted/50 hover:scale-[1.02]"
                >
                  <span className="text-sm font-medium text-foreground">{action}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default DailyBrief;
