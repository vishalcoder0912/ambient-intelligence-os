import { motion, AnimatePresence } from "framer-motion";
import { Github, GitCommit, GitBranch, ArrowUpRight, Loader2, ChevronDown, Plus, Star, GitPullRequest, RefreshCw, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useGitHubAccounts } from "@/hooks/useGitHubAccounts";
import { classifyCommitMessage } from "@/lib/api/github";
import { useState } from "react";

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

const commitTypeBadge: Record<string, { label: string; className: string }> = {
  feature: { label: "feat", className: "bg-primary/20 text-primary" },
  bugfix: { label: "fix", className: "bg-destructive/20 text-destructive" },
  refactor: { label: "refac", className: "bg-secondary/20 text-secondary" },
  chore: { label: "chore", className: "bg-muted text-muted-foreground" },
  other: { label: "", className: "" },
};

export function GitHubCard() {
  const { accounts, currentAccount, currentAccountId, setActiveAccountId, addAccount, removeAccount, isLoading: accountsLoading } = useGitHubAccounts();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [viewMode, setViewMode] = useState<"personal" | "combined">("combined");

  const { data, isLoading, isError, refetch } = useQuery<GitHubData>({
    queryKey: ["github-activity", currentAccountId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-activity", {
        body: currentAccountId ? { account_id: currentAccountId } : undefined,
      });
      if (error) throw error;
      return data as GitHubData;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  const commits = data?.commits?.slice(0, 5) ?? [];
  const todayCount = data?.todayCommitCount ?? 0;
  const branches = data?.activeBranches ?? 0;

  const handleAddAccount = () => {
    if (!tokenInput.trim()) return;
    addAccount.mutate(tokenInput.trim(), {
      onSuccess: () => { setTokenInput(""); setShowTokenInput(false); },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card-glow p-6"
    >
      {/* Header */}
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
        <div className="flex items-center gap-2">
          {/* Account Switcher */}
          {accounts.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowSwitcher(!showSwitcher)}
                className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {currentAccount?.avatar_url && (
                  <img src={currentAccount.avatar_url} alt="" className="h-4 w-4 rounded-full" />
                )}
                <span>{currentAccount?.username || "Select"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              <AnimatePresence>
                {showSwitcher && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg"
                  >
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => { setActiveAccountId(acc.id); setShowSwitcher(false); }}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-muted ${
                          acc.id === currentAccountId ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                      >
                        {acc.avatar_url && <img src={acc.avatar_url} alt="" className="h-4 w-4 rounded-full" />}
                        <span className="flex-1 text-left">{acc.username}</span>
                        {acc.is_default && <span className="text-[10px] text-muted-foreground">default</span>}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeAccount.mutate(acc.id); }}
                          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </button>
                    ))}
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => { setShowTokenInput(true); setShowSwitcher(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      Add account
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {data?.avatarUrl && !accounts.length && (
            <img src={data.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-border" />
          )}

          <button onClick={() => refetch()} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Add Token Input */}
      <AnimatePresence>
        {showTokenInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="space-y-2 rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Enter a GitHub Personal Access Token:</p>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_..."
                className="w-full rounded-md bg-muted/50 px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddAccount}
                  disabled={addAccount.isPending || !tokenInput.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {addAccount.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Connect
                </button>
                <button
                  onClick={() => { setShowTokenInput(false); setTokenInput(""); }}
                  className="rounded-md bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No accounts prompt */}
      {!accountsLoading && accounts.length === 0 && !showTokenInput && (
        <button
          onClick={() => setShowTokenInput(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Connect a GitHub account
        </button>
      )}

      {/* Stats Row */}
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

      {/* Commit List */}
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
          commits.map((commit, index) => {
            const type = classifyCommitMessage(commit.message);
            const badge = commitTypeBadge[type];
            return (
              <motion.div
                key={commit.sha ?? index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="flex items-start gap-3 rounded-lg bg-muted/30 p-3"
              >
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {commit.message}
                    </p>
                    {badge.label && (
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {commit.repo} • {formatTime(commit.time)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
