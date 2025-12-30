import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Github, Music2, Calendar, Database, Shield, Cpu, Bell } from "lucide-react";

const integrations = [
  { name: "GitHub", icon: Github, connected: true, description: "Sync commits and activity" },
  { name: "Spotify", icon: Music2, connected: true, description: "Track listening patterns" },
  { name: "Google Calendar", icon: Calendar, connected: false, description: "Import events and meetings" },
];

const Settings = () => {
  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <SettingsIcon className="h-7 w-7 text-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure your Second Brain OS
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Integrations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              Data Sources
            </h2>
            <div className="space-y-3">
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
                      <integration.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      integration.connected
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {integration.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Local AI Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Local AI Engine
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Model</p>
                  <p className="text-xs text-muted-foreground">Select local LLM for inference</p>
                </div>
                <select className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-sm text-foreground">
                  <option>Llama-3 8B</option>
                  <option>Mistral 7B</option>
                  <option>Phi-3 Mini</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Status</p>
                  <p className="text-xs text-muted-foreground">Model loading state</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm text-primary">Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Privacy & Storage
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Local Storage</p>
                  <p className="text-xs text-muted-foreground">Data stored in browser</p>
                </div>
                <span className="text-sm text-foreground">128 MB used</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Cloud Sync</p>
                  <p className="text-xs text-muted-foreground">All data stays local</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  Disabled
                </span>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-glow-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Daily Brief", description: "Morning summary notification", enabled: true },
                { label: "Focus Reminders", description: "Break and stretch alerts", enabled: false },
                { label: "Sync Alerts", description: "Data sync status updates", enabled: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      item.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        item.enabled ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Settings;
