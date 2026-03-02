import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrackedRepo {
  id: string;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export function useTrackedRepos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery<TrackedRepo[]>({
    queryKey: ["tracked-repos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracked_repos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TrackedRepo[];
    },
  });

  const addRepo = useMutation({
    mutationFn: async ({ repo_owner, repo_name, description }: { repo_owner: string; repo_name: string; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tracked_repos")
        .insert({ user_id: user.id, repo_owner, repo_name, description: description || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-repos"] });
      queryClient.invalidateQueries({ queryKey: ["github-activity"] });
      toast({ title: "Repo added", description: "Repository is now being tracked." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateRepo = useMutation({
    mutationFn: async ({ id, description }: { id: string; description: string }) => {
      const { data, error } = await supabase
        .from("tracked_repos")
        .update({ description, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-repos"] });
      toast({ title: "Repo updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteRepo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tracked_repos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-repos"] });
      queryClient.invalidateQueries({ queryKey: ["github-activity"] });
      toast({ title: "Repo removed" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return { repos: query.data ?? [], isLoading: query.isLoading, addRepo, updateRepo, deleteRepo };
}
