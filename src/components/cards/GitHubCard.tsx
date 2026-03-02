import { motion } from "framer-motion";
import { Github, GitCommit, GitBranch, ArrowUpRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface GitHubCommit {
  repo: string;
  message: string;
  time: string;
  sha: string;
  author?: string;
}

interface GitHubData {
  username: string;
  avatarUrl: string;
  commits: GitHubCommit[];
  todayCommitCount: number;
  activeBranches: number;
  trackedRepoCount: number;
}

function formatTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function GitHubCard() {
  const { data, isLoading, isError } = useQuery<GitHubData>({
    queryKey: ["github-activity"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-activity");
      if (error) throw error;
      return data as GitHubData;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const commits = data?.commits?.slice(0, 5) ?? [];
  const todayCount = data?.todayCommitCount ?? 0;
  const branches = data?.activeBranches ?? 0;

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
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading..." : isError ? "Connection error" : data?.username ? `@${data.username}` : "Recent activity"}
            </p>
          </div>
        </div>
        {data?.avatarUrl && (
          <img src={data.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-border" />
        )}
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-primary" />
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="text-2xl font-display font-bold text-foreground">{todayCount}</span>
              <span className="text-xs text-muted-foreground">commits today</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-secondary" />
          <span className="text-sm text-muted-foreground">{branches} branches</span>
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/30" />
          ))
        ) : commits.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No recent commits.{" "}
            {(data?.trackedRepoCount ?? 0) === 0 && "Add repos to track!"}
          </p>
        ) : (
          commits.map((commit, index) => (
            <motion.div
              key={commit.sha ?? index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.08 }}
              className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
            >
              <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {commit.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {commit.repo} • {formatTime(commit.time)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
