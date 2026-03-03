import { motion } from "framer-motion";
import { Timer, Play, Square, Clock, Zap } from "lucide-react";
import { useFocusSession } from "@/hooks/useFocusSession";

export function FocusCard() {
  const { sessions, isActive, elapsed, formatElapsed, start, stop, isLoading } = useFocusSession();

  const totalFocusToday = sessions
    .filter((s) => {
      const today = new Date().toISOString().split("T")[0];
      return s.started_at.startsWith(today);
    })
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card-glow p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
            <Timer className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Focus Mode</h3>
            <p className="text-xs text-muted-foreground">Deep work tracker</p>
          </div>
        </div>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Active</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="mb-4 flex flex-col items-center justify-center rounded-xl bg-muted/30 p-6">
        <motion.span
          key={elapsed}
          className="font-display text-4xl font-bold text-foreground tabular-nums"
        >
          {formatElapsed()}
        </motion.span>
        <p className="mt-1 text-xs text-muted-foreground">
          {isActive ? "Focus session in progress" : "Ready to focus"}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-4 flex gap-2">
        {!isActive ? (
          <button
            onClick={() => start.mutate("Deep Work")}
            disabled={start.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Start Focus Session
          </button>
        ) : (
          <button
            onClick={() => stop.mutate()}
            disabled={stop.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            <Square className="h-4 w-4" />
            End Session
          </button>
        )}
      </div>

      {/* Today's Stats */}
      <div className="flex items-center gap-4 rounded-lg bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">{totalFocusToday}m</span>
          <span className="text-xs text-muted-foreground">today</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-secondary" />
          <span className="text-sm text-foreground font-medium">
            {sessions.filter((s) => s.started_at.startsWith(new Date().toISOString().split("T")[0])).length}
          </span>
          <span className="text-xs text-muted-foreground">sessions</span>
        </div>
      </div>
    </motion.div>
  );
}
