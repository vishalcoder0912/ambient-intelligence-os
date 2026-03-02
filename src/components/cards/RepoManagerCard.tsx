import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, Check, X, GitFork, Loader2 } from "lucide-react";
import { useTrackedRepos } from "@/hooks/useTrackedRepos";

export function RepoManagerCard() {
  const { repos, isLoading, addRepo, updateRepo, deleteRepo } = useTrackedRepos();
  const [showAdd, setShowAdd] = useState(false);
  const [owner, setOwner] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");

  const handleAdd = () => {
    if (!owner.trim() || !name.trim()) return;
    addRepo.mutate(
      { repo_owner: owner.trim(), repo_name: name.trim(), description: desc.trim() },
      { onSuccess: () => { setOwner(""); setName(""); setDesc(""); setShowAdd(false); } }
    );
  };

  const handleUpdate = (id: string) => {
    updateRepo.mutate({ id, description: editDesc }, { onSuccess: () => setEditId(null) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card-glow p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
            <GitFork className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Tracked Repos</h3>
            <p className="text-xs text-muted-foreground">{repos.length} repositories</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="space-y-2 rounded-lg bg-muted/30 p-3">
              <div className="flex gap-2">
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="owner"
                  className="flex-1 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <span className="py-1.5 text-muted-foreground">/</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="repo"
                  className="flex-1 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-md bg-muted/50 px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleAdd}
                disabled={addRepo.isPending || !owner.trim() || !name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {addRepo.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Add Repository
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repo list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/30" />
          ))
        ) : repos.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No repos tracked yet. Add one above!
          </p>
        ) : (
          repos.map((repo) => (
            <motion.div
              key={repo.id}
              layout
              className="flex items-center gap-3 rounded-lg bg-muted/30 p-3"
            >
              <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1 min-w-0">
                {editId === repo.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="flex-1 rounded-md bg-muted/50 px-2 py-1 text-sm text-foreground outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(repo.id)} className="text-primary hover:text-primary/80">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium text-foreground">
                      {repo.repo_owner}/{repo.repo_name}
                    </p>
                    {repo.description && (
                      <p className="truncate text-xs text-muted-foreground">{repo.description}</p>
                    )}
                  </>
                )}
              </div>
              {editId !== repo.id && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditId(repo.id); setEditDesc(repo.description || ""); }}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRepo.mutate(repo.id)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
