import { motion } from "framer-motion";
import { Github, GitCommit, GitBranch, ArrowUpRight } from "lucide-react";

const mockCommits = [
  { repo: "second-brain-os", message: "Add semantic search pipeline", time: "2h ago" },
  { repo: "ml-experiments", message: "Optimize embedding generation", time: "5h ago" },
  { repo: "second-brain-os", message: "Implement pulse background", time: "1d ago" },
];

export function GitHubCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card-glow p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
            <Github className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">GitHub</h3>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </div>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-primary" />
          <span className="text-2xl font-display font-bold text-foreground">12</span>
          <span className="text-xs text-muted-foreground">commits today</span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-secondary" />
          <span className="text-sm text-muted-foreground">3 active branches</span>
        </div>
      </div>

      <div className="space-y-3">
        {mockCommits.map((commit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
          >
            <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {commit.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {commit.repo} • {commit.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
