import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startFocusSession, endFocusSession, fetchFocusSessions } from "@/lib/api/internal";
import { useToast } from "@/hooks/use-toast";

export function useFocusSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const sessionsQuery = useQuery({
    queryKey: ["focus-sessions"],
    queryFn: () => fetchFocusSessions(10),
  });

  useEffect(() => {
    if (!activeSessionId) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [activeSessionId]);

  const start = useMutation({
    mutationFn: (label?: string) => startFocusSession(label),
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      setElapsed(0);
      toast({ title: "Focus session started" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const stop = useMutation({
    mutationFn: () => {
      if (!activeSessionId) throw new Error("No active session");
      return endFocusSession(activeSessionId);
    },
    onSuccess: (session) => {
      setActiveSessionId(null);
      setElapsed(0);
      queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
      toast({ title: "Focus session ended", description: `${session.duration_minutes} minutes recorded` });
    },
  });

  const formatElapsed = useCallback(() => {
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [elapsed]);

  return {
    sessions: sessionsQuery.data ?? [],
    isLoading: sessionsQuery.isLoading,
    isActive: !!activeSessionId,
    elapsed,
    formatElapsed,
    start,
    stop,
  };
}
