import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

export function DailyBriefCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass-card relative overflow-hidden p-6"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-xl bg-primary/20"
            />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              AI Daily Brief
            </h3>
            <p className="text-xs text-muted-foreground">Generated locally</p>
          </div>
        </div>

        {/* Yesterday Summary */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Yesterday</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You had a <span className="text-foreground font-medium">highly productive</span> day 
            with 12 commits across 3 repositories. Spent 4.2 hours in deep focus mode, 
            mostly working on the semantic search pipeline. Your listening patterns suggest 
            you were in a <span className="text-foreground font-medium">creative flow state</span>.
          </p>
        </div>

        {/* Today Focus */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Today's Focus</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Based on your calendar, you have 2 meetings this afternoon. I recommend 
            prioritizing deep work this morning. Consider tackling the 
            <span className="text-foreground font-medium"> vector embeddings optimization</span> task 
            while you're fresh.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <Zap className="h-4 w-4 text-glow-accent" />
            Suggested Actions
          </h4>
          {[
            "Start 2-hour focus block for embeddings work",
            "Review PR #42 before standup",
            "Block 30min for meeting prep at 1:30 PM",
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex w-full items-center justify-between rounded-lg bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
            >
              <span className="text-sm text-foreground">{action}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
