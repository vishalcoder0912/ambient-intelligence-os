import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export interface GitHubAccount {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_default: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useGitHubAccounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  const query = useQuery<GitHubAccount[]>({
    queryKey: ["github-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("github_accounts")
        .select("*")
        .order("is_default", { ascending: false });
      if (error) throw error;
      return data as GitHubAccount[];
    },
  });

  const accounts = query.data ?? [];
  const defaultAccount = accounts.find((a) => a.is_default) ?? accounts[0] ?? null;
  const currentAccountId = activeAccountId ?? defaultAccount?.id ?? null;
  const currentAccount = accounts.find((a) => a.id === currentAccountId) ?? defaultAccount;

  const addAccount = useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase.functions.invoke("github-account-manage", {
        body: { action: "add", token },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["github-activity"] });
      toast({ title: "GitHub account connected" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removeAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke("github-account-manage", {
        body: { action: "remove", account_id: accountId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["github-activity"] });
      toast({ title: "GitHub account removed" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const setDefault = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke("github-account-manage", {
        body: { action: "set_default", account_id: accountId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["github-accounts"] });
      toast({ title: "Default account updated" });
    },
  });

  return {
    accounts,
    currentAccount,
    currentAccountId,
    isLoading: query.isLoading,
    setActiveAccountId,
    addAccount,
    removeAccount,
    setDefault,
  };
}
