import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GitHubCard } from "@/components/cards/GitHubCard";
import { RepoManagerCard } from "@/components/cards/RepoManagerCard";
import { SpotifyCard } from "@/components/cards/SpotifyCard";
import { CalendarCard } from "@/components/cards/CalendarCard";
import { DailyBriefCard } from "@/components/cards/DailyBriefCard";
import { FocusCard } from "@/components/cards/FocusCard";
import { SyncStatusCard } from "@/components/cards/SyncStatusCard";
import { Search, Command, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <MainLayout>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground"
          >
            {currentDate}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl font-bold text-foreground"
          >
            Good morning, <span className="gradient-text">{user?.email?.split("@")[0] || "Developer"}</span>
          </motion.h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5 backdrop-blur-sm"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search your mind...</span>
            <div className="ml-8 flex items-center gap-1 rounded-md bg-background/50 px-2 py-1">
              <Command className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">K</span>
            </div>
          </motion.div>

          <button
            onClick={signOut}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <GitHubCard />
            <RepoManagerCard />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <FocusCard />
            <CalendarCard />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <SpotifyCard />
            <DailyBriefCard />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-1">
          <DailyBriefCard />
          <SyncStatusCard />
        </div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 glass-card p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Cognitive Load</p>
              <div className="flex items-center gap-2">
                <span className="pulse-indicator calm" />
                <span className="text-sm font-medium text-foreground">Low</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Focus Score</p>
              <p className="text-sm font-medium text-foreground">87%</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Sync Status</p>
              <p className="text-sm font-medium text-primary">All Synced</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Tracking {user?.email?.split("@")[0]}'s repos
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
