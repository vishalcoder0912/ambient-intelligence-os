import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { LineChart, TrendingUp, Brain, Clock, Zap, Calendar } from "lucide-react";

const weeklyData = [
  { day: "Mon", commits: 8, focus: 3.5, mood: "focused" },
  { day: "Tue", commits: 12, focus: 4.2, mood: "creative" },
  { day: "Wed", commits: 6, focus: 2.8, mood: "moderate" },
  { day: "Thu", commits: 15, focus: 5.0, mood: "flow" },
  { day: "Fri", commits: 9, focus: 3.8, mood: "focused" },
  { day: "Sat", commits: 3, focus: 1.5, mood: "relaxed" },
  { day: "Sun", commits: 0, focus: 0.5, mood: "rest" },
];

const Insights = () => {
  const maxCommits = Math.max(...weeklyData.map((d) => d.commits));

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
            <LineChart className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Insights</h1>
            <p className="text-muted-foreground">
              Patterns and trends from your activity
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Weekly Commits", value: "53", change: "+12%", icon: Brain, color: "primary" },
            { label: "Focus Hours", value: "21.3h", change: "+8%", icon: Clock, color: "secondary" },
            { label: "Flow States", value: "8", change: "+3", icon: Zap, color: "glow-accent" },
            { label: "Meetings", value: "12", change: "-2", icon: Calendar, color: "muted-foreground" },
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
                <span className={`text-xs ${stat.change.startsWith("+") ? "text-primary" : "text-muted-foreground"}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Weekly Activity
              </h2>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Commits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">Focus Hours</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-4 h-48">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-40">
                  {/* Commits bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.commits / maxCommits) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                    className="w-4 rounded-t-md bg-primary/80"
                  />
                  {/* Focus bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.focus / 5) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
                    className="w-4 rounded-t-md bg-secondary/80"
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6"
          >
            <h3 className="mb-3 font-display font-semibold text-foreground">
              Productivity Pattern
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your most productive hours are between <span className="text-foreground font-medium">9 AM - 12 PM</span>. 
              Consider scheduling complex tasks during this window for optimal output.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6"
          >
            <h3 className="mb-3 font-display font-semibold text-foreground">
              Music & Focus Correlation
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ambient electronic music correlates with <span className="text-primary font-medium">23% longer</span> focus 
              sessions. Your top focus artist this week: <span className="text-foreground font-medium">Tycho</span>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Insights;
