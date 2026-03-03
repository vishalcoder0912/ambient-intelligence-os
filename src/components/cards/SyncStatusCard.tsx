import { motion } from "framer-motion";
import { RefreshCw, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSyncLogs } from "@/lib/api/internal";
import { formatDistanceToNow } from "date-fns";

export function SyncStatusCard() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["sync-logs"],
    queryFn: () => fetchSyncLogs(undefined, 5),
    refetchInterval: 30000,
  });

  const latestLog = logs?.[0];
  const successCount = logs?.filter((l) => l.status === "success").length ?? 0;
  const errorCount = logs?.filter((l) => l.status === "error").length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className={`h-4 w-4 ${latestLog?.status === "error" ? "text-destructive" : "text-primary"}`} />
          <div>
            <p className="text-xs font-medium text-foreground">Sync Status</p>
            <p className="text-[10px] text-muted-foreground">
              {isLoading
                ? "Checking..."
                : latestLog
                ? `Last sync ${formatDistanceToNow(new Date(latestLog.synced_at), { addSuffix: true })}`
                : "No syncs yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">{successCount}</span>
          </div>
          {errorCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-muted-foreground">{errorCount}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
